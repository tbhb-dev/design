// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

// Serves every dev server of design.tbhb.dev behind one local port, at the
// paths the published site uses: the Astro site at / and each Storybook
// under its own prefix. Each server runs at its prefix as its base path, so
// a request is forwarded with its path unchanged, and WebSocket upgrades
// (Vite's HMR) are forwarded too.
//
// `bazel run //dev -- --port 4300` starts it. It never prompts or opens a
// browser, prints one "ready" line once every server answers, and on
// SIGINT or SIGTERM stops every server and exits 0. When a server exits on
// its own, it stops the rest and exits 1.
//
// The routes come from DEV_ROUTES, which the js_binary bakes in as
// `<prefix>=<dev binary>` pairs split on ";", so the binary keeps them when
// a program starts it directly; arguments of the same form add more.
//
// Usage: proxy.mjs [--port N] [--host H] [<prefix>=<dev binary> ...]

import { spawn } from "node:child_process";
import { request, createServer } from "node:http";
import { connect, createServer as createNetServer } from "node:net";
import { join } from "node:path";

const READY_TIMEOUT_MS = 120_000;
const STOP_TIMEOUT_MS = 10_000;

function parseArgs(argv) {
  const options = { port: 4300, host: "127.0.0.1", routes: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const flag = /^--(port|host)(?:=(.*))?$/.exec(arg);
    if (flag) {
      const value = flag[2] ?? argv[++i];
      if (!value) {
        throw new Error(`proxy: --${flag[1]} needs a value`);
      }
      options[flag[1]] = flag[1] === "port" ? Number(value) : value;
      continue;
    }
    const route = /^(\/[^=]*)=(.+)$/.exec(arg);
    if (!route) {
      throw new Error(`proxy: unknown argument ${arg}`);
    }
    options.routes.push({ prefix: route[1], binary: route[2] });
  }
  if (!Number.isInteger(options.port) || options.port <= 0) {
    throw new Error(`proxy: --port must be a positive integer`);
  }
  // Longest prefix first, so /storybook/react/ wins over /.
  options.routes.sort((a, b) => b.prefix.length - a.prefix.length);
  return options;
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = createNetServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

// Each dev binary is a js_binary in this binary's runfiles; its own
// runfiles are part of these.
function runfilesPath(rlocation) {
  const root = process.env.JS_BINARY__RUNFILES ?? process.env.RUNFILES_DIR;
  return join(root, rlocation);
}

function prefixLines(name, stream, out) {
  let rest = "";
  stream.on("data", (chunk) => {
    const lines = (rest + chunk).split("\n");
    rest = lines.pop();
    for (const line of lines) {
      out.write(`[${name}] ${line}\n`);
    }
  });
}

async function waitUntilServing(route) {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const status = await new Promise((resolve) => {
      const req = request(
        { host: "127.0.0.1", port: route.port, path: route.prefix },
        (res) => {
          res.resume();
          resolve(res.statusCode);
        },
      );
      req.on("error", () => resolve(0));
      req.end();
    });
    if (status > 0 && status < 500) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(
    `proxy: ${route.prefix} didn't answer within ${READY_TIMEOUT_MS / 1000}s`,
  );
}

function start(route) {
  // Every dev target takes its port, host and base from the environment;
  // the Astro and Storybook rules read the same three names.
  const child = spawn(runfilesPath(route.binary), [], {
    env: {
      ...process.env,
      ASTRO_PORT: String(route.port),
      ASTRO_HOST: "127.0.0.1",
      ASTRO_BASE: route.prefix,
      STORYBOOK_PORT: String(route.port),
      STORYBOOK_HOST: "127.0.0.1",
      STORYBOOK_BASE: route.prefix,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  prefixLines(route.prefix, child.stdout, process.stdout);
  prefixLines(route.prefix, child.stderr, process.stderr);
  route.child = child;
  route.exited = new Promise((resolve) => child.on("exit", resolve));
}

function routeFor(routes, url) {
  return routes.find(
    (r) => url.startsWith(r.prefix) || `${url}/` === r.prefix,
  );
}

function forward(routes, req, res) {
  const route = routeFor(routes, req.url);
  if (!route) {
    res.writeHead(404).end();
    return;
  }
  // /storybook/react has no trailing slash: send the browser to the
  // prefix, as the published site's static hosting does.
  if (`${req.url}/` === route.prefix) {
    res.writeHead(301, { location: route.prefix }).end();
    return;
  }
  const upstream = request(
    {
      host: "127.0.0.1",
      port: route.port,
      method: req.method,
      path: req.url,
      headers: req.headers,
    },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode, upstreamRes.headers);
      upstreamRes.pipe(res);
    },
  );
  upstream.on("error", () => {
    if (!res.headersSent) {
      res.writeHead(502);
    }
    res.end();
  });
  req.pipe(upstream);
}

function forwardUpgrade(routes, req, socket, head) {
  const route = routeFor(routes, req.url);
  if (!route) {
    socket.destroy();
    return;
  }
  const upstream = connect(route.port, "127.0.0.1", () => {
    const headers = Object.entries(req.headers)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\r\n");
    upstream.write(
      `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n${headers}\r\n\r\n`,
    );
    upstream.write(head);
    socket.pipe(upstream).pipe(socket);
  });
  upstream.on("error", () => socket.destroy());
  socket.on("error", () => upstream.destroy());
}

async function stopAll(routes) {
  for (const route of routes) {
    route.child?.kill("SIGTERM");
  }
  const timeout = setTimeout(() => {
    for (const route of routes) {
      route.child?.kill("SIGKILL");
    }
  }, STOP_TIMEOUT_MS);
  await Promise.all(routes.map((r) => r.exited));
  clearTimeout(timeout);
}

const options = parseArgs([
  ...(process.env.DEV_ROUTES ?? "").split(";").filter(Boolean),
  ...process.argv.slice(2),
]);
if (options.routes.length === 0) {
  throw new Error("proxy: no routes; set DEV_ROUTES or pass <prefix>=<binary>");
}
const { routes } = options;
for (const route of routes) {
  route.port = await freePort();
  start(route);
}

let stopping = false;
async function shutdown(code) {
  if (stopping) {
    return;
  }
  stopping = true;
  server.close();
  await stopAll(routes);
  process.exit(code);
}

for (const route of routes) {
  route.exited.then((code) => {
    if (!stopping) {
      console.error(
        `proxy: the ${route.prefix} server exited (${code}); stopping the rest`,
      );
      shutdown(1);
    }
  });
}
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

const server = createServer((req, res) => forward(routes, req, res));
server.on("upgrade", (req, socket, head) =>
  forwardUpgrade(routes, req, socket, head),
);
await new Promise((resolve) =>
  server.listen(options.port, options.host, resolve),
);

try {
  await Promise.all(routes.map(waitUntilServing));
} catch (error) {
  console.error(error.message);
  await shutdown(1);
}
const base = `http://${options.host}:${options.port}`;
console.log(
  `proxy: ready at ${base}/ (${routes
    .map((r) => r.prefix)
    .sort()
    .join(", ")})`,
);

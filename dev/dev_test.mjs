// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

// Runs //dev:dev over a copy of every server's sources, the way `bazel run`
// would in a workspace: a bad argument is refused, then the proxy prints its
// ready line, serves the site at / and each Storybook at its prefix, and
// exits 0 on SIGTERM.
//
// Usage: dev_test.mjs <dev binary>, with WORKSPACE_FILES listing the site's
// sources.

import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join } from "node:path";

const [devBin] = process.argv.slice(2);
const files = (process.env.WORKSPACE_FILES ?? "").split(" ").filter(Boolean);
const failures = [];

const workspace = join(process.env.TEST_TMPDIR, "workspace");
for (const file of files) {
  const dest = join(workspace, file);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, readFileSync(file));
}

function start(args) {
  const child = spawn(devBin, args, {
    env: {
      ...process.env,
      BAZEL_BINDIR: ".",
      BUILD_WORKSPACE_DIRECTORY: workspace,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
    process.stdout.write(chunk);
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
    process.stderr.write(chunk);
  });
  const exited = new Promise((resolve) =>
    child.on("exit", (code) => resolve(code)),
  );
  return { child, exited, output: () => ({ stdout, stderr }) };
}

function freePort() {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function within(promise, ms, label) {
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve(label), ms);
  });
  const result = await Promise.race([promise, timeout]);
  clearTimeout(timer);
  return result;
}

// A bad argument: refused before any server starts.
{
  const { child, exited, output } = start(["--bogus"]);
  const code = await within(exited, 30_000, "timeout");
  if (code === "timeout") {
    child.kill("SIGKILL");
  }
  if (code === 0 || !output().stderr.includes("unknown argument --bogus")) {
    failures.push(`bad argument: expected a refusal, got exit ${code}`);
  }
}

// The proxy itself.
const port = await freePort();
const { child, exited, output } = start([`--port=${port}`]);
const ready = new Promise((resolve) => {
  const check = setInterval(() => {
    if (output().stdout.includes("proxy: ready")) {
      clearInterval(check);
      resolve("ready");
    }
  }, 100);
  exited.then(() => {
    clearInterval(check);
    resolve("exited");
  });
});
const state = await within(ready, 120_000, "timeout");
if (state !== "ready") {
  failures.push(`proxy: expected a ready line, got ${state}`);
} else {
  const res = await fetch(`http://127.0.0.1:${port}/`);
  const body = await res.text();
  if (res.status !== 200 || !body.includes("tbhb.dev design system")) {
    failures.push(
      `GET /: expected 200 with the site's heading, got ${res.status}`,
    );
  }
  for (const framework of ["astro", "html", "react", "web-components"]) {
    const prefix = `/storybook/${framework}/`;
    const sb = await fetch(`http://127.0.0.1:${port}${prefix}`);
    await sb.text();
    if (sb.status !== 200) {
      failures.push(`GET ${prefix}: expected 200, got ${sb.status}`);
    }
    const bare = await fetch(`http://127.0.0.1:${port}${prefix.slice(0, -1)}`, {
      redirect: "manual",
    });
    if (bare.status !== 301 || bare.headers.get("location") !== prefix) {
      failures.push(
        `GET ${prefix.slice(0, -1)}: expected a 301 to ${prefix}, got ${bare.status}`,
      );
    }
  }
}
child.kill("SIGTERM");
const code = await within(exited, 30_000, "timeout");
if (code !== 0) {
  child.kill("SIGKILL");
  failures.push(`SIGTERM: expected exit 0, got ${code}`);
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(
  "dev_test: refused a bad argument, served / and every Storybook, exited 0 on SIGTERM",
);

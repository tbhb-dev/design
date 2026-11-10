// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

export function parseArgs(argv) {
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

export function routeFor(routes, url) {
  return routes.find((r) => url.startsWith(r.prefix) || `${url}/` === r.prefix);
}

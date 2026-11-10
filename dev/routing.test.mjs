// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import { expect, it } from "vitest";
import { parseArgs, routeFor } from "./routing.mjs";

it("uses the loopback defaults", () => {
  expect(parseArgs([])).toEqual({ port: 4300, host: "127.0.0.1", routes: [] });
});
it("accepts both flag spellings and orders routes by specificity", () => {
  expect(
    parseArgs([
      "/=site",
      "--port",
      "5000",
      "/storybook/react/=react",
      "--host=localhost",
      "/storybook/=all",
    ]),
  ).toEqual({
    port: 5000,
    host: "localhost",
    routes: [
      { prefix: "/storybook/react/", binary: "react" },
      { prefix: "/storybook/", binary: "all" },
      { prefix: "/", binary: "site" },
    ],
  });
  expect(parseArgs(["--port=1", "--host", "localhost"]).port).toBe(1);
  expect(parseArgs(["--host", "localhost"]).host).toBe("localhost");
});
it.each(["--port", "--host", "--port=", "--host="])(
  "rejects missing values for %s",
  (arg) => {
    expect(() => parseArgs([arg])).toThrow(
      `proxy: ${arg.replace("=", "")} needs a value`,
    );
  },
);
it.each(["0", "-1", "1.5", "NaN", "Infinity"])(
  "rejects invalid port %s",
  (value) => {
    expect(() => parseArgs([`--port=${value}`])).toThrow(
      "proxy: --port must be a positive integer",
    );
  },
);
it.each([
  "--bogus",
  "relative=bin",
  "relative/path=bin",
  "/a=b\nextra",
  "/empty=",
  "/only",
  "--ports=5",
  "x--port=5",
  "/a=b=c",
])("validates argument %s", (arg) => {
  if (arg === "/a=b=c") {
    expect(parseArgs([arg]).routes).toEqual([{ prefix: "/a", binary: "b=c" }]);
  } else {
    expect(() => parseArgs([arg])).toThrow(`proxy: unknown argument ${arg}`);
  }
});
it("matches complete prefixes and redirects without a trailing slash, then falls back to root", () => {
  const { routes } = parseArgs(["/=site", "/storybook/react/=react"]);
  expect(routeFor(routes, "/storybook/react/?args=1")).toEqual({
    prefix: "/storybook/react/",
    binary: "react",
  });
  expect(routeFor(routes, "/storybook/react")).toEqual({
    prefix: "/storybook/react/",
    binary: "react",
  });
  expect(routeFor(routes, "/storybook/reactive/")).toEqual({
    prefix: "/",
    binary: "site",
  });
  expect(routeFor(routes, "/")).toEqual({ prefix: "/", binary: "site" });
  expect(routeFor(routes.slice(0, 1), "/missing")).toBeUndefined();
  expect(routeFor([], "/")).toBeUndefined();
});

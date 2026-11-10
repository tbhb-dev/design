// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import { readFileSync, writeFileSync } from "node:fs";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("node:fs", () => ({ readFileSync: vi.fn(), writeFileSync: vi.fn() }));
const argv = process.argv;
afterEach(() => {
  process.argv = argv;
  vi.resetModules();
  vi.resetAllMocks();
});

it("writes an importable module with merged palette values", async () => {
  process.argv = [
    "node",
    "palettes_js.mjs",
    "out.js",
    "blue.light.tokens.json",
  ];
  const value = { colorSpace: "oklch", components: [0, 0, 0], hex: "#000000" };
  vi.mocked(readFileSync).mockReturnValue(
    JSON.stringify({ palette: { blue: { 1: { $value: value } } } }),
  );
  await import("./palettes_js.mjs");
  expect(readFileSync).toHaveBeenCalledExactlyOnceWith(
    "blue.light.tokens.json",
    "utf8",
  );
  expect(writeFileSync).toHaveBeenCalledExactlyOnceWith(
    "out.js",
    `export default ${JSON.stringify({ light: { blue: { 1: { ...value, p3: [0, 0, 0] } } }, dark: {} })};\n`,
  );
});

it("writes empty modes when no palette files are supplied", async () => {
  process.argv = ["node", "palettes_js.mjs", "empty.js"];
  await import("./palettes_js.mjs");
  expect(readFileSync).not.toHaveBeenCalled();
  expect(writeFileSync).toHaveBeenCalledExactlyOnceWith(
    "empty.js",
    'export default {"light":{},"dark":{}};\n',
  );
});

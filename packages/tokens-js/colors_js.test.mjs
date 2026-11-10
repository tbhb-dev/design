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

it("writes a module of semantic color groups from the requested file", async () => {
  process.argv = ["node", "colors_js.mjs", "out.js", "semantic.tokens.json"];
  vi.mocked(readFileSync).mockReturnValue(
    JSON.stringify({ color: { text: { $value: "{role.neutral.12}" } } }),
  );
  await import("./colors_js.mjs");
  expect(readFileSync).toHaveBeenCalledExactlyOnceWith(
    "semantic.tokens.json",
    "utf8",
  );
  expect(writeFileSync).toHaveBeenCalledExactlyOnceWith(
    "out.js",
    'export default [{"name":"color","tokens":[{"name":"text","property":"--tbhb-color-text"}]}];\n',
  );
});

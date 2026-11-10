// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import { expect, it } from "vitest";
import { mergePalettes, p3 } from "./palette-values.mjs";

it.each([
  [
    [0.7, 0.4, 40],
    [1, 0, 0],
  ],
  [
    [0.4, 0.2, 140],
    [0.043, 0.358, 0],
  ],
  [
    [0.7, 0.4, 320],
    [0.913, 0, 1],
  ],
  [
    [0.15, 0.02, 90],
    [0.054, 0.043, 0.015],
  ],
  [
    [0, 0, 0],
    [0, 0, 0],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0.5, 0, 0],
    [0.389, 0.389, 0.389],
  ],
  [
    [0.02, 0, 0],
    [0, 0, 0],
  ],
  [
    [0.1, 0, 0],
    [0.013, 0.013, 0.013],
  ],
  [
    [0.6, 0.2, 250],
    [0.129, 0.497, 0.913],
  ],
])("converts oklch %j to rounded Display P3", (components, expected) => {
  expect(p3(components)).toEqual(expected);
});

it("merges light and dark scales, retaining token metadata and skipping group metadata", () => {
  const value = {
    colorSpace: "oklch",
    components: [0.5, 0, 0],
    hex: "#636363",
    alpha: 0.5,
  };
  const group = { $type: "color", 1: { $value: value }, a1: { $value: value } };
  const color = { ...value, p3: [0.389, 0.389, 0.389] };
  expect(
    mergePalettes([
      { file: "blue.light.tokens.json", palette: { blue: group } },
      { file: "red.dark.tokens.json", palette: { red: group } },
      { file: "green.dark.tokens.json.backup", palette: { green: group } },
    ]),
  ).toEqual({
    light: { blue: { 1: color, a1: color }, green: { 1: color, a1: color } },
    dark: { red: { 1: color, a1: color } },
  });
  expect(mergePalettes([])).toEqual({ light: {}, dark: {} });
});

// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import type { Color } from "@tbhb-dev/tokens-js/palettes.js";
import { expect, it } from "vitest";
import { displayP3, oklch, srgb } from "./swatch-values.ts";

const solid: Color = {
  colorSpace: "oklch",
  components: [0.6, 0.2, 250],
  hex: "#123abc",
  p3: [0.1, 0.25, 0.9],
};

it("formats opaque colors without an alpha suffix", () => {
  expect(oklch(solid)).toBe("oklch(0.6 0.2 250)");
  expect(displayP3(solid)).toBe("color(display-p3 0.1 0.25 0.9)");
  expect(srgb(solid)).toBe("#123abc");
});

it.each([
  [0, "00"],
  [0.01, "03"],
  [0.5, "80"],
  [1, "ff"],
])("preserves alpha %s in each native format", (alpha, byte) => {
  const color = { ...solid, alpha };
  expect(oklch(color)).toBe(`oklch(0.6 0.2 250 / ${String(alpha)})`);
  expect(displayP3(color)).toBe(
    `color(display-p3 0.1 0.25 0.9 / ${String(alpha)})`,
  );
  expect(srgb(color)).toBe(`#123abc${byte}`);
});

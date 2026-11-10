// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import { describe, expect, it } from "vitest";
import {
  COLOR_SCALES,
  COLORS,
  label,
  SCALES,
  STEPS,
  swatchName,
  swatchStep,
  USES,
  variable,
} from "./palette.ts";

describe("palette catalog", () => {
  it("keeps Radix scales and their twelve steps in display order", () => {
    expect(SCALES).toEqual([
      "gray",
      "mauve",
      "slate",
      "sage",
      "olive",
      "sand",
      "tomato",
      "red",
      "ruby",
      "crimson",
      "pink",
      "plum",
      "purple",
      "violet",
      "iris",
      "indigo",
      "blue",
      "cyan",
      "teal",
      "jade",
      "green",
      "grass",
      "bronze",
      "gold",
      "brown",
      "orange",
      "amber",
      "yellow",
      "lime",
      "mint",
      "sky",
    ]);
    expect(STEPS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(USES).toEqual([
      { name: "Backgrounds", steps: 2 },
      { name: "Interactive components", steps: 3 },
      { name: "Borders and separators", steps: 3 },
      { name: "Solid colors", steps: 2 },
      { name: "Accessible text", steps: 2 },
    ]);
    expect(COLORS).toBe(
      "Every scale in the palette library, in the current mode. Switch between the solid and alpha scales, and select a swatch for its values. Alpha steps sit over a checkerboard, so their transparency shows.",
    );
    expect(COLOR_SCALES).toBe(
      "Each scale's steps as Radix publishes them: solid and alpha, light and dark, whatever the toolbar's mode.",
    );
  });
  it("formats names, including empty and already capitalized labels", () => {
    expect(label("blue")).toBe("Blue");
    expect(label("Blue")).toBe("Blue");
    expect(label("")).toBe("");
    expect(variable("blue", 9)).toBe("--tbhb-palette-blue-9");
    expect(variable("red", 12, false)).toBe("--tbhb-palette-red-12");
    expect(variable("blue", 9, true)).toBe("--tbhb-palette-blue-a9");
    expect(swatchName("blue", 9, false)).toBe("Blue 9");
    expect(swatchName("red", 12, true)).toBe("Red A12");
    expect(swatchStep(9, false)).toBe("9");
    expect(swatchStep(12, true)).toBe("a12");
  });
});

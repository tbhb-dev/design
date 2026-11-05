// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

// The palette library's Radix scales, grays first, then by hue as
// radix-ui.com/colors orders them.
export const SCALES = [
  "gray", "mauve", "slate", "sage", "olive", "sand",
  "tomato", "red", "ruby", "crimson", "pink", "plum", "purple", "violet",
  "iris", "indigo", "blue", "cyan", "teal", "jade", "green", "grass",
  "bronze", "gold", "brown", "orange", "amber", "yellow", "lime", "mint", "sky",
];

export const STEPS = Array.from({ length: 12 }, (_, i) => i + 1);

// What each run of steps is for.
export const USES = [
  { name: "Backgrounds", steps: 2 },
  { name: "Interactive components", steps: 3 },
  { name: "Borders and separators", steps: 3 },
  { name: "Solid colors", steps: 2 },
  { name: "Accessible text", steps: 2 },
];

export const label = (scale: string) => scale[0].toUpperCase() + scale.slice(1);

// A step's custom property: `--palette-blue-9`, or `--palette-blue-a9`.
export const variable = (scale: string, step: number, alpha = false) =>
  `--palette-${scale}-${alpha ? "a" : ""}${step}`;

export const COLORS =
  "Every scale in the palette library, in the current mode. Switch between the solid and alpha scales, and hover a swatch for its custom property.";

export const COLOR_SCALES =
  "Each scale's steps as Radix publishes them: solid and alpha, light and dark, whatever the toolbar's mode.";

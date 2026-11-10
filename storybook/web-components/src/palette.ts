// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

// The palette library's Radix scales, grays first, then by hue as
// radix-ui.com/colors orders them.
export const SCALES = [
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

export const label = (scale: string) =>
  scale.charAt(0).toUpperCase() + scale.slice(1);

// A step's custom property: `--tbhb-palette-blue-9`, or `--tbhb-palette-blue-a9`.
export const variable = (scale: string, step: number, alpha = false) =>
  `--tbhb-palette-${scale}-${alpha ? "a" : ""}${String(step)}`;

export const COLORS =
  "Every scale in the palette library, in the current mode. Switch between the solid and alpha scales, and select a swatch for its values. Alpha steps sit over a checkerboard, so their transparency shows.";

export const COLOR_SCALES =
  "Each scale's steps as Radix publishes them: solid and alpha, light and dark, whatever the toolbar's mode.";

// A swatch's accessible name and its data-step: "Blue A9" and "a9".
export const swatchName = (scale: string, step: number, alpha: boolean) =>
  `${label(scale)} ${alpha ? "A" : ""}${String(step)}`;

export const swatchStep = (step: number, alpha: boolean) =>
  `${alpha ? "a" : ""}${String(step)}`;

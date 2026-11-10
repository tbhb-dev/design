// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

/** One palette step: oklch components, alpha below 1 only, sRGB hex, and Display P3 channels. */
export type Color = {
  colorSpace: "oklch";
  components: [number, number, number];
  alpha?: number;
  hex: string;
  p3: [number, number, number];
};

/** Mode, then scale, then step ("1" to "12", "a1" to "a12"). */
export type Palettes = Record<"light" | "dark", Record<string, Record<string, Color>>>;

declare const palettes: Palettes;
export default palettes;

// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import type { Color } from "@tbhb-dev/tokens-js/palettes.js";

const over = (alpha?: number) =>
  alpha === undefined ? "" : ` / ${String(alpha)}`;

export const oklch = ({ components: [l, c, h], alpha }: Color) =>
  `oklch(${String(l)} ${String(c)} ${String(h)}${over(alpha)})`;

// Display P3 and sRGB, the spaces native apps take: SwiftUI's
// Color(.displayP3, ...), Android's ColorSpace.Named.DISPLAY_P3, and sRGB
// hex everywhere. An alpha step's hex gains its alpha as a fourth byte.
export const displayP3 = ({ p3: [r, g, b], alpha }: Color) =>
  `color(display-p3 ${String(r)} ${String(g)} ${String(b)}${over(alpha)})`;

export const srgb = ({ hex, alpha }: Color) =>
  alpha === undefined
    ? hex
    : `${hex}${Math.round(alpha * 255)
        .toString(16)
        .padStart(2, "0")}`;

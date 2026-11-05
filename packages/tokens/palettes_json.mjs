// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

// Merges the palette token files into palettes.json, the values the
// Storybooks' Colors page shows for a swatch:
// {"light": {"blue": {"1": {colorSpace, components, hex}, "a1": {...}}}, "dark": {...}}
// Usage: palettes_json.mjs <out> <palette file>...

import { readFileSync, writeFileSync } from "node:fs";

const [out, ...files] = process.argv.slice(2);
const merged = { light: {}, dark: {} };
for (const file of files) {
  const mode = file.endsWith(".dark.tokens.json") ? "dark" : "light";
  const { palette } = JSON.parse(readFileSync(file, "utf8"));
  for (const [scale, group] of Object.entries(palette)) {
    merged[mode][scale] = Object.fromEntries(
      Object.entries(group)
        .filter(([key]) => !key.startsWith("$"))
        .map(([key, token]) => [key, token.$value]),
    );
  }
}
writeFileSync(out, `${JSON.stringify(merged)}\n`);

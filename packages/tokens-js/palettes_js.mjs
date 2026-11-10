// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

// Merges the palette token files into palettes.js, an ES module whose
// default export is every palette value, as palettes.d.ts types it:
// {"light": {"blue": {"1": {colorSpace, components, hex, p3}, "a1": {...}}}, "dark": {...}}
// where p3 is the oklch color's Display P3 red, green and blue, for native
// apps. Usage: palettes_js.mjs <out> <palette file>...

import { readFileSync, writeFileSync } from "node:fs";

import { mergePalettes } from "./palette-values.mjs";

const [out, ...files] = process.argv.slice(2);
const merged = mergePalettes(
  files.map((file) => ({
    file,
    palette: JSON.parse(readFileSync(file, "utf8")).palette,
  })),
);
writeFileSync(out, `export default ${JSON.stringify(merged)};\n`);

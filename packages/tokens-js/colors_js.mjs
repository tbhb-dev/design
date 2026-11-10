// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

// Usage: colors_js.mjs <out> <semantic color token file>
import { readFileSync, writeFileSync } from "node:fs";
import { colorGroups } from "./color-groups.mjs";

const [out, file] = process.argv.slice(2);
const groups = colorGroups(JSON.parse(readFileSync(file, "utf8")).color);
writeFileSync(out, `export default ${JSON.stringify(groups)};\n`);

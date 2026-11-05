// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

// Checks the Pages artifact: the site's index page and .nojekyll sit at its
// root, where GitHub Pages serves them.
//
// Usage: pages_test.mjs <pages directory>

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const [dir] = process.argv.slice(2);
const failures = [];

const index = join(dir, "index.html");
if (!existsSync(index)) {
  failures.push("index.html is missing from the artifact's root");
} else if (!readFileSync(index, "utf8").includes("tbhb.dev design system")) {
  failures.push("index.html doesn't hold the site's heading");
}
if (!existsSync(join(dir, ".nojekyll"))) {
  failures.push(".nojekyll is missing, so Pages would run Jekyll");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("pages_test: index.html and .nojekyll at the artifact's root");

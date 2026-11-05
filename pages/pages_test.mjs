// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

// Checks the Pages artifact: the site's index page and .nojekyll sit at its
// root, and each Storybook's index page under /storybook/<framework>/, where
// GitHub Pages serves them. The site's index links to each Storybook.
//
// Usage: pages_test.mjs <pages directory>

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const [dir] = process.argv.slice(2);
const failures = [];

const index = join(dir, "index.html");
const html = existsSync(index) ? readFileSync(index, "utf8") : "";
if (!html) {
  failures.push("index.html is missing from the artifact's root");
} else if (!html.includes("tbhb.dev design system")) {
  failures.push("index.html doesn't hold the site's heading");
}
for (const framework of ["astro", "html", "react", "web-components"]) {
  if (!existsSync(join(dir, "storybook", framework, "index.html"))) {
    failures.push(`storybook/${framework}/index.html is missing`);
  }
  if (html && !html.includes(`href="/storybook/${framework}/"`)) {
    failures.push(`index.html doesn't link to /storybook/${framework}/`);
  }
}
if (!existsSync(join(dir, ".nojekyll"))) {
  failures.push(".nojekyll is missing, so Pages would run Jekyll");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("pages_test: the site, the four Storybooks and .nojekyll in place");

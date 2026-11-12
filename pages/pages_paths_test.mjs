// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import { artifactFailures } from "./path-policy.mjs";

const [dir] = process.argv.slice(2);
const failures = artifactFailures(dir);
if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(
  "pages_paths_test: every artifact file is free of build paths and .vite directories",
);

// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import { readFileSync } from "node:fs";
import { runnerFailures } from "./runner-policy.mjs";

const [file] = process.argv.slice(2);
const failures = runnerFailures(readFileSync(file, "utf8"));
if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(
  "pages_runners_test: every Pages job uses an allowed hosted runner",
);

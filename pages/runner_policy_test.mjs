// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import assert from "node:assert/strict";
import { runnerFailures } from "./runner-policy.mjs";

for (const value of [
  "ubuntu-26.04",
  '"ubuntu-26.04"',
  "'ubuntu-26.04'",
  "[ubuntu-26.04]",
  "[ubuntu-26.04, 'ubuntu-26.04']",
  "ubuntu-26.04 # hosted",
]) {
  assert.deepEqual(
    runnerFailures(`jobs:\n  build:\n    runs-on: ${value}\n`),
    [],
  );
}
for (const value of [
  "self-hosted",
  "[ubuntu-26.04, self-hosted]",
  "\n      - ubuntu-26.04",
  // biome-ignore lint/suspicious/noTemplateCurlyInString: Literal workflow expression fixture.
  "${{ matrix.runner }}",
  // biome-ignore lint/suspicious/noTemplateCurlyInString: Literal workflow expression fixture.
  "[ubuntu-26.04, '${{ matrix.runner }}']",
  "{group: hosted}",
  "[]",
  "null",
  "|\n      ubuntu-26.04",
  "&runner ubuntu-26.04",
  "*runner",
  "ubuntu-26.04\n      self-hosted",
  "ubuntu-26.04\n      - self-hosted",
]) {
  const failures = runnerFailures(`jobs:\n  build:\n    runs-on: ${value}\n`);
  assert.ok(failures.length > 0, value);
  console.log(
    `runner_policy_test: rejected planted ${JSON.stringify(value)}: ${failures.join("; ")}`,
  );
}
for (const source of [
  "jobs:\n  build:\n    steps: []\n",
  "jobs:\n  build: {runs-on: ubuntu-26.04}\n",
  "jobs:\n  build:\n    uses: example/workflow.yml\n",
  "jobs:\n  build:\n    runs-on: ubuntu-26.04\n    runs-on: ubuntu-26.04\n",
  "jobs:\n  build:\n    runs-on: ubuntu-26.04\n  build:\n    runs-on: ubuntu-26.04\n",
  "jobs: {}\n",
  "name: empty\n",
]) {
  assert.ok(runnerFailures(source).length > 0, source);
}
assert.deepEqual(
  runnerFailures(`jobs:
  build:
    runs-on: ubuntu-26.04
    steps:
      - run: echo runs-on: self-hosted
  deploy:
    "runs-on": self-hosted
`),
  ['deploy: runs-on "self-hosted" is not allowed'],
);
console.log(
  "runner_policy_test: scalar, flow list, unsupported syntax and missing-runner checks passed",
);

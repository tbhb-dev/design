// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { artifactFailures, pathFailures } from "./path-policy.mjs";

const planted = [
  // eslint-disable-next-line sonarjs/publicly-writable-directories -- Match a forbidden path without accessing it.
  "/tmp/",
  "/home/",
  "/Users/",
  "/private/var/",
  "execroot/",
  "bazel-out/",
  "_bazel_",
  "/storybook-Ab12Z9/",
];
for (const fragment of planted) {
  for (const boundary of ["", '"', "'", " ", "\n", "\t", "(", "=", ":"]) {
    assert.equal(pathFailures(`${boundary}${fragment}planted`).length, 1);
    const binary = Buffer.from(
      `\0\xff${boundary || " "}${fragment}planted\0`,
      "latin1",
    );
    assert.equal(pathFailures(binary).length, 1);
  }
  console.log(
    `path_policy_test: rejected planted ${fragment} in text and binary data`,
  );
}
for (const text of [
  "Ordinary prose about temporary files, home directories and Storybook.",
  "prefix/tmp/file prefix/home/file prefix/Users/file prefix/private/var/file",
  "prefix/execroot/file prefix/bazel-out/file prefix_bazel_file",
  "/storybook-Ab12Z/ /storybook-Ab12Z90/ /storybook-Ab12_9/",
  '"/storybook/react/index.html"',
]) {
  assert.deepEqual(pathFailures(text), [], text);
}
const root = mkdtempSync(join(tmpdir(), "path-policy-"));
try {
  mkdirSync(join(root, "nested", ".vite"), { recursive: true });
  writeFileSync(
    join(root, "nested", "asset.bin"),
    Buffer.from(`\0\xff ${planted[0]}planted\0`, "latin1"),
  );
  const failures = artifactFailures(root);
  assert.equal(failures.length, 2);
  assert.ok(
    failures.some((failure) => failure === "nested/.vite: .vite directory"),
  );
  assert.ok(
    failures.some((failure) => failure.startsWith("nested/asset.bin: /tmp/:")),
  );
  console.log(`path_policy_test: ${failures.join("; ")}`);
} finally {
  rmSync(root, { recursive: true, force: true });
}
console.log(
  "path_policy_test: ordinary text and non-boundary fragments accepted",
);

// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Keep the live deployment's shell check in pages.yml in sync with these.
const patterns = [
  // eslint-disable-next-line sonarjs/publicly-writable-directories -- Match a forbidden path without accessing it.
  "/tmp/",
  "/home/",
  "/Users/",
  "/private/var/",
  "execroot/",
  "bazel-out/",
  "_bazel_",
  "/storybook-[A-Za-z0-9]{6}/",
];

export function pathFailures(content) {
  // Latin-1 preserves every byte, including paths embedded in binary files.
  const text = Buffer.isBuffer(content) ? content.toString("latin1") : content;
  const failures = [];
  for (const pattern of patterns) {
    const matcher = new RegExp(`(^|["'\\s(=:])(${pattern})`, "g");
    for (const match of text.matchAll(matcher)) {
      const start = match.index + match[1].length;
      const context = text.slice(
        Math.max(0, start - 30),
        start + match[2].length + 30,
      );
      failures.push(`${pattern}: ${JSON.stringify(context)}`);
    }
  }
  return failures;
}

export function artifactFailures(root) {
  const failures = [];
  function walk(relative) {
    for (const entry of readdirSync(join(root, relative), {
      withFileTypes: true,
    })) {
      const file = join(relative, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === ".vite") failures.push(`${file}: .vite directory`);
        walk(file);
      } else {
        for (const failure of pathFailures(readFileSync(join(root, file)))) {
          failures.push(`${file}: ${failure}`);
        }
      }
    }
  }
  walk("");
  return failures;
}

// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

/** @type {import("@stryker-mutator/api/core").PartialStrykerOptions} */
export default {
  testRunner: "vitest",
  plugins: ["@stryker-mutator/vitest-runner"],
  vitest: { configFile: "vitest.config.mjs" },
  mutate: [
    "packages/**/*.{ts,mjs}",
    "storybook/**/*.{ts,tsx}",
    "dev/**/*.mjs",
    "pages/**/*.mjs",
    "site/**/*.{ts,mjs}",
    "!**/*.d.ts",
    "!**/*_test.mjs",
    "!**/*.test.{ts,mjs}",
  ],
  concurrency: 2,
  thresholds: { high: 100, low: 100, break: 100 },
  reporters: ["clear-text"],
};

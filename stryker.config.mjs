// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

export default {
  testRunner: "vitest",
  plugins: ["@stryker-mutator/vitest-runner"],
  vitest: {
    configFile: "vitest.config.mjs",
  },
  mutate: [
    "storybook/*/src/palette.ts",
    "storybook/*/.storybook/swatch-values.ts",
    "packages/tokens-js/palette-values.mjs",
    "packages/tokens-js/color-groups.mjs",
    "packages/tokens-js/colors_js.mjs",
    "packages/tokens-js/palettes_js.mjs",
    "dev/routing.mjs",
    "packages/components/src/button.ts",
  ],
  concurrency: 2,
  thresholds: {
    high: 100,
    low: 100,
    break: 100,
  },
  reporters: ["clear-text", "json"],
};

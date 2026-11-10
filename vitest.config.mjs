// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.test.{ts,mjs}", "**/.storybook/*.test.ts"],
    coverage: {
      provider: "v8",
      include: [
        "storybook/*/src/palette.ts",
        "storybook/*/.storybook/swatch-values.ts",
        "packages/tokens-js/palette-values.mjs",
        "packages/tokens-js/palettes_js.mjs",
        "dev/routing.mjs",
      ],
    },
  },
});

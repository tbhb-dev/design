// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      exclude: ["**/*.d.ts", "**/*.test.{ts,mjs}", "**/*_test.mjs"],
      include: [
        "packages/**/*.{ts,mjs}",
        "storybook/**/*.{ts,tsx}",
        "dev/**/*.mjs",
        "pages/**/*.mjs",
        "site/**/*.{ts,mjs}",
      ],
    },
  },
});

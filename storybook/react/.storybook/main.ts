// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import type { UserConfig } from "vite";

export default {
  stories: ["../src/**/*.stories.tsx"],
  // tokens-js's palettes.js is plain ESM with no imports. Left to the
  // optimizer, Vite finds it only once a story loads, and reloads mid-test.
  viteFinal: (config: UserConfig): UserConfig => ({
    ...config,
    optimizeDeps: {
      ...config.optimizeDeps,
      exclude: [
        ...(config.optimizeDeps?.exclude ?? []),
        "@tbhb-dev/tokens-js",
        "@tbhb-dev/components",
      ],
    },
  }),
};

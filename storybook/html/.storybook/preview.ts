// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import "@tbhb-dev/tokens-css/all.css";
import "./preview.css";
import "./swatch-dialog.ts";

// Theme and mode switches in the toolbar. They set data-theme and
// data-mode on the root element, where the tokens' selectors read them;
// "system" leaves data-mode unset, so the mode follows prefers-color-scheme.
export default {
  globalTypes: {
    theme: {
      description: "Theme",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: ["tbhb"],
        dynamicTitle: true,
      },
    },
    mode: {
      description: "Color mode",
      toolbar: {
        title: "Mode",
        icon: "contrast",
        items: [
          { value: "system", title: "System" },
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "tbhb", mode: "system" },
  decorators: [
    (
      story: () => unknown,
      { globals }: { globals: Record<string, string> },
    ) => {
      const root = document.documentElement;
      root.dataset.theme = globals.theme ?? "tbhb";
      if (globals.mode === "light" || globals.mode === "dark") {
        root.dataset.mode = globals.mode;
      } else {
        delete root.dataset.mode;
      }
      return story();
    },
  ],
};

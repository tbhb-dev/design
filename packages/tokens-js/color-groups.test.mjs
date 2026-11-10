// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import { expect, it } from "vitest";
import { colorGroups } from "./color-groups.mjs";

it("keeps source groups, token order and full CSS paths, excluding metadata", () => {
  expect(
    colorGroups({
      $type: "color",
      background: { $value: "{role.neutral.1}" },
      "text-muted": { $value: "{role.neutral.11}" },
      accent: {
        $description: "Accent colors",
        solid: { $value: { colorSpace: "oklch", components: [1, 0, 0] } },
        text: { $value: "{role.accent.11}" },
        nested: { border: { $value: "{role.accent.7}" } },
      },
      success: { text: { $value: "{role.success.11}" } },
    }),
  ).toEqual([
    {
      name: "color",
      tokens: [
        { name: "background", property: "--tbhb-color-background" },
        { name: "text-muted", property: "--tbhb-color-text-muted" },
      ],
    },
    {
      name: "color.accent",
      tokens: [
        { name: "solid", property: "--tbhb-color-accent-solid" },
        { name: "text", property: "--tbhb-color-accent-text" },
      ],
    },
    {
      name: "color.accent.nested",
      tokens: [
        { name: "border", property: "--tbhb-color-accent-nested-border" },
      ],
    },
    {
      name: "color.success",
      tokens: [{ name: "text", property: "--tbhb-color-success-text" }],
    },
  ]);
});

it("retains empty groups and accepts an explicit root path", () => {
  expect(colorGroups({ empty: {} }, ["custom", "color"])).toEqual([
    { name: "custom.color", tokens: [] },
    { name: "custom.color.empty", tokens: [] },
  ]);
});

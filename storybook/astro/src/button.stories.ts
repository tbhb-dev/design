// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import Button from "./Button.astro";
import { checkButton } from "./button-check.ts";

// Astro also evaluates story metadata while prerendering in Node.
if (typeof window !== "undefined") {
  await import("@tbhb-dev/components/button");
}

export default {
  title: "Components/Button",
  component: Button,
  play: async (context: { canvasElement: HTMLElement }) => {
    await checkButton(context);
  },
};

export const Solid = {};
export const Soft = { args: { variant: "soft" } };
export const Outline = { args: { variant: "outline" } };
export const Disabled = { args: { disabled: true } };
export const SubmitInAForm = { args: { submit: true } };

// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import { html } from "lit";
import "@tbhb-dev/components/button";
import { checkButton } from "./button-check.ts";

export default { title: "Components/Button", play: checkButton };

export const Solid = {
  render: () => html`<tbhb-button>Continue</tbhb-button>`,
};

export const Soft = {
  render: () => html`<tbhb-button variant="soft">Continue</tbhb-button>`,
};

export const Outline = {
  render: () => html`<tbhb-button variant="outline">Continue</tbhb-button>`,
};

export const Disabled = {
  render: () => html`<tbhb-button disabled>Unavailable</tbhb-button>`,
};

export const SubmitInAForm = {
  render: () =>
    html`<form><label>Display name <input name="displayName" value="Example" required></label><tbhb-button type="submit">Save</tbhb-button></form>`,
};

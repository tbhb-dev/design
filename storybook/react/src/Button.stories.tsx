// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import "@tbhb-dev/components/button";
import { checkButton } from "./button-check.ts";

export default { title: "Components/Button", play: checkButton };

export const Solid = {
  render: () => <tbhb-button>Continue</tbhb-button>,
};

export const Soft = {
  render: () => <tbhb-button variant="soft">Continue</tbhb-button>,
};

export const Outline = {
  render: () => <tbhb-button variant="outline">Continue</tbhb-button>,
};

export const Disabled = {
  render: () => <tbhb-button disabled>Unavailable</tbhb-button>,
};

export const SubmitInAForm = {
  render: () => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <label>
        Display name{" "}
        <input name="displayName" defaultValue="Example" required />
      </label>
      <tbhb-button type="submit">Save</tbhb-button>
    </form>
  ),
};

// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import type { HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "tbhb-button": HTMLAttributes<HTMLElement> & {
        type?: "button" | "submit" | "reset";
        variant?: "solid" | "soft" | "outline";
        disabled?: boolean;
      };
    }
  }
}

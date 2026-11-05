// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import { defineConfig } from "astro/config";

// The landing and documentation site, served at the root of
// design.tbhb.dev. The Storybooks sit beside it under /storybook/.
export default defineConfig({
  site: "https://design.tbhb.dev",
});

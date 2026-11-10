// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

/// <reference types="vite/client" />
/// <reference types="astro/client" />

declare module "*.astro" {
  const component: import("astro/runtime/server/index.js").AstroComponentFactory;
  export default component;
}

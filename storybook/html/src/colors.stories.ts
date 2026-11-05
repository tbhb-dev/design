// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import { COLORS, SCALES, STEPS, USES, label, variable } from "./palette.ts";

const swatch = (scale: string, step: number, alpha: boolean) =>
  `<div class="tbhb-swatch ${alpha ? "tbhb-alpha" : "tbhb-solid"}" title="${variable(scale, step, alpha)}" style="background: var(${variable(scale, step, alpha)})"></div>`;

export default { title: "Tokens/Colors" };

export const Colors = {
  render: () => `<main class="tbhb-page tbhb-colors">
  <h1>Colors</h1>
  <p>${COLORS}</p>
  <fieldset class="tbhb-toggle">
    <legend>Scales</legend>
    <label><input type="radio" name="tbhb-variant" value="solid" checked> Solid</label>
    <label><input type="radio" name="tbhb-variant" value="alpha"> Alpha</label>
  </fieldset>
  <div class="tbhb-grid">
    <span></span>${USES.map((use) => `<span class="tbhb-use" style="grid-column: span ${use.steps}">${use.name}</span>`).join("")}
    <span></span>${STEPS.map((step) => `<span class="tbhb-step">${step}</span>`).join("")}
    ${SCALES.map(
      (scale) =>
        `<span class="tbhb-name">${label(scale)}</span>${STEPS.map((step) => `<div>${swatch(scale, step, false)}${swatch(scale, step, true)}</div>`).join("")}`,
    ).join("")}
  </div>
</main>`,
};

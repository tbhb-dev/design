// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import { html } from "lit";
import { COLORS, SCALES, STEPS, USES, label, swatchName, swatchStep, variable } from "./palette.ts";

const swatch = (scale: string, step: number, alpha: boolean) =>
  html`<button
    type="button"
    class="tbhb-swatch ${alpha ? "tbhb-alpha" : "tbhb-solid"}"
    data-scale=${scale}
    data-step=${swatchStep(step, alpha)}
    aria-label=${swatchName(scale, step, alpha)}
    title=${variable(scale, step, alpha)}
    style="--tbhb-swatch: var(${variable(scale, step, alpha)})"
  ></button>`;

export default { title: "Tokens/Colors" };

export const Colors = {
  render: () => html`<main class="tbhb-page tbhb-colors">
    <h1>Colors</h1>
    <p>${COLORS}</p>
    <fieldset class="tbhb-toggle">
      <legend>Scales</legend>
      <label><input type="radio" name="tbhb-variant" value="solid" checked /> Solid</label>
      <label><input type="radio" name="tbhb-variant" value="alpha" /> Alpha</label>
    </fieldset>
    <div class="tbhb-grid">
      <span></span>${USES.map(
        (use) => html`<span class="tbhb-use" style="grid-column: span ${use.steps}">${use.name}</span>`,
      )}
      <span></span>${STEPS.map((step) => html`<span class="tbhb-step">${step}</span>`)}
      ${SCALES.map(
        (scale) =>
          html`<span class="tbhb-name">${label(scale)}</span>${STEPS.map(
              (step) => html`<div>${swatch(scale, step, false)}${swatch(scale, step, true)}</div>`,
            )}`,
      )}
    </div>
  </main>`,
};

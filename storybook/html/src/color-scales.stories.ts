// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import {
  COLOR_SCALES,
  label,
  SCALES,
  STEPS,
  swatchName,
  swatchStep,
  variable,
} from "./palette.ts";

const row = (name: string, scale: string, alpha: boolean) =>
  `<span class="tbhb-name">${name}</span>${STEPS.map(
    (step) =>
      `<button type="button" class="tbhb-swatch${alpha ? " tbhb-alpha" : ""}" data-scale="${scale}" data-step="${swatchStep(step, alpha)}" aria-label="${swatchName(scale, step, alpha)}" title="${variable(scale, step, alpha)}" style="--tbhb-swatch: var(${variable(scale, step, alpha)})"></button>`,
  ).join("")}`;

const scaleSection = (scale: string) => `<section>
  <h2>${label(scale)}</h2>
  <div class="tbhb-grid tbhb-mode" data-mode="light">${row(label(scale), scale, false)}${row(`${label(scale)} Alpha`, scale, true)}</div>
  <div class="tbhb-grid tbhb-mode" data-mode="dark">${row(`${label(scale)} Dark`, scale, false)}${row(`${label(scale)} Dark Alpha`, scale, true)}</div>
</section>`;

export default { title: "Tokens/Color scales" };

export const ColorScales = {
  name: "Color scales",
  render: () => `<main class="tbhb-page">
  <h1>Color scales</h1>
  <p>${COLOR_SCALES}</p>
  <div class="tbhb-grid"><span></span>${STEPS.map((step) => `<span class="tbhb-step">${String(step)}</span>`).join("")}</div>
  ${SCALES.map(scaleSection).join("")}
</main>`,
};

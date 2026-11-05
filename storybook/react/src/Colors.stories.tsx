// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import type { CSSProperties } from "react";
import { COLORS, SCALES, STEPS, USES, label, swatchName, swatchStep, variable } from "./palette.ts";

function Swatch({ scale, step, alpha }: { scale: string; step: number; alpha: boolean }) {
  const name = variable(scale, step, alpha);
  return (
    <button
      type="button"
      className={`tbhb-swatch ${alpha ? "tbhb-alpha" : "tbhb-solid"}`}
      data-scale={scale}
      data-step={swatchStep(step, alpha)}
      aria-label={swatchName(scale, step, alpha)}
      title={name}
      style={{ "--swatch": `var(${name})` } as CSSProperties}
    />
  );
}

export default { title: "Tokens/Colors" };

export const Colors = {
  render: () => (
    <main className="tbhb-page tbhb-colors">
      <h1>Colors</h1>
      <p>{COLORS}</p>
      <fieldset className="tbhb-toggle">
        <legend>Scales</legend>
        <label>
          <input type="radio" name="tbhb-variant" value="solid" defaultChecked /> Solid
        </label>
        <label>
          <input type="radio" name="tbhb-variant" value="alpha" /> Alpha
        </label>
      </fieldset>
      <div className="tbhb-grid">
        <span />
        {USES.map((use) => (
          <span key={use.name} className="tbhb-use" style={{ gridColumn: `span ${use.steps}` }}>
            {use.name}
          </span>
        ))}
        <span />
        {STEPS.map((step) => (
          <span key={step} className="tbhb-step">
            {step}
          </span>
        ))}
        {SCALES.flatMap((scale) => [
          <span key={scale} className="tbhb-name">
            {label(scale)}
          </span>,
          ...STEPS.map((step) => (
            <div key={`${scale}-${step}`}>
              <Swatch scale={scale} step={step} alpha={false} />
              <Swatch scale={scale} step={step} alpha />
            </div>
          )),
        ])}
      </div>
    </main>
  ),
};

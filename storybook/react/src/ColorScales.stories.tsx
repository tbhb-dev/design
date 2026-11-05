// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import type { CSSProperties } from "react";
import { COLOR_SCALES, SCALES, STEPS, label, swatchName, swatchStep, variable } from "./palette.ts";

function Row({ name, scale, alpha }: { name: string; scale: string; alpha: boolean }) {
  return (
    <>
      <span className="tbhb-name">{name}</span>
      {STEPS.map((step) => (
        <button
          key={step}
          type="button"
          className={alpha ? "tbhb-swatch tbhb-alpha" : "tbhb-swatch"}
          data-scale={scale}
          data-step={swatchStep(step, alpha)}
          aria-label={swatchName(scale, step, alpha)}
          title={variable(scale, step, alpha)}
          style={{ "--swatch": `var(${variable(scale, step, alpha)})` } as CSSProperties}
        />
      ))}
    </>
  );
}

function Scale({ scale }: { scale: string }) {
  const name = label(scale);
  return (
    <section>
      <h2>{name}</h2>
      <div className="tbhb-grid tbhb-mode" data-mode="light">
        <Row name={name} scale={scale} alpha={false} />
        <Row name={`${name} Alpha`} scale={scale} alpha />
      </div>
      <div className="tbhb-grid tbhb-mode" data-mode="dark">
        <Row name={`${name} Dark`} scale={scale} alpha={false} />
        <Row name={`${name} Dark Alpha`} scale={scale} alpha />
      </div>
    </section>
  );
}

export default { title: "Tokens/Color scales" };

export const ColorScales = {
  name: "Color scales",
  render: () => (
    <main className="tbhb-page">
      <h1>Color scales</h1>
      <p>{COLOR_SCALES}</p>
      <div className="tbhb-grid">
        <span />
        {STEPS.map((step) => (
          <span key={step} className="tbhb-step">
            {step}
          </span>
        ))}
      </div>
      {SCALES.map((scale) => (
        <Scale key={scale} scale={scale} />
      ))}
    </main>
  ),
};

// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import { COLOR_SCALES, SCALES, STEPS, label, variable } from "./palette.ts";

function Row({ name, scale, alpha }: { name: string; scale: string; alpha: boolean }) {
  return (
    <>
      <span className="tbhb-name">{name}</span>
      {STEPS.map((step) => (
        <div
          key={step}
          className="tbhb-swatch"
          title={variable(scale, step, alpha)}
          style={{ background: `var(${variable(scale, step, alpha)})` }}
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

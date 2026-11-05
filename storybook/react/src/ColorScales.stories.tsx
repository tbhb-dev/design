// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

const ROLES = ["neutral", "accent", "success", "warning", "danger", "info"];
const STEPS = Array.from({ length: 12 }, (_, i) => i + 1);
const label = (role: string) => role[0].toUpperCase() + role.slice(1);

function Chip({ role, fill, text }: { role: string; fill: string; text: string }) {
  return (
    <span
      style={{
        background: `var(--color-${role}-${fill})`,
        color: `var(--color-${role}-contrast)`,
        padding: "var(--space-1) var(--space-3)",
        borderRadius: "var(--radius-2)",
      }}
    >
      {text}
    </span>
  );
}

function Scale({ role }: { role: string }) {
  return (
    <section>
      <h2>{label(role)}</h2>
      <ol
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: "var(--space-1)",
          listStyle: "none",
          padding: 0,
        }}
      >
        {STEPS.map((step) => (
          <li key={step}>
            <div
              style={{
                height: "3rem",
                borderRadius: "var(--radius-2)",
                background: `var(--role-${role}-${step})`,
              }}
            />
            <span style={{ color: "var(--color-text-muted)" }}>{step}</span>
          </li>
        ))}
      </ol>
      {role === "neutral" ? null : (
        <p style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
          <Chip role={role} fill="solid" text="Solid" />
          <Chip role={role} fill="solid-hover" text="Solid hover" />
          <span style={{ color: `var(--color-${role}-text)` }}>Text</span>
        </p>
      )}
    </section>
  );
}

export default { title: "Tokens/Color scales" };

export const ColorScales = {
  name: "Color scales",
  render: () => (
    <main style={{ padding: "var(--space-4)" }}>
      <h1>Color scales</h1>
      <p>Each role's 12 steps in the current theme and mode: 1–2 app backgrounds, 3–5 component backgrounds, 6–8 borders, 9–10 solid fills, 11–12 text.</p>
      {ROLES.map((role) => (
        <Scale key={role} role={role} />
      ))}
    </main>
  ),
};

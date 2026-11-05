// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

// The dialog a swatch on the Colors or Color scales page opens: the step's
// use, and its solid and alpha values in the swatch's mode. Swatches are
// buttons with data-scale and data-step ("9" or "a9"); one listener on the
// document serves every story, whatever renders it.

import palettes from "@tbhb-dev/tokens/palettes.json";

type Color = { components: number[]; alpha?: number; hex: string };
type Palettes = Record<string, Record<string, Record<string, Color>>>;

const USES = [
  "Backgrounds",
  "Backgrounds",
  "Interactive components",
  "Interactive components",
  "Interactive components",
  "Borders and separators",
  "Borders and separators",
  "Borders and separators",
  "Solid colors",
  "Solid colors",
  "Accessible text",
  "Accessible text",
];

const PURPOSES = [
  "App background",
  "Subtle background",
  "UI element background",
  "Hovered UI element background",
  "Active or selected UI element background",
  "Subtle borders and separators",
  "UI element border and focus rings",
  "Hovered UI element border",
  "Solid backgrounds",
  "Hovered solid backgrounds",
  "Low-contrast text",
  "High-contrast text",
];

const oklch = ({ components: [l, c, h], alpha }: Color) =>
  `oklch(${l} ${c} ${h}${alpha === undefined ? "" : ` / ${alpha}`})`;

const label = (scale: string) => scale[0].toUpperCase() + scale.slice(1);

function element(tag: string, props: Record<string, string> = {}, ...children: (Node | string)[]) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    node.setAttribute(key, value);
  }
  node.append(...children);
  return node;
}

function rows(entries: [string, string][]) {
  return element(
    "dl",
    {},
    ...entries.flatMap(([term, detail]) => [element("dt", {}, term), element("dd", {}, detail)]),
  );
}

function values(title: string, variable: string, color: Color) {
  return element(
    "section",
    {},
    element("h3", {}, title),
    rows([
      ["Custom property", variable],
      ["oklch", oklch(color)],
      ["Hex fallback", color.alpha === undefined ? color.hex : `${color.hex} at alpha ${color.alpha}`],
    ]),
  );
}

function open(swatch: HTMLElement) {
  const { scale = "", step = "" } = swatch.dataset;
  const n = Number(step.replace("a", ""));
  const mode =
    swatch.closest<HTMLElement>("[data-mode]")?.dataset.mode ??
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const scales = (palettes as Palettes)[mode];
  const solid = `--palette-${scale}-${n}`;
  const alpha = `--palette-${scale}-a${n}`;

  const dialog = element("dialog", {
    class: "tbhb-dialog",
    "data-mode": mode,
    "aria-labelledby": "tbhb-dialog-title",
  }) as HTMLDialogElement;
  dialog.append(
    element(
      "div",
      { class: "tbhb-dialog-preview" },
      element("div", { class: "tbhb-swatch tbhb-solid", style: `--swatch: var(${solid})` }),
      element("div", { class: "tbhb-swatch tbhb-alpha", style: `--swatch: var(${alpha})` }),
    ),
    element("h2", { id: "tbhb-dialog-title" }, `${label(scale)} ${step.toUpperCase()}`),
    rows([
      ["Usage", `${USES[n - 1]}: ${PURPOSES[n - 1]}`],
      ["Mode", label(mode)],
    ]),
    values("Solid", solid, scales[scale][String(n)]),
    values("Alpha", alpha, scales[scale][`a${n}`]),
    element("form", { method: "dialog" }, element("button", { type: "submit" }, "Close")),
  );
  dialog.addEventListener("close", () => {
    dialog.remove();
    swatch.focus();
  });
  // A click on the backdrop lands on the dialog itself.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
  document.body.append(dialog);
  dialog.showModal();
}

document.addEventListener("click", (event) => {
  const swatch = (event.target as Element).closest?.<HTMLElement>("button.tbhb-swatch[data-scale]");
  if (swatch) {
    open(swatch);
  }
});

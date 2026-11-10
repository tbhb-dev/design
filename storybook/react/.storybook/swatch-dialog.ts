// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

// The dialog a swatch on the Colors or Color scales page opens: the step's
// use, and its solid and alpha values in the swatch's mode. Swatches are
// buttons with data-scale and data-step ("9" or "a9"); one listener on the
// document serves every story, whatever renders it.

import palettes, { type Color } from "@tbhb-dev/tokens-js/palettes.js";

import { displayP3, oklch, srgb } from "./swatch-values.ts";

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

const label = (scale: string) => scale.charAt(0).toUpperCase() + scale.slice(1);

function element(
  tag: string,
  props: Record<string, string> = {},
  ...children: (Node | string)[]
) {
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
    ...entries.flatMap(([term, detail]) => [
      element("dt", {}, term),
      element("dd", {}, detail),
    ]),
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
      ["Display P3", displayP3(color)],
      ["sRGB", srgb(color)],
    ]),
  );
}

function open(swatch: HTMLElement) {
  const { scale = "", step = "" } = swatch.dataset;
  const n = Number(step.replace("a", ""));
  const mode = (swatch.closest<HTMLElement>("[data-mode]")?.dataset.mode ??
    (matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light")) as keyof typeof palettes;
  const colors = palettes[mode][scale];
  const solidColor = colors?.[String(n)];
  const alphaColor = colors?.[`a${String(n)}`];
  const use = USES[n - 1];
  const purpose = PURPOSES[n - 1];
  if (!solidColor || !alphaColor || !use || !purpose) {
    return;
  }
  const solid = `--tbhb-palette-${scale}-${String(n)}`;
  const alpha = `--tbhb-palette-${scale}-a${String(n)}`;

  const dialog = element("dialog", {
    class: "tbhb-dialog",
    "data-mode": mode,
    "aria-labelledby": "tbhb-dialog-title",
  }) as HTMLDialogElement;
  dialog.append(
    element(
      "div",
      { class: "tbhb-dialog-preview" },
      element("div", {
        class: "tbhb-swatch tbhb-solid",
        style: `--tbhb-swatch: var(${solid})`,
      }),
      element("div", {
        class: "tbhb-swatch tbhb-alpha",
        style: `--tbhb-swatch: var(${alpha})`,
      }),
    ),
    element(
      "h2",
      { id: "tbhb-dialog-title" },
      `${label(scale)} ${step.toUpperCase()}`,
    ),
    rows([
      ["Usage", `${use}: ${purpose}`],
      ["Mode", label(mode)],
    ]),
    values("Solid", solid, solidColor),
    values("Alpha", alpha, alphaColor),
    element(
      "form",
      { method: "dialog" },
      element("button", { type: "submit" }, "Close"),
    ),
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
  const swatch =
    event.target instanceof Element
      ? event.target.closest<HTMLElement>("button.tbhb-swatch[data-scale]")
      : null;
  if (swatch) {
    open(swatch);
  }
});

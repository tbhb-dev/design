// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function luminance(color: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  assert(context, "A canvas context is available");
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const channels = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
  const linear = channels.map((value) => {
    const channel = value / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const [red = 0, green = 0, blue = 0] = linear;
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

/** Browser checks shared by every button story, including both token modes. */
export async function checkButton({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) {
  await customElements.whenDefined("tbhb-button");
  const host = canvasElement.querySelector<HTMLElement>("tbhb-button");
  const button = host?.shadowRoot?.querySelector("button");
  assert(host && button, "The custom element contains a native shadow button");
  assert(button.querySelector("slot"), "The label uses the default slot");
  assert(
    button.disabled === host.hasAttribute("disabled"),
    "Disabled is forwarded",
  );
  assert(
    button.type === (host.getAttribute("type") ?? "button"),
    "Type is forwarded",
  );
  const root = document.documentElement;
  const mode = root.getAttribute("data-mode");
  try {
    for (const value of ["light", "dark"]) {
      root.setAttribute("data-mode", value);
      const style = getComputedStyle(button);
      const foreground = luminance(style.color);
      const background = luminance(style.backgroundColor);
      const contrast =
        (Math.max(foreground, background) + 0.05) /
        (Math.min(foreground, background) + 0.05);
      assert(
        button.disabled || contrast >= 4.5,
        `${value} text contrast is AA: ${String(contrast)}`,
      );
      if (!button.disabled) {
        host.focus();
        assert(
          host.shadowRoot?.activeElement === button,
          "Focus delegates to the native button",
        );
      }
    }
  } finally {
    if (mode === null) root.removeAttribute("data-mode");
    else root.setAttribute("data-mode", mode);
  }
  const form = canvasElement.querySelector("form");
  if (!form) return;
  let submits = 0;
  const count = () => submits;
  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    submits += 1;
  };
  form.addEventListener("submit", onSubmit);
  const input = form.querySelector("input");
  assert(input, "The form has a required input");
  try {
    input.value = "";
    host.click();
    await Promise.resolve();
    assert(count() === 0, "An invalid form cannot submit");
    input.value = "Updated";
    host.click();
    await Promise.resolve();
    assert(count() === 1, "A valid form submits once");
    host.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
      },
      {
        once: true,
      },
    );
    host.click();
    await Promise.resolve();
    assert(count() === 1, "A canceled click cannot submit");
    const fieldset = document.createElement("fieldset");
    form.append(fieldset);
    fieldset.append(host);
    fieldset.disabled = true;
    assert(button.disabled, "Disabled fieldsets disable the native button");
    host.click();
    await Promise.resolve();
    assert(count() === 1, "A disabled button cannot submit");
    fieldset.disabled = false;
    assert(!button.disabled, "Enabling a fieldset restores the native button");
    form.append(host);
    fieldset.remove();
    host.setAttribute("type", "button");
    host.click();
    await Promise.resolve();
    assert(count() === 1, "A plain button cannot submit");
    host.setAttribute("type", "reset");
    host.click();
    await Promise.resolve();
    assert(
      input.value === input.defaultValue,
      "Reset restores the form controls",
    );
  } finally {
    host.setAttribute("type", "submit");
    input.value = input.defaultValue;
    form.removeEventListener("submit", onSubmit);
  }
}

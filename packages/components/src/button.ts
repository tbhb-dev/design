// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import css from "./button.css?inline";

/** A native button, with form activation bridged across its shadow boundary. */
class TbhbButton extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = ["type"];

  #internals = this.attachInternals();
  #button = document.createElement("button");

  constructor() {
    super();
    const root = this.attachShadow({ mode: "open", delegatesFocus: true });
    const style = document.createElement("style");
    style.textContent = css;
    this.#button.type = "button";
    this.#button.append(document.createElement("slot"));
    root.append(style, this.#button);
    this.#button.addEventListener("click", (event) => {
      // Let all click listeners finish so preventDefault() on the host works.
      queueMicrotask(() => {
        if (event.defaultPrevented || this.#button.disabled) return;
        // A shadow button has no outer form owner. ElementInternals supplies it;
        // requestSubmit preserves constraint validation and the submit event.
        if (this.type === "submit") this.#internals.form?.requestSubmit();
        if (this.type === "reset") this.#internals.form?.reset();
      });
    });
  }

  get type() {
    return this.#button.type;
  }

  set type(value: string) {
    this.setAttribute("type", value);
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean) {
    this.toggleAttribute("disabled", value);
  }

  attributeChangedCallback() {
    const type = this.getAttribute("type")?.toLowerCase();
    this.#button.type = type === "submit" || type === "reset" ? type : "button";
  }

  // The platform includes disabled fieldsets as well as the host attribute.
  formDisabledCallback(disabled: boolean) {
    this.#button.disabled = disabled;
  }

  override click() {
    this.#button.click();
  }
}

if (!customElements.get("tbhb-button")) {
  customElements.define("tbhb-button", TbhbButton);
}

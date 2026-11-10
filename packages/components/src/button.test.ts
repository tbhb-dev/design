// SPDX-License-Identifier: Apache-2.0
// Copyright Tony Burns

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Small platform doubles exercise custom-element reactions in Node. The stories
// separately check real shadow DOM, focus, form validation and disabled fieldsets.
class NativeButton extends EventTarget {
  type = "submit";
  disabled = false;
  children: unknown[] = [];
  append = vi.fn((child: unknown) => this.children.push(child));
  click = vi.fn(() => {
    if (!this.disabled)
      this.dispatchEvent(new Event("click", { cancelable: true }));
  });
}

const form = { requestSubmit: vi.fn(), reset: vi.fn() };
let owner: typeof form | null = form;
const registry = new Map<string, typeof ElementDouble>();
class ElementDouble extends EventTarget {
  attributes = new Map<string, string>();
  shadow = { append: vi.fn((...children: unknown[]) => children) };
  attachShadow = vi.fn(() => this.shadow);
  attachInternals = vi.fn(() => ({
    get form() {
      return owner;
    },
  }));
  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }
  hasAttribute(name: string) {
    return this.attributes.has(name);
  }
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
    if (name === "type") this.attributeChangedCallback();
  }
  toggleAttribute(name: string, value: boolean) {
    if (value) this.attributes.set(name, "");
    else this.attributes.delete(name);
    this.formDisabledCallback(value);
  }
  attributeChangedCallback() {}
  formDisabledCallback(disabled: boolean) {
    return disabled;
  }
}

interface ButtonElement extends ElementDouble {
  type: string;
  disabled: boolean;
  click(): void;
}

const nativeButtons: NativeButton[] = [];
const documentDouble = {
  createElement: vi.fn((tag: string) => {
    if (tag === "button") {
      const button = new NativeButton();
      nativeButtons.push(button);
      return button;
    }
    return { tag, textContent: "" };
  }),
};

beforeAll(async () => {
  vi.stubGlobal("HTMLElement", ElementDouble);
  vi.stubGlobal("document", documentDouble);
  vi.stubGlobal("customElements", {
    get: (name: string) => registry.get(name),
    define: (name: string, element: typeof ElementDouble) =>
      registry.set(name, element),
  });
  await import("./button.ts");
});
afterAll(() => vi.unstubAllGlobals());

function create() {
  const Element = registry.get("tbhb-button") as typeof ElementDouble & {
    formAssociated: boolean;
    observedAttributes: string[];
  };
  expect(Element.formAssociated).toBe(true);
  expect(Element.observedAttributes).toEqual(["type"]);
  owner = form;
  form.requestSubmit.mockClear();
  form.reset.mockClear();
  const host = new Element() as ButtonElement;
  const button = nativeButtons.at(-1);
  if (!button) throw new Error("The native button was not created");
  return { host, button };
}

describe("tbhb-button", () => {
  it("registers once, creates an open focus-delegating root and slots its label", async () => {
    const original = registry.get("tbhb-button");
    vi.resetModules();
    await import("./button.ts");
    expect(registry.get("tbhb-button")).toBe(original);
    const { host, button } = create();
    expect(host.attachInternals).toHaveBeenCalledOnce();
    expect(host.attachShadow).toHaveBeenCalledWith({
      mode: "open",
      delegatesFocus: true,
    });
    expect(button.children).toEqual([{ tag: "slot", textContent: "" }]);
    const call = host.shadow.append.mock.calls.at(0);
    if (!call) throw new Error("The shadow root was not populated");
    const [style, native] = call;
    expect(style).toHaveProperty("tag", "style");
    expect(style).toHaveProperty(
      "textContent",
      expect.stringContaining("--tbhb-color-accent-solid"),
    );
    expect(native).toBe(button);
    expect(host.type).toBe("button");
    expect(host.disabled).toBe(false);
  });

  it.each(["button", "submit", "reset", "SUBMIT", "RESET", "invalid", ""])(
    "forwards type %s with a safe fallback",
    (value) => {
      const { host, button } = create();
      host.type = value;
      expect(host.getAttribute("type")).toBe(value);
      expect(host.type).toBe(
        ["submit", "reset"].includes(value.toLowerCase())
          ? value.toLowerCase()
          : "button",
      );
      expect(button.type).toBe(host.type);
      host.attributes.delete("type");
      host.attributeChangedCallback();
      expect(host.type).toBe("button");
    },
  );

  it("reflects disabled and follows platform disabled reactions", () => {
    const { host, button } = create();
    host.disabled = true;
    expect(host.hasAttribute("disabled")).toBe(true);
    expect(host.disabled).toBe(true);
    expect(button.disabled).toBe(true);
    host.disabled = false;
    expect(host.disabled).toBe(false);
    expect(button.disabled).toBe(false);
    host.formDisabledCallback(true);
    expect(button.disabled).toBe(true);
    expect(host.disabled).toBe(false);
    host.formDisabledCallback(false);
    expect(button.disabled).toBe(false);
  });

  it.each(["button", "submit", "reset"])(
    "activates type %s through the native click",
    async (type) => {
      const { host, button } = create();
      host.type = type;
      host.click();
      expect(button.click).toHaveBeenCalledOnce();
      expect(form.requestSubmit).not.toHaveBeenCalled();
      expect(form.reset).not.toHaveBeenCalled();
      await Promise.resolve();
      expect(form.requestSubmit).toHaveBeenCalledTimes(
        type === "submit" ? 1 : 0,
      );
      expect(form.reset).toHaveBeenCalledTimes(type === "reset" ? 1 : 0);
    },
  );

  it.each(["submit", "reset"])(
    "does nothing outside a form for %s",
    async (type) => {
      const { host } = create();
      owner = null;
      host.type = type;
      host.click();
      await Promise.resolve();
      expect(form.requestSubmit).not.toHaveBeenCalled();
      expect(form.reset).not.toHaveBeenCalled();
    },
  );

  it.each(["submit", "reset"])(
    "honors cancellation and disabled state for %s",
    async (type) => {
      const { host, button } = create();
      host.type = type;
      button.addEventListener(
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
      button.disabled = true;
      button.dispatchEvent(new Event("click"));
      await Promise.resolve();
      host.click();
      await Promise.resolve();
      expect(form.requestSubmit).not.toHaveBeenCalled();
      expect(form.reset).not.toHaveBeenCalled();
    },
  );
});

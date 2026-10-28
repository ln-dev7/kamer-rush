import { createElement, ChevronDown, Check } from "lucide";
let sequence = 0;
const selectInstances = new Set<CustomSelect>();
export type SelectOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};
export function nextOptionIndex(
  options: SelectOption[],
  from: number,
  direction: number,
) {
  if (!options.length) return -1;
  for (let step = 1; step <= options.length; step++) {
    const i = (from + direction * step + options.length * 2) % options.length;
    if (!options[i].disabled) return i;
  }
  return -1;
}
export class CustomSelect {
  readonly button: HTMLButtonElement;
  readonly menu: HTMLDivElement;
  private options: SelectOption[];
  private active = 0;
  private openState = false;
  private textBuffer = "";
  private typedAt = 0;
  value: string;
  onChange?: (value: string) => void;
  constructor(
    readonly root: HTMLElement,
    label: string,
    options: SelectOption[],
    initial = options[0]?.value || "",
  ) {
    selectInstances.add(this);
    const id = `select-${++sequence}`;
    this.options = options;
    this.value = initial;
    root.classList.add("ui-select");
    const caption = document.createElement("span");
    caption.className = "ui-field-label";
    caption.id = `${id}-label`;
    caption.textContent = label;
    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.className = "ui-select-trigger";
    this.button.setAttribute("role", "combobox");
    this.button.setAttribute("aria-label", label);
    this.button.setAttribute("aria-haspopup", "listbox");
    this.button.setAttribute("aria-expanded", "false");
    this.button.setAttribute("aria-controls", `${id}-list`);
    this.menu = document.createElement("div");
    this.menu.className = "ui-select-popover hidden";
    this.menu.id = `${id}-list`;
    this.menu.setAttribute("role", "listbox");
    this.menu.setAttribute("aria-labelledby", caption.id);
    document.body.append(this.menu);
    root.replaceChildren(caption, this.button);
    this.render();
    this.button.onclick = () => (this.openState ? this.close() : this.open());
    this.button.onkeydown = (e) => this.key(e);
    document.addEventListener("pointerdown", (e) => {
      if (
        this.openState &&
        !root.contains(e.target as Node) &&
        !this.menu.contains(e.target as Node)
      )
        this.close(false);
    });
    addEventListener("resize", () => this.close(false));
  }
  setDisabled(disabled: boolean) {
    this.button.disabled = disabled;
    this.button.setAttribute("aria-disabled", String(disabled));
    if (disabled) this.close(false);
  }
  setOptions(options: SelectOption[], value = options[0]?.value || "") {
    this.options = options;
    this.value = value;
    this.render();
  }
  setValue(value: string, notify = true) {
    if (!this.options.some((o) => o.value === value && !o.disabled)) return;
    this.value = value;
    this.render();
    if (notify) this.onChange?.(value);
  }
  private render() {
    const selected = this.options.find((o) => o.value === this.value);
    this.button.replaceChildren();
    const text = document.createElement("span");
    text.textContent = selected?.label || "Indisponible";
    this.button.append(
      text,
      createElement(ChevronDown, {
        width: 16,
        height: 16,
        "aria-hidden": "true",
      }),
    );
    this.menu.replaceChildren();
    this.options.forEach((o, i) => {
      const option = document.createElement("div");
      option.id = `${this.menu.id}-${i}`;
      option.className = "ui-select-option";
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", String(o.value === this.value));
      option.setAttribute("aria-disabled", String(!!o.disabled));
      const copy = document.createElement("span"),
        title = document.createElement("b");
      title.textContent = o.label;
      copy.append(title);
      if (o.description) {
        const small = document.createElement("small");
        small.textContent = o.description;
        copy.append(small);
      }
      option.append(copy);
      if (o.value === this.value)
        option.append(
          createElement(Check, {
            width: 16,
            height: 16,
            "aria-hidden": "true",
          }),
        );
      option.onpointermove = () => {
        this.active = i;
        this.highlight();
      };
      option.onpointerdown = (e) => e.preventDefault();
      option.onclick = () => {
        if (!o.disabled) {
          this.setValue(o.value);
          this.close();
        }
      };
      this.menu.append(option);
    });
  }
  open() {
    if (this.button.disabled) return;
    for (const instance of selectInstances)
      if (instance !== this) instance.close(false);
    this.openState = true;
    this.active = Math.max(
      0,
      this.options.findIndex((o) => o.value === this.value),
    );
    const r = this.button.getBoundingClientRect(),
      height = Math.min(280, this.options.length * 62 + 12),
      below = innerHeight - r.bottom - 16,
      above = r.top - 16;
    this.menu.style.width = `${r.width}px`;
    this.menu.style.left = `${Math.max(8, Math.min(r.left, innerWidth - r.width - 8))}px`;
    this.menu.style.maxHeight = `${Math.max(90, Math.min(height, Math.max(below, above)))}px`;
    this.menu.style.top =
      below >= Math.min(height, 200) || below >= above
        ? `${r.bottom + 7}px`
        : `${Math.max(8, r.top - Math.min(height, above) - 7)}px`;
    this.menu.classList.remove("hidden");
    this.button.setAttribute("aria-expanded", "true");
    this.highlight();
  }
  close(focus = true) {
    this.openState = false;
    this.menu.classList.add("hidden");
    this.button.setAttribute("aria-expanded", "false");
    this.button.removeAttribute("aria-activedescendant");
    if (focus && document.contains(this.button))
      this.button.focus({ preventScroll: true });
  }
  private highlight() {
    Array.from(this.menu.children).forEach((o, i) =>
      o.classList.toggle("active", i === this.active),
    );
    this.button.setAttribute(
      "aria-activedescendant",
      `${this.menu.id}-${this.active}`,
    );
    this.menu.children[this.active]?.scrollIntoView({ block: "nearest" });
  }
  private key(e: KeyboardEvent) {
    if (e.key === "Tab") {
      this.close(false);
      return;
    }
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      this.close();
      return;
    }
    if (["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      if (!this.openState) {
        this.open();
        if (e.key === "ArrowUp")
          this.active = nextOptionIndex(this.options, 0, -1);
      } else if (e.key === "Enter" || e.key === " ") {
        const option = this.options[this.active];
        if (option && !option.disabled) {
          this.setValue(option.value);
          this.close();
        }
        return;
      } else if (e.key === "Home")
        this.active = nextOptionIndex(this.options, -1, 1);
      else if (e.key === "End")
        this.active = nextOptionIndex(this.options, 0, -1);
      else
        this.active = nextOptionIndex(
          this.options,
          this.active,
          e.key === "ArrowUp" ? -1 : 1,
        );
      this.highlight();
      return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      const now = performance.now();
      this.textBuffer =
        now - this.typedAt > 700 ? e.key : this.textBuffer + e.key;
      this.typedAt = now;
      const found = this.options.findIndex(
        (o) =>
          !o.disabled &&
          o.label
            .toLocaleLowerCase()
            .startsWith(this.textBuffer.toLocaleLowerCase()),
      );
      if (found >= 0) {
        if (!this.openState) this.open();
        this.active = found;
        this.highlight();
      }
    }
  }
}
export class CustomSlider {
  readonly control: HTMLDivElement;
  private fill: HTMLSpanElement;
  private thumb: HTMLSpanElement;
  private output: HTMLOutputElement;
  value: number;
  onChange?: (v: number) => void;
  constructor(root: HTMLElement, label: string, initial: number) {
    this.value = initial;
    root.className = "ui-slider-field";
    const top = document.createElement("div");
    top.className = "ui-slider-label";
    const name = document.createElement("span");
    name.textContent = label;
    this.output = document.createElement("output");
    top.append(name, this.output);
    this.control = document.createElement("div");
    this.control.className = "ui-slider";
    this.control.tabIndex = 0;
    this.control.setAttribute("role", "slider");
    this.control.setAttribute("aria-label", label);
    this.control.setAttribute("aria-valuemin", "0");
    this.control.setAttribute("aria-valuemax", "100");
    this.fill = document.createElement("span");
    this.fill.className = "ui-slider-fill";
    this.thumb = document.createElement("span");
    this.thumb.className = "ui-slider-thumb";
    this.control.append(this.fill, this.thumb);
    root.replaceChildren(top, this.control);
    this.set(initial, false);
    const fromPointer = (e: PointerEvent) => {
      const r = this.control.getBoundingClientRect();
      this.set((e.clientX - r.left) / r.width);
    };
    this.control.onpointerdown = (e) => {
      e.preventDefault();
      this.control.focus();
      this.control.setPointerCapture(e.pointerId);
      fromPointer(e);
    };
    this.control.onpointermove = (e) => {
      if (this.control.hasPointerCapture(e.pointerId)) fromPointer(e);
    };
    this.control.onkeydown = (e) => {
      if (e.key === "Tab") return;
      e.stopPropagation();
      const delta = ["ArrowRight", "ArrowUp"].includes(e.key)
        ? 0.05
        : ["ArrowLeft", "ArrowDown"].includes(e.key)
          ? -0.05
          : e.key === "PageUp"
            ? 0.1
            : e.key === "PageDown"
              ? -0.1
              : 0;
      if (delta || e.key === "Home" || e.key === "End") {
        e.preventDefault();
        this.set(
          e.key === "Home" ? 0 : e.key === "End" ? 1 : this.value + delta,
        );
      }
    };
  }
  set(v: number, notify = true) {
    this.value = Math.max(0, Math.min(1, v));
    const percentage = Math.round(this.value * 100);
    this.output.textContent = `${percentage} %`;
    this.control.setAttribute("aria-valuenow", String(percentage));
    this.control.setAttribute("aria-valuetext", `${percentage} pour cent`);
    this.fill.style.width = `${percentage}%`;
    this.thumb.style.left = `${percentage}%`;
    if (notify) this.onChange?.(this.value);
  }
}
export function bindSwitch(
  button: HTMLButtonElement,
  initial: boolean,
  change: (enabled: boolean) => void,
) {
  let enabled = initial;
  button.type = "button";
  button.classList.add("ui-switch");
  button.setAttribute("role", "switch");
  const render = () => {
    button.setAttribute("aria-checked", String(enabled));
    button.innerHTML = "<span></span>";
  };
  button.onclick = () => {
    enabled = !enabled;
    render();
    change(enabled);
  };
  render();
  return {
    set(v: boolean) {
      enabled = v;
      render();
    },
    get value() {
      return enabled;
    },
  };
}

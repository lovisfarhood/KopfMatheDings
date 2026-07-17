import { formatExpression } from "../core/expression.js";
import { MathEntryModel } from "./input-model.js";

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[character]);

function modeFor(spec) {
  if (spec.type === "choice") return "choice";
  if (spec.type === "fields" || spec.type === "matrix") return "structured";
  return "expression";
}

function defaultTemplate(spec) {
  const keys = spec.fields.map(field => field.key);
  if (keys.length === 2 && keys[0] === "a" && keys[1] === "b") {
    return [{ slot: "a" }, "x + ", { slot: "b" }];
  }
  if (keys.length === 2 && keys[0] === "re" && keys[1] === "im") {
    return [{ slot: "re" }, " + ", { slot: "im" }, "i"];
  }
  if (keys.every((key, index) => key === `a${index}`)) {
    return keys.flatMap((key, index) => [index ? " + " : "", { slot: key }, index ? `x${index > 1 ? ["", "", "²", "³", "⁴"][index] || `^${index}` : ""}` : ""]);
  }
  return keys.flatMap((key, index) => [index ? ", " : "(", { slot: key }, index === keys.length - 1 ? ")" : ""]);
}

function fieldDefinition(spec) {
  if (spec.type === "matrix") {
    return Array.from({ length: spec.rows * spec.columns }, (_, index) => ({
      key: `m-${Math.floor(index / spec.columns)}-${index % spec.columns}`,
      label: `Matrix Zeile ${Math.floor(index / spec.columns) + 1}, Spalte ${(index % spec.columns) + 1}`
    }));
  }
  if (spec.type === "fields") return spec.fields;
  return [{ key: "value", label: spec.label || (spec.type === "set" ? "Lösungen" : "Antwort") }];
}

class ChoiceController {
  constructor(root, spec, options) {
    this.root = root;
    this.spec = spec;
    this.options = options;
    this.selected = "";
    this.disabled = false;
    this.render();
  }

  render() {
    this.root.replaceChildren();
    this.root.className = "answer answer-choice";
    const group = document.createElement("div");
    group.className = "choices";
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", this.spec.label || "Antwortmöglichkeiten");
    for (const option of this.spec.options) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice";
      button.dataset.value = option.value;
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", String(this.selected === option.value));
      button.disabled = this.disabled;
      button.innerHTML = `<span class="choice-marker" aria-hidden="true"></span><span>${escapeHtml(option.label)}</span>`;
      button.addEventListener("click", () => {
        this.selected = option.value;
        this.render();
        this.root.querySelector(`[data-value="${CSS.escape(option.value)}"]`)?.focus({ preventScroll: true });
        this.options.onChange?.();
      });
      group.append(button);
    }
    this.root.append(group);
  }

  collect() {
    return this.selected;
  }

  setDisabled(value) {
    this.disabled = Boolean(value);
    this.root.querySelectorAll("button").forEach(button => { button.disabled = this.disabled; });
  }

  focus() {
    this.root.querySelector("button")?.focus({ preventScroll: true });
  }

  applyKey(action) {
    if (action === "submit") this.options.onSubmit?.();
  }

  insertValue() {}

  currentValue() {
    return this.selected;
  }
}

export class MathInputController {
  constructor(root, spec, options = {}) {
    this.root = root;
    this.spec = spec;
    this.options = options;
    this.fields = fieldDefinition(spec);
    this.model = new MathEntryModel(this.fields.map(field => field.key), {
      columns: spec.type === "matrix" ? spec.columns : this.fields.length
    });
    this.disabled = false;
    this.render();
  }

  renderSlot(field, index) {
    const slot = this.model.slots[index];
    const element = document.createElement("div");
    element.className = "math-slot";
    element.dataset.slot = field.key;
    element.tabIndex = this.disabled ? -1 : 0;
    element.setAttribute("role", "textbox");
    element.setAttribute("aria-label", field.label || field.key);
    element.setAttribute("aria-multiline", "false");
    element.setAttribute("aria-readonly", String(this.disabled));
    element.setAttribute("aria-valuetext", slot.value || "leer");

    if (index === this.model.activeIndex && !this.disabled) {
      element.classList.add("is-active");
      const before = escapeHtml(slot.value.slice(0, slot.cursor)).replace(/-/g, "−").replace(/\*/g, "·");
      const after = escapeHtml(slot.value.slice(slot.cursor)).replace(/-/g, "−").replace(/\*/g, "·");
      element.innerHTML = `<span>${before}</span><span class="entry-caret" aria-hidden="true"></span><span>${after}</span>`;
    } else if (slot.value) {
      const formatted = formatExpression(slot.value);
      element.innerHTML = formatted.html;
    } else {
      element.innerHTML = `<span class="slot-placeholder">${escapeHtml(field.label || "…")}</span>`;
    }

    element.addEventListener("pointerdown", event => {
      event.preventDefault();
      this.model.activate(index, slot.value.length);
      this.render();
      this.focus();
    });
    element.addEventListener("focus", () => {
      if (this.model.activeIndex !== index) {
        this.model.activate(index, slot.value.length);
        this.render();
        this.focus();
      }
    });
    element.addEventListener("keydown", event => this.handleKeydown(event));
    return element;
  }

  renderStructured(container) {
    if (this.spec.type === "matrix") {
      const bracket = document.createElement("div");
      bracket.className = "matrix-editor";
      bracket.style.setProperty("--matrix-columns", this.spec.columns);
      this.fields.forEach((field, index) => bracket.append(this.renderSlot(field, index)));
      container.append(bracket);
      return;
    }

    const template = this.spec.template || defaultTemplate(this.spec);
    const row = document.createElement("div");
    row.className = "inline-template";
    for (const part of template) {
      if (typeof part === "string") {
        const text = document.createElement("span");
        text.className = "template-text";
        text.textContent = part;
        row.append(text);
      } else {
        const index = this.fields.findIndex(field => field.key === part.slot);
        if (index >= 0) row.append(this.renderSlot(this.fields[index], index));
      }
    }
    container.append(row);
  }

  renderExpression(container) {
    container.append(this.renderSlot(this.fields[0], 0));
    const slot = this.model.slots[0];
    const interpretation = document.createElement("div");
    interpretation.className = "interpretation";
    interpretation.setAttribute("aria-live", "polite");
    if (!slot.value) {
      interpretation.innerHTML = "<span>Die formatierte Eingabe erscheint hier.</span>";
    } else {
      const formatted = formatExpression(slot.value);
      interpretation.classList.toggle("has-error", !formatted.ok);
      interpretation.innerHTML = formatted.ok
        ? `<span class="interpretation-label">So lesen wir:</span><span class="interpreted-math">${formatted.html}</span>`
        : `<span class="interpretation-label">Noch unvollständig:</span><span>${escapeHtml(formatted.error)}</span>`;
    }
    container.append(interpretation);
  }

  render() {
    this.root.replaceChildren();
    this.root.className = `answer answer-${modeFor(this.spec)}`;
    const container = document.createElement("div");
    container.className = "answer-editor";
    if (this.spec.type === "fields" || this.spec.type === "matrix") this.renderStructured(container);
    else this.renderExpression(container);
    this.root.append(container);
  }

  handleKeydown(event) {
    if (this.disabled) return;
    const result = this.model.handleHardwareKey(event);
    if (result === "ignored") return;
    event.preventDefault();
    if (result === "submit") {
      this.options.onSubmit?.();
      return;
    }
    this.render();
    this.focus();
    this.options.onChange?.();
  }

  applyKey(action, literal = null) {
    if (this.disabled) return;
    if (action === "submit") {
      this.options.onSubmit?.();
      return;
    }
    if (action === "left") this.model.moveLeft();
    else if (action === "right") this.model.moveRight();
    else if (action === "up") this.model.moveVertical(-1);
    else if (action === "down") this.model.moveVertical(1);
    else if (action === "backspace") this.model.backspace();
    else if (action === "clear") this.model.clearAll();
    else this.model.insertAction(action, literal);
    this.render();
    this.focus();
    this.options.onChange?.();
  }

  insertValue(value) {
    if (this.disabled) return;
    this.model.insertText(String(value));
    this.render();
    this.focus();
    this.options.onChange?.();
  }

  collect() {
    const values = this.model.values();
    if (this.spec.type === "number" || this.spec.type === "expression" || this.spec.type === "set") return values.value;
    if (this.spec.type === "fields") return values;
    if (this.spec.type === "matrix") {
      return Array.from({ length: this.spec.rows }, (_, row) => Array.from({ length: this.spec.columns }, (_, column) => values[`m-${row}-${column}`]));
    }
    return "";
  }

  setDisabled(value) {
    this.disabled = Boolean(value);
    this.render();
  }

  focus() {
    this.root.querySelector(`[data-slot="${this.model.active.key}"]`)?.focus({ preventScroll: true });
  }

  currentValue() {
    return this.model.active.value;
  }
}

export function renderInputs(root, spec, options = {}) {
  const controller = spec.type === "choice" ? new ChoiceController(root, spec, options) : new MathInputController(root, spec, options);
  root.__kopfmatheController = controller;
  return controller;
}

export function collect(root) {
  return root.__kopfmatheController?.collect() ?? "";
}

export function disable(root, value) {
  root.__kopfmatheController?.setDisabled(value);
}

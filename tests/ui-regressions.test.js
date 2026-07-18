import test from "node:test";
import assert from "node:assert/strict";
import { MathKeyboard } from "../src/ui/math-keyboard.js";
import { dockMetrics } from "../src/ui/layout.js";
import {
  chipFromController,
  displaySerialized,
  serializeInput,
  serializedComplete,
  valuesFromSerialized
} from "../src/ui/inputs.js";

class FakeClassList {
  constructor(owner) { this.owner = owner; }
  values() { return new Set(String(this.owner.className || "").split(/\s+/).filter(Boolean)); }
  write(values) { this.owner.className = [...values].join(" "); }
  add(...names) { const values = this.values(); names.forEach(name => values.add(name)); this.write(values); }
  toggle(name, force) { const values = this.values(); const active = force ?? !values.has(name); active ? values.add(name) : values.delete(name); this.write(values); return active; }
  contains(name) { return this.values().has(name); }
}

class FakeElement {
  constructor(tag = "div") {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.className = "";
    this.classList = new FakeClassList(this);
    this.dataset = {};
    this.attributes = new Map();
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  addEventListener() {}
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = [...children]; }
}

test("Tastatur rendert innerhalb des Docks und erhält keyboard-dock bei Updates", () => {
  const previous = globalThis.document;
  globalThis.document = { createElement: tag => new FakeElement(tag) };
  try {
    const dock = new FakeElement("section");
    dock.className = "keyboard-dock custom-shell";
    const keyboard = new MathKeyboard(dock);
    assert.equal(dock.classList.contains("keyboard-dock"), true);
    assert.equal(dock.classList.contains("math-keyboard"), false);
    assert.equal(dock.children.length, 1);
    assert.equal(dock.children[0].classList.contains("math-keyboard"), true);
    keyboard.render();
    keyboard.setController({ spec: { type: "choice" } });
    assert.equal(dock.classList.contains("keyboard-dock"), true);
    assert.equal(dock.children[0].classList.contains("is-choice"), true);
  } finally {
    globalThis.document = previous;
  }
});

test("vollständige Ausdrücke, Felder, Vektoren, Matrizen und Mengen werden serialisiert", () => {
  const expression = serializeInput({ type: "expression" }, "-3/2*x^2+4*x-1");
  const fieldsSpec = { type: "fields", fields: [{ key: "A" }, { key: "B" }] };
  const fields = serializeInput(fieldsSpec, { A: "2", B: "-3" });
  const vectorSpec = { type: "fields", subtype: "vector", fields: [{ key: "x" }, { key: "y" }] };
  const vector = serializeInput(vectorSpec, { x: "2", y: "-1" });
  const matrixSpec = { type: "matrix", rows: 2, columns: 2, label: "A" };
  const matrix = serializeInput(matrixSpec, [["1", "2"], ["3", "4"]]);
  const set = serializeInput({ type: "set" }, "-2;3");
  for (const value of [expression, fields, vector, matrix, set]) assert.equal(serializedComplete(value), true);
  assert.deepEqual(valuesFromSerialized(fieldsSpec, fields), { A: "2", B: "-3" });
  assert.deepEqual(valuesFromSerialized(vectorSpec, vector), { x: "2", y: "-1" });
  assert.deepEqual(valuesFromSerialized(matrixSpec, matrix), { "m-0-0": "1", "m-0-1": "2", "m-1-0": "3", "m-1-1": "4" });
  assert.equal(valuesFromSerialized({ ...matrixSpec, rows: 3 }, matrix), null);
  assert.equal(displaySerialized(matrix, matrixSpec), "A=[[1,2],[3,4]]");
  assert.equal(displaySerialized(vector, vectorSpec), "(x,y)=(2,−1)");
  assert.equal(serializedComplete(serializeInput(fieldsSpec, { A: "2", B: "" })), false);
  const automatic = chipFromController({
    isComplete: () => true,
    serialize: () => fields,
    displayValue: () => "A=2, B=−3"
  });
  assert.deepEqual(automatic.serialized, fields);
  assert.equal(automatic.label, "A=2, B=−3");
  assert.equal(chipFromController({ isComplete: () => false }), null);
});

test("Dock-Geometrie bleibt bei allen geforderten mobilen Viewports überlappungsfrei", () => {
  const viewports = [
    { width: 375, height: 667, safeBottom: 20 },
    { width: 390, height: 844, safeBottom: 34 },
    { width: 393, height: 852, safeBottom: 34 },
    { width: 430, height: 932, safeBottom: 34 },
    { width: 412, height: 915, safeBottom: 0 }
  ];
  for (const viewport of viewports) {
    const layout = dockMetrics(viewport);
    assert.equal(layout.workspaceBottom, layout.keyboardTop);
    assert.ok(layout.workspaceTop > 0, `${viewport.width}x${viewport.height}`);
    assert.equal(layout.keyboardBottom, viewport.height);
    assert.ok(layout.contentPaddingBottom > layout.keyboardHeight + layout.workspaceHeight);
    assert.ok(layout.keyboardTop - layout.workspaceHeight >= 250, "Aufgabe besitzt einen scrollbar bleibenden Sichtbereich");
  }
});

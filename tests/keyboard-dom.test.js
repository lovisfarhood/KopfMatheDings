import test from "node:test";
import assert from "node:assert/strict";
import { installDom } from "./dom-helpers.js";
import { renderInputs } from "../src/ui/inputs.js";
import { MathKeyboard } from "../src/ui/math-keyboard.js";

test("Tastatur rendert in einem stabilen echten DOM-Dock", () => {
  const { document } = installDom("<!doctype html><html><body><section id=keyboard-dock class=keyboard-dock hidden></section></body></html>");
  const dock = document.querySelector("#keyboard-dock");
  const keyboard = new MathKeyboard(dock);
  assert.equal(dock.id, "keyboard-dock");
  assert.equal(dock.className, "keyboard-dock");
  assert.equal(dock.hidden, true);
  assert.equal(dock.querySelectorAll(":scope > .math-keyboard").length, 1);
  assert.equal(dock.querySelectorAll(".keyboard-tab").length, 3);
  assert.equal(dock.querySelectorAll(".keyboard-grid .math-key").length, 20);

  const surface = keyboard.surface;
  [...dock.querySelectorAll(".keyboard-tab")].find(button => button.textContent === "Funktionen").click();
  assert.equal(keyboard.surface, surface);
  assert.equal(dock.className, "keyboard-dock");
  assert.equal(dock.querySelector('.keyboard-tab[aria-selected="true"]').textContent, "Funktionen");
});

test("DOM-Tastatur gibt Minus, Bruch und Hardwarezeichen ohne natives Eingabefeld ein", () => {
  const { document } = installDom("<!doctype html><html><body><section id=dock class=keyboard-dock></section><div id=inputs></div></body></html>");
  const controller = renderInputs(document.querySelector("#inputs"), { type: "expression", label: "Term" });
  const keyboard = new MathKeyboard(document.querySelector("#dock"));
  keyboard.setController(controller);
  document.querySelector('[data-action="minus"]').click();
  document.querySelector('[data-action="7"]').click();
  assert.equal(controller.collect(), "-7");
  controller.applyKey("fraction");
  assert.equal(controller.collect(), "-7()/()");
  const event = new Event("keydown", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "key", { value: "8" });
  document.querySelector(".math-slot").dispatchEvent(event);
  assert.match(controller.collect(), /8/);
  assert.equal(document.querySelectorAll("input, textarea, [contenteditable=true]").length, 0);
  assert.equal(document.querySelector(".math-slot").getAttribute("role"), "textbox");
});

test("alle strukturierten Eingabetypen serialisieren und restaurieren ihren DOM-Zustand", () => {
  const { document } = installDom("<!doctype html><html><body><div id=one></div><div id=two></div><div id=three></div><div id=four></div></body></html>");
  const specs = [
    { type: "number", label: "Zahl" },
    { type: "set", label: "Menge" },
    { type: "fields", fields: [{ key: "x", label: "x" }, { key: "y", label: "y" }] },
    { type: "matrix", rows: 2, columns: 2 }
  ];
  const values = [
    ["-3/2"],
    ["-2;3"],
    ["4", "-5"],
    ["1", "2", "3", "4"]
  ];
  specs.forEach((spec, index) => {
    const root = document.querySelector(`#${["one", "two", "three", "four"][index]}`);
    const first = renderInputs(root, spec);
    first.model.slots.forEach((slot, slotIndex) => first.model.setValue(slot.key, values[index][slotIndex]));
    const serialized = JSON.parse(JSON.stringify(first.serialize()));
    const replacement = document.createElement("div");
    const restored = renderInputs(replacement, spec);
    assert.equal(restored.restore(serialized), true);
    assert.deepEqual(restored.collect(), first.collect());
    assert.deepEqual(restored.serialize(), serialized);
  });
});

test("Multiple Choice serialisiert Auswahl und erhält das Tastatur-Dock", () => {
  const { document } = installDom("<!doctype html><html><body><section id=dock class=keyboard-dock></section><div id=choice></div></body></html>");
  const spec = { type: "choice", options: [{ value: "a", label: "A" }, { value: "b", label: "B" }] };
  const controller = renderInputs(document.querySelector("#choice"), spec);
  document.querySelector('[data-value="b"]').click();
  const snapshot = controller.serialize();
  const secondRoot = document.createElement("div");
  const restored = renderInputs(secondRoot, spec);
  assert.equal(restored.restore(snapshot), true);
  assert.equal(restored.collect(), "b");
  const keyboard = new MathKeyboard(document.querySelector("#dock"));
  keyboard.setController(restored);
  assert.equal(keyboard.surface.classList.contains("is-choice"), true);
  assert.equal(document.querySelector("#dock").classList.contains("keyboard-dock"), true);
});

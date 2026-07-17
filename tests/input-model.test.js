import test from "node:test";
import assert from "node:assert/strict";
import { MathEntryModel, insertionFor } from "../src/ui/input-model.js";

const event = (key, shiftKey = false) => ({ key, shiftKey });

test("Minus, negative Brüche, Exponenten, Wurzeln und verschachtelte Strukturen", () => {
  const model = new MathEntryModel(["value"]);
  model.insertAction("minus");
  model.insertText("3");
  model.insertAction("fraction");
  model.insertText("2");
  assert.equal(model.active.value, "-3(2)/()" );
  model.clearAll();
  model.insertAction("sqrt");
  model.insertAction("fraction");
  assert.equal(model.active.value, "sqrt(()/())");
  assert.equal(insertionFor("power").text, "^()");
});

test("Cursor links/rechts navigiert aus Exponenten und Brüchen heraus", () => {
  const model = new MathEntryModel(["value"]);
  model.insertAction("power");
  model.insertText("2");
  assert.equal(model.active.value, "^(2)");
  const inside = model.active.cursor;
  model.moveRight();
  assert.equal(model.active.cursor, inside + 1);
  model.clearAll();
  model.insertAction("fraction");
  const numerator = model.active.cursor;
  for (let index = 0; index < 3; index += 1) model.moveRight();
  assert.ok(model.active.cursor > numerator);
});

test("Slotwechsel bleibt in einem gemeinsamen Antwortobjekt", () => {
  const model = new MathEntryModel(["a", "b"]);
  model.insertText("-2");
  model.moveRight();
  model.insertText("5");
  assert.deepEqual(model.values(), { a: "-2", b: "5" });
  model.moveLeft();
  model.moveLeft();
  assert.equal(model.active.key, "a");
});

test("Matrixnavigation funktioniert horizontal und vertikal", () => {
  const model = new MathEntryModel(["m00", "m01", "m10", "m11"], { columns: 2 });
  model.activate(0);
  model.moveVertical(1);
  assert.equal(model.active.key, "m10");
  model.moveRight();
  assert.equal(model.active.key, "m11");
  model.moveVertical(-1);
  assert.equal(model.active.key, "m01");
});

test("Rücktaste, Leeren und Hardware-Tastatur", () => {
  const model = new MathEntryModel(["value"]);
  assert.equal(model.handleHardwareKey(event("-")), "edit");
  assert.equal(model.handleHardwareKey(event("7")), "edit");
  assert.equal(model.active.value, "-7");
  assert.equal(model.handleHardwareKey(event("Backspace")), "edit");
  assert.equal(model.active.value, "-");
  model.handleHardwareKey(event("Escape"));
  assert.equal(model.active.value, "");
  assert.equal(model.handleHardwareKey(event("Enter")), "submit");
});

test("Tab wechselt Slots, verlässt aber das erste oder letzte Randfeld", () => {
  const model = new MathEntryModel(["a", "b"]);
  assert.equal(model.handleHardwareKey(event("Tab")), "move");
  assert.equal(model.active.key, "b");
  assert.equal(model.handleHardwareKey(event("Tab")), "ignored");
  assert.equal(model.handleHardwareKey(event("Tab", true)), "move");
  assert.equal(model.handleHardwareKey(event("Tab", true)), "ignored");
});

import test from "node:test";
import assert from "node:assert/strict";
import { defaults, load, resetStorage, save } from "../src/core/storage.js";

function fakeStorage() {
  const values = new Map();
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
    clear: () => values.clear()
  };
}

test("Themenmehrfachauswahl und Einstellungen bleiben lokal erhalten", () => {
  globalThis.localStorage = fakeStorage();
  resetStorage();
  const state = load();
  state.selectedTopics = ["taylor", "complex", "matrices"];
  state.difficulty = "plus";
  state.mode = "step";
  save(state);
  const restored = load();
  assert.deepEqual(restored.selectedTopics, ["taylor", "complex", "matrices"]);
  assert.equal(restored.difficulty, "plus");
  assert.equal(restored.mode, "step");
  delete globalThis.localStorage;
});

test("alte v1-Einstellungen werden ohne Datenbruch migriert", () => {
  globalThis.localStorage = fakeStorage();
  localStorage.setItem("kopfmathe.v1", JSON.stringify({ topic: "complex", difficulty: "exam", score: { correct: 4, wrong: 2 } }));
  const migrated = load();
  assert.deepEqual(migrated.selectedTopics, ["complex"]);
  assert.equal(migrated.difficulty, "plus");
  assert.equal(migrated.score.correct, 4);
  resetStorage();
  assert.deepEqual(load().selectedTopics, defaults.selectedTopics);
  delete globalThis.localStorage;
});

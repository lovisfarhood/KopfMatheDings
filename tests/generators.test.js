import test from "node:test";
import assert from "node:assert/strict";
import { canonicalRaw, checkTaskAnswer } from "../src/core/checker.js";
import { createRng } from "../src/core/random.js";
import { registry, validateTask } from "../src/core/registry.js";

const VARIANTS = Math.max(100, Math.ceil(10_000 / registry.length));

function wrong(task) {
  const answer = task.answer;
  if (answer.type === "number") return `(${answer.value})+1`;
  if (answer.type === "expression") return `(${answer.value})+99991`;
  if (answer.type === "complex") return `(${canonicalRaw(task)})+99991`;
  if (answer.type === "angle") return `(${answer.value})+pi`;
  if (answer.type === "set") return `${canonicalRaw(task)}; 99991`;
  if (answer.type === "matrix") {
    const value = answer.values.map(row => row.map(String));
    value[0][0] = `(${value[0][0]})+99991`;
    return value;
  }
  if (answer.type === "fields") {
    const value = Object.fromEntries(Object.entries(answer.values).map(([key, item]) => [key, String(item)]));
    const first = Object.keys(value)[0];
    value[first] = `(${value[first]})+99991`;
    return value;
  }
  if (answer.type === "proportional") return Object.fromEntries(Object.keys(answer.values).map(key => [key, "0"]));
  if (answer.type === "boolean") return answer.value === "true" ? "false" : "true";
  if (answer.type === "choice") return task.inputSpec.options.find(option => option.value !== answer.value)?.value || "__falsch__";
  throw new Error(`Unbekannte Antwortart ${answer.type}`);
}

for (const generator of registry) {
  test(`${generator.id}: ${VARIANTS} geprüfte Varianten`, () => {
    const rng = createRng(`test-${generator.id}`);
    const signatures = new Set();
    for (let index = 0; index < VARIANTS; index += 1) {
      const difficulty = generator.levels[index % generator.levels.length];
      const task = generator.generate(rng, difficulty);
      assert.ok(validateTask(task), task.signature);
      assert.equal(task.generatorId, generator.id);
      assert.ok(task.estimatedSeconds >= 10 && task.estimatedSeconds <= 300);
      assert.ok(task.difficultyValue >= 1 && task.difficultyValue <= 10);
      assert.doesNotMatch(`${task.prompt}${task.explanation}${task.signature}`, /undefined|NaN/);
      assert.equal(checkTaskAnswer(task, canonicalRaw(task)).correct, true);
      const rejected = checkTaskAnswer(task, wrong(task));
      assert.equal(rejected.valid, true, task.signature);
      assert.equal(rejected.correct, false, task.signature);
      signatures.add(task.signature);
    }
    assert.ok(signatures.size >= 10, `${signatures.size} unterschiedliche Varianten`);
  });
}

test("Gesamtumfang erfüllt mindestens 10.000 Aufgaben und 100 je Familie", () => {
  assert.ok(VARIANTS >= 100);
  assert.ok(VARIANTS * registry.length >= 10_000, `${VARIANTS * registry.length} Aufgaben`);
});

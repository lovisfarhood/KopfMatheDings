import test from "node:test";
import assert from "node:assert/strict";
import {
  allGenerators,
  disabledGenerators,
  generateTask,
  generatorsForTopic,
  PRESETS,
  registry,
  TOPICS,
  topicsForWeaknesses,
  validateTask
} from "../src/core/registry.js";

test("18 Themen, eindeutige Familien und dokumentierte Deaktivierungen", () => {
  assert.equal(TOPICS.length, 18);
  assert.equal(allGenerators.length, 102);
  assert.equal(registry.length, 99);
  assert.equal(new Set(allGenerators.map(generator => generator.id)).size, allGenerators.length);
  assert.deepEqual(disabledGenerators.map(generator => generator.id).sort(), ["matrices.add", "numericalMethods.rectangle", "trueFalse.computed"]);
});

test("alle Themen besitzen aktive Generatoren", () => {
  TOPICS.forEach(topic => assert.ok(generatorsForTopic(topic.id).length, topic.id));
});

test("echte Themenmehrfachauswahl schließt alle anderen aus", () => {
  const allowed = new Set(["taylor", "complex", "matrices"]);
  for (let index = 0; index < 1000; index += 1) {
    const task = generateTask({ topics: [...allowed], difficulty: "standard", seed: `multi-${index}` });
    assert.ok(allowed.has(task.topic), task.topic);
  }
});

test("Klausurstandard ist Standard und enthält keine Basis-only-Familien", () => {
  const basisOnly = new Set(allGenerators.filter(generator => generator.levels.length === 1 && generator.levels[0] === "basis").map(generator => generator.id));
  for (let index = 0; index < 1000; index += 1) {
    const task = generateTask({ seed: `standard-${index}` });
    assert.equal(task.difficulty, "standard");
    assert.equal(basisOnly.has(task.generatorId), false, task.generatorId);
  }
});

test("direkte Wiederholung derselben Familie wird vermieden", () => {
  const first = generateTask({ topics: ["complex"], difficulty: "standard", seed: "repeat-a" });
  const second = generateTask({ topics: ["complex"], difficulty: "standard", seed: "repeat-b", history: [{ signature: first.signature, generatorId: first.generatorId }] });
  assert.notEqual(second.generatorId, first.generatorId);
  assert.ok(validateTask(second));
});

test("ähnliche Aufgabe erzwingt dieselbe Generatorfamilie mit neuen Parametern", () => {
  const first = generateTask({ topics: ["derivatives"], difficulty: "plus", seed: "similar-a" });
  const second = generateTask({ topics: ["derivatives"], difficulty: "plus", forcedGeneratorId: first.generatorId, history: [{ signature: first.signature, generatorId: first.generatorId }], seed: "similar-b" });
  assert.equal(second.generatorId, first.generatorId);
  assert.notEqual(second.signature, first.signature);
});

test("Schrittmodus liefert echte mehrstufige Gauß-Aufgabe", () => {
  const task = generateTask({ topics: ["linearSystems"], difficulty: "plus", mode: "step", forcedGeneratorId: "linearSystems.gauss-steps", seed: "steps" });
  assert.equal(task.steps.length, 3);
  assert.ok(task.steps.every(step => step.prompt && step.inputSpec && step.answer));
});

test("Presets sind echte Themenlisten ohne Gemischt-Sonderfall", () => {
  assert.deepEqual(Object.keys(PRESETS), ["exam", "analysis", "linear", "complex", "basics", "weaknesses"]);
  for (const preset of Object.values(PRESETS)) assert.equal(preset.topics.includes("mixed"), false);
});

test("Schwächen-Preset priorisiert lokale Fehler", () => {
  const outcomes = [
    { topic: "complex", status: "wrong" },
    { topic: "matrices", status: "skipped" },
    { topic: "complex", status: "solution" },
    { topic: "taylor", status: "correct" }
  ];
  assert.deepEqual(topicsForWeaknesses(outcomes), ["complex", "matrices"]);
});

test("MATLAB bleibt standardmäßig ausgeschlossen", () => {
  for (let index = 0; index < 1000; index += 1) assert.notEqual(generateTask({ seed: `no-matlab-${index}` }).topic, "matlab");
});

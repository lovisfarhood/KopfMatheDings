import test from "node:test";
import assert from "node:assert/strict";
import {
  allGenerators,
  disabledGenerators,
  generateTask,
  generatorsForTopic,
  PRESETS,
  registry,
  stepGenerators,
  TOPICS,
  topicsForWeaknesses,
  validateTask,
  variantRequestFor
} from "../src/core/registry.js";

test("18 Themen, eindeutige Familien und dokumentierte Deaktivierungen", () => {
  assert.equal(TOPICS.length, 18);
  assert.equal(allGenerators.length, 103);
  assert.equal(registry.length, 100);
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

test("jede Familie nennt nur ihre real implementierte Stufe", () => {
  for (const generator of registry) {
    assert.equal(generator.levels.length, 1, generator.id);
    assert.deepEqual(Object.keys(generator.difficultyConfig), generator.levels, generator.id);
    assert.equal(generator.visibleDifficulty, generator.levels[0], generator.id);
  }
});

test("Schwierigkeitsstufen unterscheiden bei Kerngebieten Struktur und Anspruch", () => {
  const topics = ["complex", "derivatives", "integrals", "matrices", "linearSystems", "decompositions"];
  const averages = {};
  const families = {};
  for (const difficulty of ["basis", "standard", "plus", "transfer"]) {
    const complexities = [];
    families[difficulty] = new Set();
    for (const topic of topics) {
      for (let index = 0; index < 40; index += 1) {
        const task = generateTask({ topics: [topic], difficulty, seed: `difficulty-${topic}-${difficulty}-${index}` });
        assert.equal(task.difficulty, difficulty, `${topic}:${difficulty}`);
        assert.equal(task.difficultyAdjustedFrom, undefined, `${topic}:${difficulty}`);
        complexities.push(task.complexity);
        families[difficulty].add(task.generatorId);
      }
    }
    averages[difficulty] = complexities.reduce((sum, value) => sum + value, 0) / complexities.length;
  }
  assert.ok(averages.basis < averages.standard, JSON.stringify(averages));
  assert.ok(averages.standard < averages.plus, JSON.stringify(averages));
  assert.ok(averages.plus < averages.transfer, JSON.stringify(averages));
  assert.notDeepEqual([...families.basis].sort(), [...families.standard].sort());
  assert.notDeepEqual([...families.standard].sort(), [...families.plus].sort());
  assert.notDeepEqual([...families.plus].sort(), [...families.transfer].sort());
  for (const id of families.transfer) {
    assert.ok([
      "complex.roots", "derivatives.chain-error", "derivatives.rules", "integrals.method",
      "matrices.det-structured-3", "linearSystems.classification", "linearSystems.type",
      "linearSystems.homogeneous", "decompositions.pivot"
    ].includes(id), id);
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

test("1.000 Schrittaufgaben bleiben mehrstufig, validierbar und in ausgewählten Themen", () => {
  const selected = ["integrals", "taylor", "linearSystems", "decompositions"];
  assert.deepEqual(stepGenerators.map(generator => generator.id).sort(), [
    "decompositions.lu-complete",
    "integrals.partial-fractions",
    "linearSystems.gauss-steps",
    "taylor.shifted-exp"
  ]);
  for (let index = 0; index < 1000; index += 1) {
    const task = generateTask({ topics: selected, difficulty: "standard", mode: "step", seed: `step-property-${index}` });
    assert.equal(task.unavailable, undefined);
    assert.ok(selected.includes(task.topic), task.topic);
    assert.ok(task.steps.length >= 2, task.generatorId);
    assert.ok(task.steps.every(step => step.prompt && step.inputSpec && step.answer && step.explanation));
    assert.ok(validateTask(task), task.signature);
    assert.notEqual(task.generatorId, "fallback.add");
  }
});

test("ungeeignete Schritt-Auswahl endet kontrolliert statt mit Themen-Fallback", () => {
  const result = generateTask({ topics: ["complex"], difficulty: "standard", mode: "step", seed: "no-step-complex" });
  assert.equal(result.unavailable, true);
  assert.deepEqual(result.topics, ["complex"]);
  assert.match(result.message, /keine mehrstufige Aufgabe/);
  const headTask = generateTask({ topics: ["complex"], difficulty: "standard", mode: "head", seed: "head-still-works" });
  assert.equal(headTask.unavailable, undefined);
  assert.equal(headTask.topic, "complex");
});

test("einfachere und schwerere Varianten folgen derselben Kompetenz", () => {
  const cases = [
    ["complex.division-general", "easier", "complex.divide-i"],
    ["derivatives.product", "harder", "derivatives.mixed-expression"],
    ["taylor.shifted-exp", "easier", "taylor.exp"],
    ["matrices.eigenvalues", "harder", "matrices.eigenvector"],
    ["decompositions.lu-complete", "easier", "decompositions.lr"],
    ["integrals.partial-fractions", "easier", "integrals.partial-fractions-setup"]
  ];
  for (const [generatorId, direction, expectedId] of cases) {
    const generator = registry.find(item => item.id === generatorId);
    const request = variantRequestFor({ generatorId, difficulty: generator.levels[0], sessionMode: "head" }, direction);
    assert.equal(request.generatorId, expectedId);
    const related = registry.find(item => item.id === request.generatorId);
    assert.equal(related.topic, generator.topic);
    assert.equal(related.competenceId, generator.competenceId);
  }
  assert.equal(variantRequestFor({ generatorId: "basics.signed", difficulty: "basis", sessionMode: "head" }, "easier"), null);
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

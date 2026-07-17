import { createRng } from "./random.js";
import { canonicalRaw, checkTaskAnswer } from "./checker.js";
import { makeTask, numberInput, DIFFICULTIES } from "../topics/helpers.js";
import { generators as basics } from "../topics/basics.js";
import { generators as algebra } from "../topics/algebra.js";
import { generators as complex } from "../topics/complex.js";
import { generators as limits } from "../topics/limits.js";
import { generators as sequences } from "../topics/sequences.js";
import { generators as series } from "../topics/series.js";
import { generators as derivatives } from "../topics/derivatives.js";
import { generators as taylor } from "../topics/taylor.js";
import { generators as integrals } from "../topics/integrals.js";
import { generators as matrices } from "../topics/matrices.js";
import { generators as linearSystems } from "../topics/linearSystems.js";
import { generators as vectorSpaces } from "../topics/vectorSpaces.js";
import { generators as orthogonality } from "../topics/orthogonality.js";
import { generators as decompositions } from "../topics/decompositions.js";
import { generators as numericalMethods } from "../topics/numericalMethods.js";
import { generators as differentialEquations } from "../topics/differentialEquations.js";
import { generators as trueFalse } from "../topics/trueFalse.js";
import { generators as matlab } from "../topics/matlab.js";
import { qualityByTopic } from "../topics/quality-generators.js";

export const TOPICS = Object.freeze([
  { id: "basics", label: "Rechengrundlagen", short: "Grundlagen", group: "Grundlagen", enabled: true },
  { id: "algebra", label: "Algebra & Funktionen", short: "Algebra", group: "Grundlagen", enabled: true },
  { id: "complex", label: "Komplexe Zahlen", short: "Komplex", group: "Grundlagen", enabled: true },
  { id: "limits", label: "Grenzwerte", short: "Grenzwerte", group: "Analysis", enabled: true },
  { id: "sequences", label: "Folgen", short: "Folgen", group: "Analysis", enabled: true },
  { id: "series", label: "Reihen & Potenzreihen", short: "Reihen", group: "Analysis", enabled: true },
  { id: "derivatives", label: "Ableitungen", short: "Ableitungen", group: "Analysis", enabled: true },
  { id: "taylor", label: "Taylorpolynome", short: "Taylor", group: "Analysis", enabled: true },
  { id: "integrals", label: "Integralrechnung", short: "Integrale", group: "Analysis", enabled: true },
  { id: "matrices", label: "Matrizen, Determinanten & Eigenwerte", short: "Matrizen", group: "Lineare Algebra", enabled: true },
  { id: "linearSystems", label: "Lineare Gleichungssysteme", short: "LGS", group: "Lineare Algebra", enabled: true },
  { id: "vectorSpaces", label: "Vektorräume, Basis, Rang & Kern", short: "Vektorräume", group: "Lineare Algebra", enabled: true },
  { id: "orthogonality", label: "Orthogonalität & Approximation", short: "Orthogonalität", group: "Lineare Algebra", enabled: true },
  { id: "decompositions", label: "QR- und LU-Zerlegung", short: "Zerlegungen", group: "Lineare Algebra", enabled: true },
  { id: "numericalMethods", label: "Numerische Verfahren", short: "Numerik", group: "Weitere", enabled: true },
  { id: "differentialEquations", label: "Differentialgleichungen", short: "DGL", group: "Weitere", enabled: true },
  { id: "trueFalse", label: "Methoden & Konzepte", short: "Konzepte", group: "Weitere", enabled: true },
  { id: "matlab", label: "MATLAB & Algorithmen", short: "MATLAB", group: "Weitere", enabled: false }
]);

export const PRESETS = Object.freeze({
  exam: {
    label: "Klausur-Mix",
    topics: ["algebra", "complex", "limits", "sequences", "series", "derivatives", "taylor", "integrals", "matrices", "linearSystems", "vectorSpaces", "orthogonality", "decompositions", "numericalMethods", "differentialEquations"]
  },
  analysis: { label: "Analysis", topics: ["limits", "sequences", "series", "derivatives", "taylor", "integrals", "differentialEquations"] },
  linear: { label: "Lineare Algebra", topics: ["matrices", "linearSystems", "vectorSpaces", "orthogonality", "decompositions"] },
  complex: { label: "Komplexe Zahlen", topics: ["complex"] },
  basics: { label: "Grundlagen", topics: ["basics", "algebra", "complex"] },
  weaknesses: { label: "Schwächen trainieren", topics: [] }
});

const legacyMap = {
  basics,
  algebra,
  complex,
  limits,
  sequences,
  series,
  derivatives,
  taylor,
  integrals,
  matrices,
  linearSystems,
  vectorSpaces,
  orthogonality,
  decompositions,
  numericalMethods,
  differentialEquations,
  trueFalse,
  matlab
};

const map = Object.fromEntries(Object.entries(legacyMap).map(([topic, generators]) => [
  topic,
  Object.freeze([...(generators || []), ...(qualityByTopic[topic] || [])])
]));

export const allGenerators = Object.freeze(Object.values(map).flat());
export const registry = Object.freeze(allGenerators.filter(generator => generator.active));
export const disabledGenerators = Object.freeze(allGenerators.filter(generator => !generator.active));

const EXAM_WEIGHTS = Object.freeze({
  algebra: 7,
  complex: 8,
  limits: 6,
  sequences: 4,
  series: 6,
  derivatives: 10,
  taylor: 10,
  integrals: 10,
  matrices: 11,
  linearSystems: 10,
  vectorSpaces: 6,
  orthogonality: 6,
  decompositions: 5,
  numericalMethods: 3,
  differentialEquations: 4,
  basics: 2,
  trueFalse: 3,
  matlab: 1
});

const STEP_PREFERRED = new Set([
  "integrals.partial-fractions",
  "taylor.shifted-exp",
  "linearSystems.gauss-steps",
  "decompositions.lu-complete",
  "taylor.exp",
  "taylor.sin",
  "taylor.cos"
]);

export const topicById = id => TOPICS.find(topic => topic.id === id) || TOPICS[0];
export const generatorsForTopic = (id, options = {}) => (map[id] || []).filter(generator => options.includeDisabled || generator.active);

export function resolveDifficulty(_rng, requested) {
  if (DIFFICULTIES[requested]) return requested;
  if (requested === "locker") return "basis";
  if (requested === "exam") return "plus";
  return "standard";
}

function normalizedTopics(topics, matlabEnabled) {
  const incoming = Array.isArray(topics) ? topics : typeof topics === "string" ? [topics] : PRESETS.exam.topics;
  const allowed = new Set(TOPICS.filter(topic => topic.enabled || (topic.id === "matlab" && matlabEnabled)).map(topic => topic.id));
  const selected = [...new Set(incoming.filter(topic => topic !== "mixed" && allowed.has(topic)))];
  return selected.length ? selected : [...PRESETS.exam.topics];
}

function generatorIdFromHistory(item) {
  if (item && typeof item === "object" && item.generatorId) return item.generatorId;
  return String(item || "").split(":")[0];
}

function outcomeBoost(generator, outcomes) {
  const recent = (outcomes || []).slice(-80).filter(outcome => outcome.generatorId === generator.id);
  if (!recent.length) return 1;
  const needsPractice = recent.filter(outcome => ["wrong", "skipped", "solution", "hinted"].includes(outcome.status)).length;
  return Math.min(2.2, 1 + needsPractice * 0.22);
}

function candidatesFor({ topics, difficulty, mode, matlabEnabled, forcedGeneratorId }) {
  if (forcedGeneratorId) {
    const forced = registry.find(generator => generator.id === forcedGeneratorId);
    return forced ? [forced] : [];
  }
  const selected = normalizedTopics(topics, matlabEnabled);
  return registry.filter(generator => selected.includes(generator.topic)
    && generator.levels.includes(difficulty)
    && generator.taskModes.includes(mode));
}

export function validateTask(task) {
  if (!task || ![task.id, task.topic, task.generatorId, task.difficulty, task.prompt, task.explanation, task.signature].every(value => typeof value === "string" && value && !/undefined|NaN/.test(value))) return false;
  if (!task.inputSpec || !task.answer || !DIFFICULTIES[task.difficulty]) return false;
  if (!Number.isFinite(task.complexity) || task.complexity < 1 || task.estimatedSeconds < 10 || task.estimatedSeconds > 300) return false;
  const result = checkTaskAnswer(task, canonicalRaw(task));
  if (!result.valid || !result.correct) return false;
  if (!Array.isArray(task.hints) || !task.hints.length) return false;
  if (task.steps?.some(step => {
    if (!step.prompt || !step.inputSpec || !step.answer || !step.explanation) return true;
    const stepResult = checkTaskAnswer(step, canonicalRaw(step));
    return !stepResult.valid || !stepResult.correct;
  })) return false;
  return true;
}

function fallback(rng, difficulty) {
  const a = rng.int(-9, 9), b = rng.int(-9, 9);
  return Object.freeze(makeTask({
    topic: "basics",
    id: "fallback.add",
    title: "Ersatzaufgabe",
    difficulty,
    prompt: `<span class="context">Berechne.</span><span class="math">${a}+(${b})</span>`,
    input: numberInput(),
    answer: { type: "number", value: a + b },
    explanation: `${a}+(${b})=<strong>${a + b}</strong>.`,
    complexity: 1,
    signature: `${a}:${b}:${rng.int(0, 99999)}`
  }));
}

export function generateTask({
  topics,
  topic,
  difficulty = "standard",
  mode = "head",
  history = [],
  outcomes = [],
  matlabEnabled = false,
  forcedGeneratorId = null,
  seed
} = {}) {
  const rng = createRng(seed);
  const resolvedDifficulty = resolveDifficulty(rng, difficulty);
  const selectedTopics = topics || topic || PRESETS.exam.topics;
  let candidates = candidatesFor({ topics: selectedTopics, difficulty: resolvedDifficulty, mode, matlabEnabled, forcedGeneratorId });
  if (!candidates.length) candidates = candidatesFor({ topics: selectedTopics, difficulty: "standard", mode, matlabEnabled, forcedGeneratorId });
  if (!candidates.length) return fallback(rng, resolvedDifficulty);

  const recentSignatures = new Set(history.slice(-30).map(item => typeof item === "object" ? item.signature : item));
  const recentFamilies = history.slice(-8).map(generatorIdFromHistory);
  const lastFamily = recentFamilies.at(-1);
  const weighted = candidates.map(generator => {
    const immediatePenalty = candidates.length > 1 && generator.id === lastFamily ? 0.02 : 1;
    const recentCount = recentFamilies.filter(id => id === generator.id).length;
    const recencyPenalty = 1 / (1 + recentCount * 0.8);
    const stepBoost = mode === "step" && STEP_PREFERRED.has(generator.id) ? 3.8 : 1;
    return {
      value: generator,
      weight: Math.max(0.001, generator.weight * (EXAM_WEIGHTS[generator.topic] || 1) * immediatePenalty * recencyPenalty * stepBoost * outcomeBoost(generator, outcomes))
    };
  });

  let last = null;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const generator = forcedGeneratorId ? candidates[0] : rng.weighted(weighted);
    try {
      const generated = generator.generate(rng, resolvedDifficulty, { mode });
      const task = Object.freeze({ ...generated, sessionMode: mode });
      if (!validateTask(task)) continue;
      last = task;
      if (!recentSignatures.has(task.signature)) return task;
    } catch (error) {
      console.warn(`Generator ${generator.id} fehlgeschlagen`, error);
    }
  }
  return last || fallback(rng, resolvedDifficulty);
}

export function topicsForWeaknesses(outcomes = []) {
  const score = new Map();
  for (const outcome of outcomes.slice(-120)) {
    if (!["wrong", "skipped", "solution", "hinted"].includes(outcome.status)) continue;
    score.set(outcome.topic, (score.get(outcome.topic) || 0) + 1);
  }
  return [...score.entries()].sort((left, right) => right[1] - left[1]).slice(0, 5).map(([topic]) => topic);
}

import { Rational } from "../core/rational.js";

export const DIFFICULTIES = Object.freeze({
  basis: { label: "Basis", value: 2, baseSeconds: 8 },
  standard: { label: "Klausurstandard", value: 5, baseSeconds: 16 },
  plus: { label: "Klausur+", value: 7, baseSeconds: 24 },
  transfer: { label: "Transfer / Knobeln", value: 9, baseSeconds: 30 }
});

const BASIS_ONLY = new Set([
  "basics.signed",
  "basics.percent",
  "basics.order",
  "complex.conjugate",
  "sequences.arithmetic",
  "sequences.geometric",
  "differentialEquations.initial",
  "matlab.size"
]);

const DEACTIVATED = Object.freeze({
  "matrices.add": "Hoher Eingabeaufwand bei sehr geringer kognitiver Anforderung.",
  "numericalMethods.rectangle": "Nahezu reine Formeleinsetzung; die methodisch stärkere Trapezfamilie bleibt aktiv.",
  "trueFalse.computed": "Rechenaufgabe im Wahr/Falsch-Gewand mit zu hoher Rate erratbarer Antworten."
});

const STEP_CAPABLE = new Set([
  "taylor.exp", "taylor.sin", "taylor.cos", "taylor.geometric",
  "integrals.partial", "matrices.triangular", "linearSystems.gauss",
  "decompositions.lr", "decompositions.forward"
]);

export const rat = (numerator, denominator = 1) => new Rational(numerator, denominator).toString();

export function limit(difficulty) {
  return difficulty === "basis" || difficulty === "locker" ? 5 : difficulty === "standard" || difficulty === "hm1" ? 8 : 11;
}

export function complexityLimit(difficulty) {
  return difficulty === "basis" || difficulty === "locker" ? 4 : difficulty === "standard" || difficulty === "hm1" ? 7 : 10;
}

export const numberInput = (label = "Antwort", hint = "Ganze Zahl, Dezimalzahl, Bruch oder exakter Ausdruck") => ({
  type: "number",
  mode: "expression",
  label,
  hint,
  symbols: ["numbers", "fraction", "minus"]
});

export const expressionInput = (label = "Mathematischer Ausdruck", options = {}) => ({
  type: "expression",
  mode: "expression",
  label,
  symbols: options.symbols || ["numbers", "variables", "functions", "structures"],
  ...options
});

export const fieldsInput = (labels, columns = Math.min(labels.length, 3), template = null) => ({
  type: "fields",
  mode: "structured",
  fields: labels.map(value => typeof value === "string" ? { key: value, label: value } : value),
  columns,
  ...(template ? { template } : {})
});

export const structuredInput = (fields, template, columns = Math.min(fields.length, 3)) => fieldsInput(fields, columns, template);
export const vectorInput = (labels = ["x", "y"]) => fieldsInput(labels, labels.length);
export const matrixInput = (rows, columns) => ({ type: "matrix", mode: "structured", rows, columns, symbols: ["numbers", "fraction", "minus"] });
export const setInput = (label = "Lösungen") => ({ type: "set", mode: "expression", label, hint: "Mit Semikolon trennen; Reihenfolge egal." });
export const choiceInput = options => ({ type: "choice", mode: "choice", options });
export const boolInput = () => choiceInput([{ value: "true", label: "Wahr" }, { value: "false", label: "Falsch" }]);

export const choices = (rng, correct, others, format = value => String(value)) => rng
  .shuffle([...new Set([correct, ...others])].slice(0, 4))
  .map(value => ({ value: String(value), label: format(value) }));

function answerMode(input) {
  if (input.type === "choice") return "multiple-choice";
  if (input.type === "fields" || input.type === "matrix") return "structured-inline";
  return "free-expression";
}

export function makeTask({
  topic,
  id,
  title,
  difficulty,
  prompt,
  input = numberInput(),
  answer,
  explanation,
  complexity = 3,
  signature,
  hints,
  steps = [],
  competence,
  subtopic,
  requiredForm = null
}) {
  const normalizedDifficulty = DIFFICULTIES[difficulty] ? difficulty : difficulty === "locker" ? "basis" : difficulty === "exam" ? "plus" : "standard";
  const config = DIFFICULTIES[normalizedDifficulty];
  const boundedComplexity = Math.min(complexityLimit(normalizedDifficulty), Math.max(1, complexity));
  const progressiveHints = hints?.length ? hints : [
    `Erkenne zuerst die Struktur des Aufgabentyps „${title}“.`,
    "Formuliere den entscheidenden Rechenschritt, bevor du Zahlen einsetzt.",
    explanation.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  ];
  return {
    id: `${id}:${signature}`,
    topic,
    generatorId: id,
    title,
    subtopic: subtopic || title,
    competence: competence || title,
    difficulty: normalizedDifficulty,
    difficultyValue: Math.min(10, Math.max(1, config.value + Math.round((boundedComplexity - 5) / 3))),
    prompt,
    inputSpec: input,
    answer,
    answerMode: answerMode(input),
    explanation,
    solutionStructure: explanation,
    hints: progressiveHints,
    steps,
    requiredForm,
    complexity: boundedComplexity,
    estimatedSeconds: steps.length
      ? Math.min(300, Math.max(45, steps.length * 42))
      : Math.min(60, Math.max(10, config.baseSeconds + 4 * boundedComplexity)),
    signature: `${id}:${signature}`
  };
}

function defaultMetadata(id, topic, title) {
  const basisOnly = BASIS_ONLY.has(id);
  const levels = basisOnly ? ["basis"] : ["basis", "standard", "plus", "transfer"];
  return {
    id,
    topic,
    subtopic: title,
    competence: title,
    difficultyValue: basisOnly ? 2 : 5,
    visibleDifficulty: basisOnly ? "basis" : "standard",
    levels,
    taskModes: STEP_CAPABLE.has(id) ? ["head", "step"] : ["head", "step"],
    expectedSeconds: basisOnly ? 24 : 45,
    answerMode: "adaptive",
    examRelevance: basisOnly ? 1 : 2,
    cognitiveDemand: basisOnly ? 1 : 2,
    inputEffort: 1,
    variety: 2,
    requiredSymbols: ["numbers", "minus", "fraction"],
    hintStructure: ["Methode", "nächster Schritt", "Kernrechnung"],
    solutionStructure: "Kompakte Herleitung mit Ergebnis",
    similarGenerators: [],
    easierPredecessor: null,
    harderVariant: null,
    weight: basisOnly ? 0.65 : 1,
    active: !(id in DEACTIVATED),
    deactivationReason: DEACTIVATED[id] || ""
  };
}

export const generator = (id, topic, title, generate, metadata = {}) => Object.freeze({
  ...defaultMetadata(id, topic, title),
  ...metadata,
  id,
  topic,
  title,
  maxAttempts: 50,
  generate(rng, difficulty, context = {}) {
    const task = generate(rng, difficulty, context);
    return Object.freeze({
      ...task,
      generatorMeta: {
        subtopic: metadata.subtopic || task.subtopic || title,
        competence: metadata.competence || task.competence || title,
        examRelevance: metadata.examRelevance ?? defaultMetadata(id, topic, title).examRelevance,
        cognitiveDemand: metadata.cognitiveDemand ?? defaultMetadata(id, topic, title).cognitiveDemand
      }
    });
  }
});

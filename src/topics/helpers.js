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

const LEVEL_BY_ID = Object.freeze({
  "basics.signed": "basis", "basics.fractions": "standard", "basics.percent": "basis", "basics.powers": "standard", "basics.order": "basis",
  "algebra.linear": "basis", "algebra.collect": "basis", "algebra.roots": "standard", "algebra.composition": "plus", "algebra.fraction-equation": "plus",
  "complex.add": "basis", "complex.multiply": "standard", "complex.conjugate": "basis", "complex.modulus": "basis", "complex.i-power": "standard", "complex.divide-i": "basis",
  "limits.infinity": "standard", "limits.removable": "transfer", "limits.sin": "basis", "limits.root": "plus",
  "sequences.arithmetic": "basis", "sequences.geometric": "basis", "sequences.limit": "standard", "sequences.fixpoint": "transfer",
  "series.finite": "basis", "series.infinite": "standard", "series.radius": "plus", "series.convergence": "transfer",
  "derivatives.polynomial": "basis", "derivatives.chain": "standard", "derivatives.product": "standard", "derivatives.critical": "plus", "derivatives.rules": "transfer",
  "taylor.exp": "standard", "taylor.sin": "standard", "taylor.cos": "standard", "taylor.geometric": "transfer",
  "integrals.power": "basis", "integrals.antiderivative": "standard", "integrals.partial": "plus", "integrals.method": "transfer",
  "matrices.det": "basis", "matrices.vector": "standard", "matrices.triangular": "basis", "matrices.inverse-entry": "plus", "matrices.invertible": "standard",
  "linearSystems.solve": "standard", "linearSystems.type": "transfer", "linearSystems.gauss": "basis", "linearSystems.back": "standard", "linearSystems.homogeneous": "transfer",
  "vectorSpaces.combination": "standard", "vectorSpaces.dimension": "basis", "vectorSpaces.kernel": "plus", "vectorSpaces.rank": "standard", "vectorSpaces.subspace": "transfer",
  "orthogonality.dot": "basis", "orthogonality.norm": "basis", "orthogonality.projection": "plus", "orthogonality.normal": "standard", "orthogonality.least-squares": "transfer",
  "decompositions.lr": "basis", "decompositions.forward": "standard", "decompositions.orthogonal": "basis", "decompositions.pivot": "transfer",
  "numericalMethods.newton": "standard", "numericalMethods.euler": "plus", "numericalMethods.trapezoid": "transfer",
  "differentialEquations.initial": "basis", "differentialEquations.equilibrium": "standard", "differentialEquations.verify": "plus", "differentialEquations.characteristic": "transfer",
  "trueFalse.concepts": "transfer", "matlab.elementwise": "standard", "matlab.size": "basis"
});

const DEACTIVATED = Object.freeze({
  "matrices.add": "Hoher Eingabeaufwand bei sehr geringer kognitiver Anforderung.",
  "numericalMethods.rectangle": "Nahezu reine Formeleinsetzung; die methodisch stärkere Trapezfamilie bleibt aktiv.",
  "trueFalse.computed": "Rechenaufgabe im Wahr/Falsch-Gewand mit zu hoher Rate erratbarer Antworten."
});

const RELATION_METADATA = Object.freeze({
  "complex.divide-i": { competenceId: "complex-division", harderVariant: "complex.division-general" },
  "complex.division-general": { competenceId: "complex-division", easierPredecessor: "complex.divide-i" },
  "complex.polar": { competenceId: "complex-polar", harderVariant: "complex.demoivre" },
  "complex.demoivre": { competenceId: "complex-polar", easierPredecessor: "complex.polar", harderVariant: "complex.roots" },
  "complex.roots": { competenceId: "complex-polar", easierPredecessor: "complex.demoivre" },
  "derivatives.product": { competenceId: "derivative-rules", harderVariant: "derivatives.mixed-expression" },
  "derivatives.chain": { competenceId: "derivative-rules", harderVariant: "derivatives.mixed-expression" },
  "derivatives.quotient": { competenceId: "derivative-rules", easierPredecessor: "derivatives.product", harderVariant: "derivatives.mixed-expression" },
  "derivatives.mixed-expression": { competenceId: "derivative-rules", easierPredecessor: "derivatives.product", harderVariant: "derivatives.chain-error" },
  "derivatives.chain-error": { competenceId: "derivative-rules", easierPredecessor: "derivatives.mixed-expression" },
  "integrals.partial-fractions-setup": { competenceId: "partial-fractions", harderVariant: "integrals.partial-fractions" },
  "integrals.partial-fractions": { competenceId: "partial-fractions", easierPredecessor: "integrals.partial-fractions-setup" },
  "taylor.exp": { competenceId: "taylor-construction", harderVariant: "taylor.shifted-exp" },
  "taylor.shifted-exp": { competenceId: "taylor-construction", easierPredecessor: "taylor.exp", harderVariant: "taylor.rational" },
  "taylor.rational": { competenceId: "taylor-construction", easierPredecessor: "taylor.shifted-exp" },
  "linearSystems.gauss": { competenceId: "gaussian-elimination", harderVariant: "linearSystems.gauss-steps" },
  "linearSystems.gauss-steps": { competenceId: "gaussian-elimination", easierPredecessor: "linearSystems.gauss" },
  "matrices.eigenvalues": { competenceId: "eigensystem", harderVariant: "matrices.eigenvector" },
  "matrices.eigenvector": { competenceId: "eigensystem", easierPredecessor: "matrices.eigenvalues" },
  "decompositions.lr": { competenceId: "lu-decomposition", harderVariant: "decompositions.lu-complete" },
  "decompositions.lu-complete": { competenceId: "lu-decomposition", easierPredecessor: "decompositions.lr" },
  "decompositions.qr-first-vector": { competenceId: "qr-decomposition" }
});

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
export const vectorInput = (labels = ["x", "y"]) => ({ ...fieldsInput(labels, labels.length), subtype: "vector" });
export const matrixInput = (rows, columns) => ({ type: "matrix", mode: "structured", rows, columns, symbols: ["numbers", "fraction", "minus"] });
export const setInput = (label = "Lösungen") => ({ type: "set", mode: "expression", label, hint: "Mit Semikolon trennen; Reihenfolge egal." });
export const intervalInput = (label = "Intervall") => ({ type: "interval", mode: "expression", label, hint: "Zum Beispiel [−1; 2)." });
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
  requiredForm = null,
  reference = null
}) {
  const normalizedDifficulty = DIFFICULTIES[difficulty] ? difficulty : difficulty === "locker" ? "basis" : difficulty === "exam" ? "plus" : "standard";
  const config = DIFFICULTIES[normalizedDifficulty];
  const boundedComplexity = Math.min(complexityLimit(normalizedDifficulty), Math.max(1, complexity));
  const progressiveHints = hints?.length ? hints : [
    `Erkenne zuerst die Struktur des Aufgabentyps „${title}“.`,
    "Formuliere den entscheidenden Rechenschritt, bevor du Zahlen einsetzt.",
    explanation.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  ];
  const FORM_LABELS = {
    factored: "faktorisierte Form",
    expanded: "ausmultiplizierte Form",
    equation: "äquivalente Gleichung",
    "strict-domain": "gleicher Ausdruck einschließlich Definitionsbereich",
    "cartesian-complex": "kartesische Form a+bi",
    "polar-complex": "Polar- oder Eulerform",
    "partial-fractions": "Partialbruchform"
  };
  const required = requiredForm || (answer.equivalenceMode && answer.equivalenceMode !== "algebraic" ? answer.equivalenceMode : null);
  const visiblePrompt = required && !String(prompt).includes("required-form")
    ? `${prompt}<span class="context required-form">Antwortform: ${FORM_LABELS[required] || required}</span>`
    : prompt;
  return {
    id: `${id}:${signature}`,
    topic,
    generatorId: id,
    title,
    subtopic: subtopic || title,
    competence: competence || title,
    difficulty: normalizedDifficulty,
    difficultyValue: Math.min(10, Math.max(1, config.value + Math.round((boundedComplexity - 5) / 3))),
    prompt: visiblePrompt,
    inputSpec: input,
    answer,
    answerMode: answerMode(input),
    explanation,
    solutionStructure: explanation,
    hints: progressiveHints,
    steps,
    requiredForm: required,
    reference,
    complexity: boundedComplexity,
    estimatedSeconds: steps.length
      ? Math.min(300, Math.max(45, steps.length * 42))
      : Math.min(60, Math.max(10, config.baseSeconds + 4 * boundedComplexity)),
    signature: `${id}:${signature}`
  };
}

function defaultMetadata(id, topic, title) {
  const assignedLevel = LEVEL_BY_ID[id] || (BASIS_ONLY.has(id) ? "basis" : "standard");
  const basisOnly = assignedLevel === "basis";
  const levels = [assignedLevel];
  const relations = RELATION_METADATA[id] || {};
  return {
    id,
    topic,
    subtopic: title,
    competence: title,
    difficultyValue: DIFFICULTIES[assignedLevel].value,
    visibleDifficulty: assignedLevel,
    levels,
    taskModes: ["head"],
    expectedSeconds: assignedLevel === "basis" ? 24 : assignedLevel === "standard" ? 45 : assignedLevel === "plus" ? 70 : 90,
    answerMode: "adaptive",
    examRelevance: basisOnly ? 1 : assignedLevel === "standard" ? 2 : 3,
    cognitiveDemand: basisOnly ? 1 : assignedLevel === "standard" ? 2 : assignedLevel === "plus" ? 3 : 4,
    inputEffort: 1,
    variety: 2,
    requiredSymbols: ["numbers", "minus", "fraction"],
    hintStructure: ["Methode", "nächster Schritt", "Kernrechnung"],
    solutionStructure: "Kompakte Herleitung mit Ergebnis",
    similarGenerators: [],
    competenceId: id,
    easierPredecessor: null,
    harderVariant: null,
    weight: basisOnly ? 0.65 : 1,
    active: !(id in DEACTIVATED),
    deactivationReason: DEACTIVATED[id] || "",
    ...relations
  };
}

export const generator = (id, topic, title, generate, metadata = {}) => {
  const base = defaultMetadata(id, topic, title);
  const levels = metadata.levels || base.levels;
  const levelRules = {
    basis: { numberRange: "klein und übersichtlich", steps: "ein Kernschritt", methodChoice: false, structure: "direkt sichtbar" },
    standard: { numberRange: "klausurtauglich", steps: "meist zwei Gedankenschritte", methodChoice: false, structure: "typische HM1-Methode" },
    plus: { numberRange: "weiterhin sinnvoll", steps: "mehrere verknüpfte Schritte", methodChoice: true, structure: "kombinierte Regeln" },
    transfer: { numberRange: "nicht künstlich vergrößert", steps: "strategische Entscheidung", methodChoice: true, structure: "Methode oder versteckte Struktur erkennen" }
  };
  const difficultyConfig = metadata.difficultyConfig || Object.fromEntries(levels.map(level => [level, {
    structuralTier: DIFFICULTIES[level].value,
    description: `${DIFFICULTIES[level].label}: ${title}`,
    ...levelRules[level]
  }]));
  return Object.freeze({
    ...base,
    ...metadata,
    id,
    topic,
    title,
    levels,
    visibleDifficulty: metadata.visibleDifficulty || levels[0],
    difficultyValue: metadata.difficultyValue ?? DIFFICULTIES[levels[0]].value,
    difficultyConfig,
    maxAttempts: 50,
    generate(rng, difficulty, context = {}) {
      const task = generate(rng, difficulty, context);
      return Object.freeze({
        ...task,
        generatorMeta: {
          subtopic: metadata.subtopic || task.subtopic || title,
          competence: metadata.competence || task.competence || title,
          competenceId: metadata.competenceId || base.competenceId,
          examRelevance: metadata.examRelevance ?? base.examRelevance,
          cognitiveDemand: metadata.cognitiveDemand ?? base.cognitiveDemand,
          difficultyConfig: difficultyConfig[difficulty]
        }
      });
    }
  });
};

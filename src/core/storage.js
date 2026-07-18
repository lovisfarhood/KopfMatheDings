const KEY = "kopfmathe.v3";
const V2_KEY = "kopfmathe.v2";
const LEGACY_KEY = "kopfmathe.v1";

const DEFAULT_TOPICS = [
  "algebra", "complex", "limits", "sequences", "series", "derivatives", "taylor", "integrals",
  "matrices", "linearSystems", "vectorSpaces", "orthogonality", "decompositions", "numericalMethods", "differentialEquations"
];

export const defaults = Object.freeze({
  selectedTopics: DEFAULT_TOPICS,
  activePreset: "exam",
  difficulty: "standard",
  mode: "head",
  matlab: false,
  confirmSkip: false,
  score: { correct: 0, wrong: 0, hinted: 0, skipped: 0, solution: 0 },
  recent: [],
  outcomes: [],
  later: [],
  taskCounter: 0
});

function storage() {
  try {
    localStorage.setItem("__km", "1");
    localStorage.removeItem("__km");
    return localStorage;
  } catch {
    return null;
  }
}

function copyDefaults() {
  return JSON.parse(JSON.stringify(defaults));
}

function migrateLegacy(legacy) {
  const state = copyDefaults();
  if (!legacy || typeof legacy !== "object") return state;
  if (legacy.topic && legacy.topic !== "mixed") state.selectedTopics = [legacy.topic];
  state.difficulty = legacy.difficulty === "locker" ? "basis" : legacy.difficulty === "exam" ? "plus" : "standard";
  state.matlab = Boolean(legacy.matlab);
  state.score.correct = Number(legacy.score?.correct) || 0;
  state.score.wrong = Number(legacy.score?.wrong) || 0;
  state.recent = Array.isArray(legacy.recent) ? legacy.recent.slice(-30).map(signature => ({ signature, generatorId: String(signature).split(":")[0] })) : [];
  state.activePreset = legacy.topic && legacy.topic !== "mixed" ? "custom" : "exam";
  return state;
}

export function load() {
  const target = storage();
  if (!target) return copyDefaults();
  try {
    const current = target.getItem(KEY);
    const v2 = target.getItem(V2_KEY);
    const parsed = current ? JSON.parse(current) : v2 ? JSON.parse(v2) : migrateLegacy(JSON.parse(target.getItem(LEGACY_KEY) || "null"));
    return {
      ...copyDefaults(),
      ...parsed,
      selectedTopics: Array.isArray(parsed.selectedTopics) && parsed.selectedTopics.length ? [...new Set(parsed.selectedTopics)] : [...DEFAULT_TOPICS],
      score: { ...defaults.score, ...(parsed.score || {}) },
      recent: Array.isArray(parsed.recent) ? parsed.recent.slice(-30) : [],
      outcomes: Array.isArray(parsed.outcomes) ? parsed.outcomes.slice(-150) : [],
      later: Array.isArray(parsed.later) ? parsed.later.filter(item => item?.signature && item?.task).slice(-50) : [],
      taskCounter: Math.max(0, Number(parsed.taskCounter) || 0)
    };
  } catch {
    return copyDefaults();
  }
}

export function save(state) {
  try {
    storage()?.setItem(KEY, JSON.stringify({
      ...state,
      recent: state.recent.slice(-30),
      outcomes: state.outcomes.slice(-150),
      later: state.later.slice(-50)
    }));
    return true;
  } catch {
    return false;
  }
}

export function resetStorage() {
  try {
    const target = storage();
    target?.removeItem(KEY);
    target?.removeItem(V2_KEY);
    target?.removeItem(LEGACY_KEY);
    return true;
  } catch {
    return false;
  }
}

import { checkTaskAnswer } from "./core/checker.js";
import {
  generateTask,
  PRESETS,
  TOPICS,
  topicById,
  topicsForWeaknesses,
  variantRequestFor
} from "./core/registry.js";
import {
  completeLater,
  dueLater,
  enqueueLater,
  rescheduleLater,
  restoreLater
} from "./core/later-queue.js";
import { defaults, load, resetStorage, save } from "./core/storage.js";
import { chipFromController, renderInputs } from "./ui/inputs.js";
import { MathKeyboard } from "./ui/math-keyboard.js";
import { applyDockMetrics } from "./ui/layout.js";

const $ = selector => document.querySelector(selector);
const elements = {
  start: $("#start"),
  exercise: $("#exercise"),
  network: $("#network-status"),
  presets: $("#presets"),
  topics: $("#topics"),
  topicCount: $("#topic-count"),
  selectAll: $("#select-all"),
  selectNone: $("#select-none"),
  difficultyOptions: $("#difficulty-options"),
  difficultyHint: $("#difficulty-hint"),
  modeOptions: $("#mode-options"),
  matlab: $("#matlab"),
  confirmSkip: $("#confirm-skip"),
  resetData: $("#reset-data"),
  startButton: $("#start-button"),
  startMessage: $("#start-message"),
  back: $("#back"),
  meta: $("#meta"),
  kind: $("#kind"),
  score: $("#score"),
  time: $("#time"),
  taskMode: $("#task-mode"),
  answerMode: $("#answer-mode"),
  stepProgress: $("#step-progress"),
  prompt: $("#prompt"),
  stepPrompt: $("#step-prompt"),
  form: $("#form"),
  taskActions: $(".task-actions"),
  inputs: $("#inputs"),
  feedback: $("#feedback"),
  hintPanel: $("#hint-panel"),
  solution: $("#solution"),
  solutionText: $("#solution-text"),
  hintButton: $("#hint-button"),
  skipButton: $("#skip-button"),
  solutionButton: $("#solution-button"),
  resultActions: $("#result-actions"),
  similar: $("#similar"),
  easier: $("#easier"),
  harder: $("#harder"),
  later: $("#later"),
  next: $("#next"),
  workspaceDock: $("#workspace-dock"),
  stepChips: $("#step-chips"),
  saveStep: $("#save-step"),
  toggleStepMode: $("#toggle-step-mode"),
  keyboardDock: $("#keyboard-dock"),
  undoToast: $("#undo-toast"),
  undoSkip: $("#undo-skip"),
  update: $("#update"),
  reload: $("#reload")
};

const DIFFICULTY_LABELS = Object.freeze({
  basis: "Basis",
  standard: "Klausurstandard",
  plus: "Klausur+",
  transfer: "Transfer / Knobeln"
});
const DIFFICULTY_HINTS = Object.freeze({
  basis: "Ein klarer Kernschritt, kleine Zahlen – grundlegend, aber nicht banal.",
  standard: "Typische HM1-Methoden und realistische Klausurbausteine.",
  plus: "Mehr Verknüpfungen, weniger offensichtliche Wege, höhere Fehlerdichte.",
  transfer: "Strategie und Einsicht statt bloß größerer Zahlen."
});
const ANSWER_MODE_LABELS = Object.freeze({
  "multiple-choice": "Auswahl",
  "structured-inline": "Strukturiert",
  "free-expression": "Freie Eingabe"
});

let state = load();
let task = null;
let controller = null;
let keyboard = null;
let stepIndex = -1;
let stepChips = [];
let directAnswer = false;
let hintIndex = 0;
let usedHint = false;
let attemptedWrong = false;
let outcomeFinalized = false;
let undoSnapshot = null;
let undoTimer = null;
let activeLater = null;

function persist() {
  state.matlab = elements.matlab.checked;
  state.confirmSkip = elements.confirmSkip.checked;
  save(state);
}

function enabledTopics() {
  return TOPICS.filter(topic => topic.enabled || (topic.id === "matlab" && state.matlab));
}

function renderPresets() {
  elements.presets.replaceChildren();
  for (const [id, preset] of Object.entries(PRESETS)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "preset-chip";
    button.textContent = preset.label;
    button.dataset.preset = id;
    const weakTopics = id === "weaknesses" ? topicsForWeaknesses(state.outcomes) : null;
    const unavailable = id === "weaknesses" && !weakTopics.length;
    button.disabled = unavailable;
    if (unavailable) button.title = "Nach ersten Fehlern verfügbar";
    button.setAttribute("aria-pressed", String(state.activePreset === id));
    button.addEventListener("click", () => {
      state.selectedTopics = [...(id === "weaknesses" ? weakTopics : preset.topics)];
      state.activePreset = id;
      renderStartControls();
      persist();
    });
    elements.presets.append(button);
  }
}

function renderTopics() {
  elements.topics.replaceChildren();
  const grouped = new Map();
  for (const topic of enabledTopics()) {
    if (!grouped.has(topic.group)) grouped.set(topic.group, []);
    grouped.get(topic.group).push(topic);
  }
  for (const [group, topics] of grouped) {
    const section = document.createElement("section");
    section.className = "topic-group";
    const heading = document.createElement("h3");
    heading.textContent = group;
    const chips = document.createElement("div");
    chips.className = "topic-chips";
    for (const topic of topics) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "topic-chip";
      button.textContent = topic.short;
      const active = state.selectedTopics.includes(topic.id);
      button.setAttribute("aria-pressed", String(active));
      button.addEventListener("click", () => {
        state.selectedTopics = active
          ? state.selectedTopics.filter(id => id !== topic.id)
          : [...state.selectedTopics, topic.id];
        state.activePreset = "custom";
        renderStartControls();
        persist();
      });
      chips.append(button);
    }
    section.append(heading, chips);
    elements.topics.append(section);
  }
}

function renderDifficulty() {
  elements.difficultyOptions.querySelectorAll("[data-difficulty]").forEach(button => {
    const selected = button.dataset.difficulty === state.difficulty;
    button.setAttribute("aria-checked", String(selected));
    button.classList.toggle("is-selected", selected);
  });
  elements.difficultyHint.textContent = DIFFICULTY_HINTS[state.difficulty];
}

function renderModes() {
  elements.modeOptions.querySelectorAll("[data-mode]").forEach(button => {
    const selected = button.dataset.mode === state.mode;
    button.setAttribute("aria-checked", String(selected));
    button.classList.toggle("is-selected", selected);
  });
}

function renderStartControls() {
  state.selectedTopics = state.selectedTopics.filter(id => enabledTopics().some(topic => topic.id === id));
  renderPresets();
  renderTopics();
  renderDifficulty();
  renderModes();
  elements.topicCount.textContent = `${state.selectedTopics.length} aktiv`;
  elements.startButton.disabled = state.selectedTopics.length === 0;
  elements.startMessage.textContent = state.selectedTopics.length ? "" : "Wähle mindestens ein Thema oder ein Preset.";
}

function updateNetworkStatus() {
  const online = navigator.onLine;
  elements.network.textContent = online ? "Online" : "Offline bereit";
  elements.network.classList.toggle("is-offline", !online);
}

function updateScore() {
  elements.score.textContent = `${state.score.correct} ✓  ${state.score.wrong} ✕`;
  elements.score.setAttribute("aria-label", `${state.score.correct} richtig, ${state.score.wrong} falsch`);
}

function activeUnit() {
  if (!directAnswer && stepIndex >= 0 && task?.steps?.[stepIndex]) return task.steps[stepIndex];
  return task;
}

function isStructuredStep() {
  return !directAnswer && stepIndex >= 0 && task?.steps?.length;
}

function resetAttemptState() {
  hintIndex = 0;
  usedHint = false;
  attemptedWrong = false;
  outcomeFinalized = false;
  stepChips = [];
  directAnswer = false;
  stepIndex = state.mode === "step" && task.steps?.length ? 0 : -1;
}

function addRecent(currentTask) {
  state.recent.push({
    signature: currentTask.signature,
    generatorId: currentTask.generatorId,
    topic: currentTask.topic
  });
  state.recent = state.recent.slice(-30);
}

function createTask(options = {}) {
  activeLater = null;
  const queued = !options.forcedGeneratorId && !options.difficulty && !options.seed && !options.ignoreLater
    ? dueLater(state.later, { counter: state.taskCounter, enabledTopics: state.selectedTopics, mode: state.mode })
    : null;
  if (queued) {
    activeLater = queued;
    task = restoreLater(queued);
  } else {
    task = generateTask({
      topics: state.selectedTopics,
      difficulty: options.difficulty || state.difficulty,
      mode: state.mode,
      history: state.recent,
      outcomes: state.outcomes,
      matlabEnabled: state.matlab,
      forcedGeneratorId: options.forcedGeneratorId || null,
      seed: options.seed
    });
  }
  if (task.unavailable) {
    persist();
    renderUnavailableTask();
    return;
  }
  state.taskCounter += 1;
  addRecent(task);
  resetAttemptState();
  persist();
  renderTask();
}

function renderUnavailableTask() {
  clearFeedback();
  controller = null;
  elements.meta.textContent = state.mode === "step" ? "Schrittmodus" : "Kopfmodus";
  elements.kind.textContent = "Keine passende Aufgabe";
  elements.prompt.innerHTML = `<span class="context">Auswahl kontrolliert beendet</span><span>${task.message}</span>`;
  elements.stepPrompt.hidden = true;
  elements.stepProgress.hidden = true;
  elements.form.hidden = true;
  elements.taskActions.hidden = true;
  elements.resultActions.hidden = true;
  elements.workspaceDock.hidden = true;
  elements.keyboardDock.hidden = true;
  elements.back.focus({ preventScroll: true });
}

function feedback(kind, message) {
  elements.feedback.hidden = false;
  elements.feedback.className = `feedback is-${kind}`;
  elements.feedback.textContent = message;
}

function clearFeedback() {
  elements.feedback.hidden = true;
  elements.feedback.textContent = "";
  elements.hintPanel.hidden = true;
  elements.hintPanel.replaceChildren();
  elements.solution.hidden = true;
  elements.resultActions.hidden = true;
}

function renderStepProgress() {
  if (!task.steps?.length) {
    elements.stepProgress.hidden = true;
    return;
  }
  elements.stepProgress.hidden = false;
  elements.stepProgress.replaceChildren();
  task.steps.forEach((_step, index) => {
    const dot = document.createElement("span");
    dot.className = "step-dot";
    dot.classList.toggle("is-done", isStructuredStep() && index < stepIndex);
    dot.classList.toggle("is-current", isStructuredStep() && index === stepIndex);
    dot.textContent = String(index + 1);
    elements.stepProgress.append(dot);
  });
  const label = document.createElement("span");
  label.textContent = directAnswer || stepIndex < 0 ? "Direktantwort" : `Schritt ${stepIndex + 1} von ${task.steps.length}`;
  elements.stepProgress.append(label);
}

function renderWorkspace() {
  elements.stepChips.replaceChildren();
  for (const [index, chip] of stepChips.entries()) {
    const wrapper = document.createElement("div");
    wrapper.className = "step-chip";
    const insert = document.createElement("button");
    insert.type = "button";
    insert.className = "chip-value";
    insert.textContent = chip.label;
    insert.title = `${chip.label} vollständig einsetzen`;
    insert.addEventListener("click", () => {
      if (!controller?.insertSerialized(chip.serialized)) feedback("neutral", "Dieses Zwischenergebnis passt nicht zur aktuellen Eingabestruktur.");
    });
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "chip-action";
    edit.textContent = "↗";
    edit.setAttribute("aria-label", `${chip.label} bearbeiten`);
    edit.addEventListener("click", () => {
      if (controller?.restore(chip.serialized)) {
        stepChips.splice(index, 1);
        renderWorkspace();
      } else feedback("neutral", "Dieses Zwischenergebnis kann in diesem Editor nicht vollständig bearbeitet werden.");
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "chip-action";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `${chip.label} löschen`);
    remove.addEventListener("click", () => {
      stepChips.splice(index, 1);
      renderWorkspace();
    });
    wrapper.append(insert, edit, remove);
    elements.stepChips.append(wrapper);
  }
  if (!stepChips.length) {
    const empty = document.createElement("span");
    empty.className = "workspace-empty";
    empty.textContent = state.mode === "step" ? "Zwischenergebnisse erscheinen hier." : "Optional ein Ergebnis merken.";
    elements.stepChips.append(empty);
  }
  elements.toggleStepMode.hidden = !task.steps?.length;
  elements.toggleStepMode.textContent = isStructuredStep() ? "Direktantwort" : "In Schritten lösen";
}

function renderTask() {
  clearFeedback();
  elements.form.hidden = false;
  elements.taskActions.hidden = false;
  elements.workspaceDock.hidden = false;
  elements.keyboardDock.hidden = false;
  const unit = activeUnit();
  const topic = topicById(task.topic);
  elements.meta.textContent = `${topic.short} · ${DIFFICULTY_LABELS[task.difficulty]}${task.difficultyAdjustedFrom ? " · nächste verfügbare Stufe" : ""}${activeLater ? " · Wiederholung" : ""}`;
  elements.kind.textContent = task.title;
  elements.time.textContent = task.estimatedSeconds >= 60 ? `${Math.ceil(task.estimatedSeconds / 60)} min` : `≈ ${task.estimatedSeconds} s`;
  elements.taskMode.textContent = state.mode === "step" ? "Schrittmodus" : "Kopfmodus";
  const currentAnswerMode = unit.answerMode || (unit.inputSpec.type === "choice" ? "multiple-choice" : ["fields", "matrix"].includes(unit.inputSpec.type) ? "structured-inline" : "free-expression");
  elements.answerMode.textContent = ANSWER_MODE_LABELS[currentAnswerMode] || ANSWER_MODE_LABELS[task.answerMode];
  elements.prompt.innerHTML = task.prompt;
  elements.stepPrompt.hidden = !isStructuredStep();
  elements.stepPrompt.textContent = isStructuredStep() ? unit.prompt : "";
  elements.solutionText.innerHTML = unit.explanation || task.explanation;
  elements.hintButton.textContent = "Hinweis";
  elements.hintButton.disabled = false;
  elements.solutionButton.disabled = false;
  renderStepProgress();

  controller = renderInputs(elements.inputs, unit.inputSpec, {
    onSubmit: submitAnswer,
    onChange: () => {
      if (!elements.feedback.hidden && elements.feedback.classList.contains("is-neutral")) clearFeedback();
    }
  });
  keyboard.setController(controller);
  renderWorkspace();
  updateScore();
  requestAnimationFrame(() => controller.focus());
}

function outcomeStatus() {
  if (attemptedWrong) return "wrong";
  if (usedHint) return "hinted";
  return "correct";
}

function finalizeOutcome(status = outcomeStatus()) {
  if (outcomeFinalized || !task) return;
  outcomeFinalized = true;
  state.outcomes.push({
    generatorId: task.generatorId,
    topic: task.topic,
    difficulty: task.difficulty,
    status,
    at: Date.now()
  });
  state.outcomes = state.outcomes.slice(-150);
  if (status === "correct") state.score.correct += 1;
  else if (status === "hinted") {
    state.score.correct += 1;
    state.score.hinted += 1;
  } else if (status === "wrong") state.score.wrong += 1;
  else if (status === "skipped") state.score.skipped += 1;
  else if (status === "solution") state.score.solution += 1;
  if (status === "correct" && activeLater) {
    state.later = completeLater(state.later, activeLater);
    activeLater = null;
  }
  persist();
  updateScore();
  renderPresets();
}

function addAutomaticChip(step) {
  const chip = chipFromController(controller, step.chipLabel);
  if (!chip) return;
  stepChips.push(chip);
  renderWorkspace();
}

function showCompleted(correct = true) {
  controller.setDisabled(correct);
  elements.resultActions.hidden = false;
  elements.next.focus({ preventScroll: true });
}

function submitAnswer(event) {
  event?.preventDefault?.();
  if (!task) return;
  const unit = activeUnit();
  const result = checkTaskAnswer(unit, controller.collect());
  if (!result.valid) {
    feedback("neutral", result.message);
    return;
  }
  if (!result.correct) {
    attemptedWrong = true;
    feedback("bad", result.message === "Noch nicht richtig." ? "Noch nicht richtig. Prüfe Struktur, Vorzeichen und Klammern." : result.message);
    elements.resultActions.hidden = false;
    return;
  }

  if (isStructuredStep()) {
    addAutomaticChip(unit);
    if (stepIndex < task.steps.length - 1) {
      stepIndex += 1;
      renderTask();
      feedback("ok", "Schritt korrekt und als Zwischenergebnis gespeichert.");
      return;
    }
  }

  feedback("ok", usedHint ? "Richtig – mit Hinweis gelöst." : "Richtig.");
  finalizeOutcome();
  showCompleted(true);
}

function showHint() {
  const unit = activeUnit();
  const hints = unit.hints?.length ? unit.hints : task.hints;
  const nextHint = hints[Math.min(hintIndex, hints.length - 1)];
  if (!nextHint) return;
  usedHint = true;
  hintIndex += 1;
  elements.hintPanel.hidden = false;
  const label = document.createElement("strong");
  label.textContent = `Hinweis ${Math.min(hintIndex, hints.length)} von ${hints.length}`;
  const text = document.createElement("p");
  text.textContent = nextHint;
  elements.hintPanel.replaceChildren(label, text);
  elements.hintButton.textContent = hintIndex < hints.length ? "Nächster Hinweis" : "Hinweise ausgeschöpft";
  elements.hintButton.disabled = hintIndex >= hints.length;
}

function showSolution() {
  elements.solution.hidden = false;
  elements.solutionButton.disabled = true;
  controller.setDisabled(true);
  finalizeOutcome("solution");
  elements.resultActions.hidden = false;
  elements.solution.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
}

function cloneState() {
  return JSON.parse(JSON.stringify(state));
}

function skipTask() {
  if (state.confirmSkip && !window.confirm("Diese Aufgabe überspringen?")) return;
  undoSnapshot = {
    state: cloneState(),
    task,
    stepIndex,
    stepChips: JSON.parse(JSON.stringify(stepChips)),
    directAnswer,
    hintIndex,
    usedHint,
    attemptedWrong,
    outcomeFinalized,
    activeLater
  };
  finalizeOutcome("skipped");
  postponeActiveRepeat();
  createTask();
  showUndo();
}

function showUndo() {
  clearTimeout(undoTimer);
  elements.undoToast.hidden = false;
  undoTimer = setTimeout(() => {
    elements.undoToast.hidden = true;
    undoSnapshot = null;
  }, 6500);
}

function undoSkip() {
  if (!undoSnapshot) return;
  clearTimeout(undoTimer);
  state = undoSnapshot.state;
  task = undoSnapshot.task;
  stepIndex = undoSnapshot.stepIndex;
  stepChips = undoSnapshot.stepChips;
  directAnswer = undoSnapshot.directAnswer;
  hintIndex = undoSnapshot.hintIndex;
  usedHint = undoSnapshot.usedHint;
  attemptedWrong = undoSnapshot.attemptedWrong;
  outcomeFinalized = undoSnapshot.outcomeFinalized;
  activeLater = undoSnapshot.activeLater;
  undoSnapshot = null;
  elements.undoToast.hidden = true;
  persist();
  renderTask();
}

function continueWith(options = {}) {
  if (!outcomeFinalized) finalizeOutcome(attemptedWrong ? "wrong" : usedHint ? "hinted" : "skipped");
  postponeActiveRepeat();
  createTask(options);
}

function continueVariant(direction) {
  const request = variantRequestFor(task, direction);
  if (!request) {
    feedback("neutral", direction === "easier"
      ? "Für diese Kompetenz ist keine einfachere Vorstufe hinterlegt."
      : "Für diese Kompetenz ist keine schwerere Variante hinterlegt.");
    return;
  }
  continueWith({ forcedGeneratorId: request.generatorId, difficulty: request.difficulty });
}

function postponeActiveRepeat() {
  if (!activeLater) return;
  state.later = rescheduleLater(state.later, activeLater, { counter: state.taskCounter });
  activeLater = null;
  persist();
}

function rememberForLater() {
  state.later = activeLater
    ? rescheduleLater(state.later, activeLater, { counter: state.taskCounter })
    : enqueueLater(state.later, task, { counter: state.taskCounter, taskMode: state.mode });
  activeLater = null;
  persist();
  continueWith();
}

function saveCurrentStep() {
  if (!controller?.isComplete()) {
    feedback("neutral", "Gib zuerst ein Zwischenergebnis ein.");
    return;
  }
  stepChips.push({ label: controller.displayValue(), serialized: controller.serialize() });
  renderWorkspace();
  feedback("neutral", "Zwischenergebnis gespeichert. Tippe den Chip an, um es wieder einzusetzen.");
}

function toggleStepMode() {
  if (!task.steps?.length) return;
  directAnswer = isStructuredStep();
  stepIndex = directAnswer ? -1 : 0;
  hintIndex = 0;
  renderTask();
}

function showExercise() {
  elements.start.hidden = true;
  elements.exercise.hidden = false;
  elements.workspaceDock.hidden = false;
  elements.keyboardDock.hidden = false;
  document.body.classList.add("is-training");
  createTask();
}

function showStart() {
  elements.exercise.hidden = true;
  elements.workspaceDock.hidden = true;
  elements.keyboardDock.hidden = true;
  elements.start.hidden = false;
  document.body.classList.remove("is-training");
  renderStartControls();
  elements.startButton.focus({ preventScroll: true });
}

function bindEvents() {
  elements.selectAll.addEventListener("click", () => {
    state.selectedTopics = enabledTopics().map(topic => topic.id);
    state.activePreset = "custom";
    renderStartControls();
    persist();
  });
  elements.selectNone.addEventListener("click", () => {
    state.selectedTopics = [];
    state.activePreset = "custom";
    renderStartControls();
    persist();
  });
  elements.difficultyOptions.addEventListener("click", event => {
    const button = event.target.closest("[data-difficulty]");
    if (!button) return;
    state.difficulty = button.dataset.difficulty;
    renderDifficulty();
    persist();
  });
  elements.modeOptions.addEventListener("click", event => {
    const button = event.target.closest("[data-mode]");
    if (!button) return;
    state.mode = button.dataset.mode;
    renderModes();
    persist();
  });
  elements.matlab.addEventListener("change", () => {
    state.matlab = elements.matlab.checked;
    if (!state.matlab) state.selectedTopics = state.selectedTopics.filter(topic => topic !== "matlab");
    renderStartControls();
    persist();
  });
  elements.confirmSkip.addEventListener("change", persist);
  elements.resetData.addEventListener("click", () => {
    if (!window.confirm("Alle lokalen Einstellungen, Ergebnisse und Fehlerdaten löschen?")) return;
    resetStorage();
    state = JSON.parse(JSON.stringify(defaults));
    elements.matlab.checked = state.matlab;
    elements.confirmSkip.checked = state.confirmSkip;
    renderStartControls();
  });
  elements.startButton.addEventListener("click", showExercise);
  elements.back.addEventListener("click", showStart);
  elements.form.addEventListener("submit", submitAnswer);
  elements.hintButton.addEventListener("click", showHint);
  elements.skipButton.addEventListener("click", skipTask);
  elements.solutionButton.addEventListener("click", showSolution);
  elements.similar.addEventListener("click", () => continueWith({ forcedGeneratorId: task.generatorId }));
  elements.easier.addEventListener("click", () => continueVariant("easier"));
  elements.harder.addEventListener("click", () => continueVariant("harder"));
  elements.later.addEventListener("click", rememberForLater);
  elements.next.addEventListener("click", () => continueWith());
  elements.saveStep.addEventListener("click", saveCurrentStep);
  elements.toggleStepMode.addEventListener("click", toggleStepMode);
  elements.undoSkip.addEventListener("click", undoSkip);
  window.addEventListener("online", updateNetworkStatus);
  window.addEventListener("offline", updateNetworkStatus);
  window.addEventListener("resize", () => applyDockMetrics());
  window.addEventListener("orientationchange", () => applyDockMetrics());
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  navigator.serviceWorker.register("./sw.js").then(registration => {
    if (registration.waiting) elements.update.hidden = false;
    registration.addEventListener("updatefound", () => registration.installing?.addEventListener("statechange", () => {
      if (registration.installing?.state === "installed" && navigator.serviceWorker.controller) elements.update.hidden = false;
    }));
    elements.reload.addEventListener("click", () => {
      registration.waiting?.postMessage({ type: "SKIP_WAITING" });
      location.reload();
    });
  }).catch(error => console.info("Offline-Modus konnte nicht registriert werden", error));
}

elements.matlab.checked = state.matlab;
elements.confirmSkip.checked = state.confirmSkip;
keyboard = new MathKeyboard(elements.keyboardDock);
applyDockMetrics();
bindEvents();
renderStartControls();
updateNetworkStatus();
updateScore();
registerServiceWorker();

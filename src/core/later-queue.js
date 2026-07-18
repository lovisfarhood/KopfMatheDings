import { hashSeed } from "./random.js";

const clone = value => JSON.parse(JSON.stringify(value));

export function serializeTaskForLater(task) {
  if (!task?.signature || !task?.generatorId || !task?.topic) throw new TypeError("Die Aufgabe kann nicht vorgemerkt werden.");
  return clone(task);
}

export function scheduleDelay(signature) {
  return 3 + (hashSeed(signature) % 8);
}

export function enqueueLater(queue, task, options = {}) {
  const items = Array.isArray(queue) ? queue.map(clone) : [];
  if (items.some(item => item.signature === task.signature)) return items;
  const counter = Math.max(0, Number(options.counter) || 0);
  const delay = options.delay == null ? scheduleDelay(task.signature) : Math.max(3, Math.min(10, Number(options.delay) || 3));
  items.push({
    id: `${task.generatorId}:${hashSeed(task.signature).toString(16)}`,
    signature: task.signature,
    generatorId: task.generatorId,
    topic: task.topic,
    difficulty: task.difficulty,
    taskMode: task.sessionMode || options.taskMode || "head",
    inputMode: task.answerMode || task.inputSpec?.mode || "expression",
    seed: task.seed || options.seed || null,
    markedAt: options.now ?? Date.now(),
    dueAt: counter + delay,
    task: serializeTaskForLater(task)
  });
  return items.slice(-50);
}

export function dueLater(queue, options = {}) {
  const counter = Math.max(0, Number(options.counter) || 0);
  const enabledTopics = new Set(options.enabledTopics || []);
  return (Array.isArray(queue) ? queue : [])
    .filter(item => item?.task
      && item.dueAt <= counter
      && enabledTopics.has(item.topic)
      && (!options.mode || item.taskMode === options.mode))
    .sort((left, right) => left.dueAt - right.dueAt || left.markedAt - right.markedAt)[0] || null;
}

export function restoreLater(item) {
  if (!item?.task) throw new TypeError("Die vorgemerkte Aufgabe ist unvollständig.");
  return Object.freeze({ ...clone(item.task), repeatedFromLater: true });
}

export function completeLater(queue, itemOrSignature) {
  const signature = typeof itemOrSignature === "string" ? itemOrSignature : itemOrSignature?.signature;
  return (Array.isArray(queue) ? queue : []).filter(item => item.signature !== signature).map(clone);
}

export function rescheduleLater(queue, itemOrSignature, options = {}) {
  const signature = typeof itemOrSignature === "string" ? itemOrSignature : itemOrSignature?.signature;
  const counter = Math.max(0, Number(options.counter) || 0);
  return (Array.isArray(queue) ? queue : []).map(item => item.signature === signature ? {
    ...clone(item),
    markedAt: options.now ?? Date.now(),
    dueAt: counter + (options.delay == null ? scheduleDelay(`${signature}:${counter}`) : Math.max(3, Math.min(10, Number(options.delay) || 3)))
  } : clone(item));
}

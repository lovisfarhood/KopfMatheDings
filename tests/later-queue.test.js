import test from "node:test";
import assert from "node:assert/strict";
import { generateTask } from "../src/core/registry.js";
import {
  completeLater,
  dueLater,
  enqueueLater,
  rescheduleLater,
  restoreLater,
  scheduleDelay
} from "../src/core/later-queue.js";

test("vorgemerkte Aufgabe erscheint identisch nach drei anderen Aufgaben", () => {
  const task = generateTask({ topics: ["complex"], difficulty: "standard", seed: "later-source" });
  const queue = enqueueLater([], task, { counter: 7, delay: 3, now: 123 });
  assert.equal(queue.length, 1);
  assert.equal(dueLater(queue, { counter: 9, enabledTopics: ["complex"], mode: "head" }), null);
  const due = dueLater(queue, { counter: 10, enabledTopics: ["complex"], mode: "head" });
  assert.equal(due.signature, task.signature);
  assert.deepEqual(JSON.parse(JSON.stringify(restoreLater(due))), { ...JSON.parse(JSON.stringify(task)), repeatedFromLater: true });
});

test("Warteschlange bleibt serialisierbar, dedupliziert und respektiert Thema und Modus", () => {
  const task = generateTask({ topics: ["matrices"], difficulty: "plus", seed: "later-persist" });
  let queue = enqueueLater([], task, { counter: 1, delay: 3 });
  queue = enqueueLater(queue, task, { counter: 2, delay: 3 });
  assert.equal(queue.length, 1);
  const restarted = JSON.parse(JSON.stringify(queue));
  assert.equal(dueLater(restarted, { counter: 20, enabledTopics: ["complex"], mode: "head" }), null);
  assert.equal(dueLater(restarted, { counter: 20, enabledTopics: ["matrices"], mode: "step" }), null);
  assert.equal(dueLater(restarted, { counter: 20, enabledTopics: ["matrices"], mode: "head" }).signature, task.signature);
});

test("erledigte Wiederholung wird entfernt und erneutes Vormerken neu terminiert", () => {
  const task = generateTask({ topics: ["taylor"], difficulty: "plus", seed: "later-complete" });
  const queue = enqueueLater([], task, { counter: 4, delay: 3 });
  assert.deepEqual(completeLater(queue, task.signature), []);
  const postponed = rescheduleLater(queue, task.signature, { counter: 20, delay: 5, now: 999 });
  assert.equal(postponed.length, 1);
  assert.equal(postponed[0].dueAt, 25);
  assert.equal(postponed[0].markedAt, 999);
});

test("automatische Wiedervorlage liegt immer zwischen drei und zehn Aufgaben", () => {
  for (let index = 0; index < 500; index += 1) {
    const delay = scheduleDelay(`signature-${index}`);
    assert.ok(delay >= 3 && delay <= 10, String(delay));
  }
});

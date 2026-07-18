import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { installDom } from "./dom-helpers.js";

const root = fileURLToPath(new URL("../", import.meta.url));

test("vollständiger App-DOM startet mobil und bedient Schritt- sowie Wiederholungsfluss", async () => {
  const html = readFileSync(`${root}/index.html`, "utf8");
  const { document, storage } = installDom(html);
  await import(`../src/app.js?dom-test=${Date.now()}`);

  const dock = document.querySelector("#keyboard-dock");
  assert.equal(dock.className, "keyboard-dock");
  assert.equal(dock.querySelectorAll(":scope > .math-keyboard").length, 1);
  assert.equal(document.querySelectorAll("#inputs input, #inputs textarea, #inputs [contenteditable=true]").length, 0);
  assert.equal(document.documentElement.style.getPropertyValue("--keyboard-height"), "312px");

  document.querySelector('[data-mode="step"]').click();
  assert.equal(document.querySelector('[data-mode="step"]').getAttribute("aria-checked"), "true");
  assert.equal(document.querySelector("#start-button").disabled, false);
  document.querySelector("#start-button").click();

  assert.equal(document.body.classList.contains("is-training"), true);
  assert.equal(document.querySelector("#task-mode").textContent, "Schrittmodus");
  assert.equal(document.querySelector("#step-progress").hidden, false);
  assert.ok(document.querySelectorAll("#step-progress .step-dot").length >= 2);
  assert.equal(dock.hidden, false);
  assert.equal(dock.className, "keyboard-dock");
  assert.equal(document.querySelectorAll("#inputs input, #inputs textarea, #inputs [contenteditable=true]").length, 0);

  const dockIdentity = dock;
  [...dock.querySelectorAll(".keyboard-tab")].find(button => button.textContent === "Strukturen").click();
  assert.equal(document.querySelector("#keyboard-dock"), dockIdentity);
  assert.equal(dock.className, "keyboard-dock");

  document.querySelector("#solution-button").click();
  document.querySelector("#later").click();
  let persisted = JSON.parse(storage.getItem("kopfmathe.v3"));
  assert.equal(persisted.later.length, 1);
  assert.ok(persisted.later[0].task.inputSpec);
  assert.ok(persisted.later[0].task.answer);
  assert.ok(persisted.later[0].task.steps.length >= 2);

  let interveningTasks = 0;
  while (!/Wiederholung/.test(document.querySelector("#meta").textContent) && interveningTasks < 10) {
    interveningTasks += 1;
    document.querySelector("#solution-button").click();
    document.querySelector("#next").click();
  }
  assert.ok(interveningTasks >= 3 && interveningTasks <= 10, String(interveningTasks));
  assert.match(document.querySelector("#meta").textContent, /Wiederholung/);
  assert.ok(document.querySelectorAll("#step-progress .step-dot").length >= 2);
  persisted = JSON.parse(storage.getItem("kopfmathe.v3"));
  assert.equal(persisted.later.length, 1);

  document.querySelector("#back").click();
  assert.equal(dock.hidden, true);
  assert.equal(document.body.classList.contains("is-training"), false);
});

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));

test("Manifest ist gültig und GitHub-Pages-relativ", () => {
  const manifest = JSON.parse(readFileSync(join(root, "manifest.webmanifest"), "utf8"));
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.display, "standalone");
  for (const icon of manifest.icons) assert.ok(existsSync(join(root, icon.src.replace(/^\.\//, ""))), icon.src);
});

test("Service Worker cached alle neuen lokalen Laufzeitmodule", () => {
  const worker = readFileSync(join(root, "sw.js"), "utf8");
  for (const asset of ["src/core/expression.js", "src/core/later-queue.js", "src/ui/input-model.js", "src/ui/math-keyboard.js", "src/ui/layout.js", "src/topics/quality-generators.js"]) {
    assert.match(worker, new RegExp(asset.replaceAll(".", "\\.")), asset);
  }
  assert.match(worker, /kopfmathe-v4-/);
  assert.match(worker, /SKIP_WAITING/);
});

test("Oberfläche bindet keine externen Ressourcen ein und vermeidet native Aufgabeninputs", () => {
  const html = readFileSync(join(root, "index.html"), "utf8");
  assert.doesNotMatch(html, /https?:\/\//);
  assert.doesNotMatch(html, /<input[^>]+inputmode=/i);
  assert.match(html, /id="keyboard-dock"/);
  assert.match(html, /id="topics"/);
  assert.match(html, /id="undo-skip"/);
});

test("Dark-Mode-Layout enthält Safe Areas, 44px-Touchziele und reduzierte Bewegung", () => {
  const css = readFileSync(join(root, "styles.css"), "utf8");
  assert.match(css, /#090a0c/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /prefers-reduced-motion/);
});

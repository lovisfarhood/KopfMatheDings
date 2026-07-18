import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const requiredFiles = [
  "index.html", "styles.css", "manifest.webmanifest", "sw.js",
  "src/app.js", "src/core/expression.js", "src/core/checker.js", "src/core/registry.js",
  "src/core/later-queue.js", "src/ui/input-model.js", "src/ui/inputs.js", "src/ui/math-keyboard.js", "src/ui/layout.js",
  "src/topics/quality-generators.js", "icons/icon-180.png", "icons/icon-192.png",
  "icons/icon-512.png", "icons/maskable-512.png"
];

for (const file of requiredFiles) assert.ok(existsSync(join(root, file)), `Fehlende Datei: ${file}`);

const manifest = JSON.parse(readFileSync(join(root, "manifest.webmanifest"), "utf8"));
assert.equal(manifest.start_url, "./");
assert.equal(manifest.scope, "./");
assert.equal(manifest.display, "standalone");
assert.ok(manifest.icons.some(icon => icon.sizes === "192x192"));
assert.ok(manifest.icons.some(icon => icon.sizes === "512x512"));

const index = readFileSync(join(root, "index.html"), "utf8");
assert.doesNotMatch(index, /https?:\/\//, "Keine externen Laufzeitressourcen erlaubt");
assert.match(index, /viewport-fit=cover/);
assert.match(index, /manifest\.webmanifest/);

const serviceWorker = readFileSync(join(root, "sw.js"), "utf8");
for (const file of requiredFiles.filter(file => !file.startsWith("icons/icon-") || file !== "icons/icon-180.png")) {
  if (["sw.js"].includes(file)) continue;
  assert.match(serviceWorker, new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Nicht im Offline-Cache: ${file}`);
}

const sourceFiles = [
  "sw.js", "src/app.js", "src/core/expression.js", "src/core/checker.js", "src/core/storage.js",
  "src/core/registry.js", "src/ui/input-model.js", "src/ui/inputs.js", "src/ui/math-keyboard.js",
  "src/ui/layout.js", "src/core/later-queue.js", "src/topics/helpers.js", "src/topics/quality-generators.js", "scripts/check-static.mjs"
];
for (const file of sourceFiles) execFileSync(process.execPath, ["--check", join(root, file)], { stdio: "pipe" });

console.log(`Statische Produktionsprüfung erfolgreich: ${requiredFiles.length} Kernassets, Manifest, Offline-Cache und ${sourceFiles.length} JavaScript-Dateien.`);

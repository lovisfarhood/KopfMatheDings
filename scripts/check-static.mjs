import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
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
const sourceFiles = readdirSync(join(root, "src"), { recursive: true })
  .filter(file => String(file).endsWith(".js"))
  .map(file => `src/${String(file)}`)
  .sort();
const offlineAssets = [...new Set([
  "index.html",
  "styles.css",
  "manifest.webmanifest",
  "icons/icon-180.png",
  ...manifest.icons.map(icon => icon.src.replace(/^\.\//, "")),
  ...sourceFiles
])];
for (const file of offlineAssets) {
  assert.match(serviceWorker, new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Nicht im Offline-Cache: ${file}`);
}

const pagesBase = new URL("https://lovisfarhood.github.io/KopfMatheDings/");
for (const relative of [manifest.id, manifest.start_url, manifest.scope, "./src/app.js", ...manifest.icons.map(icon => icon.src)]) {
  const resolved = new URL(relative, pagesBase);
  assert.equal(resolved.origin, pagesBase.origin);
  assert.ok(resolved.pathname.startsWith(pagesBase.pathname), `Pfad verlässt GitHub-Pages-Unterpfad: ${relative}`);
}

const syntaxFiles = ["sw.js", ...sourceFiles, "scripts/check-static.mjs"];
for (const file of syntaxFiles) execFileSync(process.execPath, ["--check", join(root, file)], { stdio: "pipe" });

console.log(`Statische Produktionsprüfung erfolgreich: ${offlineAssets.length} Offline-Assets, GitHub-Pages-Unterpfad und ${syntaxFiles.length} JavaScript-Dateien.`);

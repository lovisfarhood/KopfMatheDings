import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dockMetrics } from "../src/ui/layout.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const css = readFileSync(`${root}/styles.css`, "utf8");

const viewports = [
  { name: "iPhone SE 1", width: 320, height: 568, safeBottom: 0 },
  { name: "iPhone SE 2", width: 375, height: 667, safeBottom: 0 },
  { name: "iPhone 12/13 mini", width: 375, height: 812, safeBottom: 34 },
  { name: "iPhone 14", width: 390, height: 844, safeBottom: 34 },
  { name: "iPhone 15 Pro", width: 393, height: 852, safeBottom: 34 },
  { name: "iPhone 15 Pro Max", width: 430, height: 932, safeBottom: 34 },
  { name: "iPhone Querformat", width: 844, height: 390, safeBottom: 21 }
];

for (const viewport of viewports) {
  test(`${viewport.name}: feste Docks bleiben geordnet und Aufgabeninhalt scrollbar`, () => {
    const metrics = dockMetrics(viewport);
    assert.equal(metrics.workspaceBottom, metrics.keyboardTop);
    assert.equal(metrics.keyboardBottom, viewport.height);
    assert.ok(metrics.workspaceTop >= 96, `${metrics.workspaceTop}px freie Aufgabenhöhe`);
    assert.ok(metrics.contentPaddingBottom > metrics.keyboardHeight + metrics.workspaceHeight);
  });
}

test("CSS reserviert Tastatur, Workspace und Safe Area im Aufgaben-Viewport", () => {
  assert.match(css, /\.exercise-view\s*\{[^}]*min-height:\s*100dvh;/s);
  assert.match(css, /padding:[^;]*calc\(var\(--keyboard-height\) \+ var\(--workspace-height\) \+ env\(safe-area-inset-bottom\) \+ 32px\)/s);
  assert.match(css, /\.workspace-dock\s*\{[^}]*position:\s*fixed;[^}]*bottom:\s*calc\(var\(--keyboard-height\) \+ env\(safe-area-inset-bottom\)\)/s);
  assert.match(css, /\.keyboard-dock\s*\{[^}]*position:\s*fixed;[^}]*bottom:\s*0;/s);
});

test("alle Tastaturvarianten behalten mindestens 44px Touchhöhe", () => {
  const keyBlocks = [...css.matchAll(/\.math-key\s*\{([^}]*)\}/g)].map(match => match[1]);
  assert.ok(keyBlocks.length >= 3);
  for (const block of keyBlocks) {
    const height = Number(block.match(/min-height:\s*(\d+)px/)?.[1]);
    assert.ok(height >= 44, block);
  }
});

test("kleine Breiten und Querformat besitzen explizite responsive Regeln", () => {
  assert.match(css, /@media \(max-width:\s*390px\)/);
  assert.match(css, /@media \(orientation:\s*landscape\) and \(max-height:\s*520px\)/);
  assert.match(css, /grid-template-columns:\s*repeat\(10,\s*1fr\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("schmale Geräte behalten kompakte Tastatur- und Workspace-Höhen", () => {
  const compact = dockMetrics({ width: 390, height: 844, safeBottom: 34 });
  const regular = dockMetrics({ width: 430, height: 932, safeBottom: 34 });
  const landscape = dockMetrics({ width: 844, height: 390, safeBottom: 21 });
  assert.deepEqual([compact.keyboardHeight, compact.workspaceHeight], [312, 64]);
  assert.deepEqual([regular.keyboardHeight, regular.workspaceHeight], [320, 70]);
  assert.deepEqual([landscape.keyboardHeight, landscape.workspaceHeight], [210, 56]);
});

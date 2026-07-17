import test from "node:test";
import assert from "node:assert/strict";
import {
  equivalentExpressions,
  evaluateConstant,
  formatExpression,
  normalizeExpression,
  parseExpression,
  splitTopLevel,
  variablesIn
} from "../src/core/expression.js";

test("Parser unterstützt implizite Multiplikation, Funktionen und Variablen", () => {
  const ast = parseExpression("-3/2*x^2 + 4x - 1");
  assert.deepEqual([...variablesIn(ast)], ["x"]);
  assert.equal(equivalentExpressions("-3/2*x^2 + 4x - 1", "-1.5*x*x+4*x-1"), true);
});

test("Konstanten, Wurzeln und komplexe Potenzen", () => {
  assert.ok(Math.abs(evaluateConstant("sin(pi/2)").re - 1) < 1e-10);
  assert.ok(Math.abs(evaluateConstant("sqrt(2)^2").re - 2) < 1e-9);
  const iSquared = evaluateConstant("i^2");
  assert.ok(Math.abs(iSquared.re + 1) < 1e-10 && Math.abs(iSquared.im) < 1e-10);
});

test("Live-Darstellung erzeugt echte Brüche, Exponenten und Wurzeln", () => {
  const formatted = formatExpression("sqrt(x^2+1)/(x-2)");
  assert.equal(formatted.ok, true);
  assert.match(formatted.html, /expr-fraction/);
  assert.match(formatted.html, /expr-root/);
  assert.match(formatted.html, /<sup>/);
});

test("Teilausdrücke und Semikolon-Mengen werden stabil getrennt", () => {
  assert.deepEqual(splitTopLevel("1/2; sqrt(3); (1;2)"), ["1/2", "sqrt(3)", "(1;2)"]);
  assert.equal(normalizeExpression("−3·x² + π"), "-3*x^2 + pi");
});

test("gefährliche oder unbekannte Syntax wird abgelehnt", () => {
  for (const source of ["Math.random()", "x=>x", "globalThis", "2**3", "sqrt("]) {
    assert.throws(() => evaluateConstant(source), source);
  }
});

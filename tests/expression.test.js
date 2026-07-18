import test from "node:test";
import assert from "node:assert/strict";
import {
  equivalentExpressions,
  equivalentEquations,
  evaluateConstant,
  formatEditorExpression,
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

test("implizite Multiplikation trennt Variablenprodukte und respektiert Aufgabenvariablen", () => {
  const options = { allowedVariables: ["x", "y"] };
  for (const [actual, expected] of [
    ["xy", "x*y"],
    ["3xy", "3*x*y"],
    ["(x+1)(x-1)", "x^2-1"],
    ["2sin(x)", "2*sin(x)"],
    ["(x+1)y", "(x+1)*y"]
  ]) assert.equal(equivalentExpressions(actual, expected, options), true, actual);
  assert.equal(equivalentExpressions("2i", "2*i"), true);
  assert.deepEqual([...variablesIn(parseExpression("xy", { allowedVariables: ["xy"] }))], ["xy"]);
  assert.throws(() => parseExpression("x+z", options), /nicht vorgesehen/);
});

test("Gleichungen werden über normalisierte Nullmengen statt Funktionswerte verglichen", () => {
  for (const actual of ["x=1", "2x=2", "x-1=0", "3x-3=0"]) assert.equal(equivalentEquations(actual, "x=1"), true, actual);
  for (const actual of ["x=2", "x^2=1", "x(x-1)=0", "sin(x)=0"]) assert.equal(equivalentEquations(actual, "x=1"), false, actual);
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

test("aktive freie Eingabe zeigt Strukturen und Cursor direkt im Editor", () => {
  const fraction = formatEditorExpression("()/()", 1);
  assert.equal(fraction.ok, true);
  assert.match(fraction.html, /expr-fraction/);
  assert.match(fraction.html, /entry-caret/);
  assert.match(fraction.html, /entry-placeholder/);
  assert.match(formatEditorExpression("x^(2)", 3).html, /<sup>/);
  assert.match(formatEditorExpression("sqrt(x)", 5).html, /expr-root/);
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

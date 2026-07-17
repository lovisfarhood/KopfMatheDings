import test from "node:test";
import assert from "node:assert/strict";
import { checkTaskAnswer, parseNumber } from "../src/core/checker.js";

const task = answer => ({ answer });

test("sichere Zahleneingabe ohne eval", () => {
  assert.equal(parseNumber(" 3 / 4 ").value.toString(), "3/4");
  assert.equal(parseNumber("2+2").value, 4);
  assert.equal(parseNumber("sqrt(4)").value, 2);
  assert.ok(Math.abs(parseNumber("pi/3").value - Math.PI / 3) < 1e-12);
  for (const value of ["", "Math.random()", "globalThis", "alert(1)", "constructor", "1/0"]) {
    assert.equal(parseNumber(value).ok, false, value);
  }
});

test("negative Zahlen, Brüche, Dezimalzahlen und Toleranz", () => {
  assert.equal(checkTaskAnswer(task({ type: "number", value: -7 }), "-7").correct, true);
  assert.equal(checkTaskAnswer(task({ type: "number", value: "-3/2" }), "-1,5").correct, true);
  assert.equal(checkTaskAnswer(task({ type: "number", value: "1/2" }), "2/4").correct, true);
  assert.equal(checkTaskAnswer(task({ type: "number", value: "1/3", tolerance: 1e-5 }), "0,333333").correct, true);
});

test("algebraische Äquivalenz statt Zeichenketten", () => {
  const expected = answer => task({ type: "expression", value: answer });
  assert.equal(checkTaskAnswer(expected("2*x"), "x+x").correct, true);
  assert.equal(checkTaskAnswer(expected("x^2+3*x-1"), "-1+3*x+x^2").correct, true);
  assert.equal(checkTaskAnswer(expected("(x-2)*(x+3)"), "x^2+x-6").correct, true);
  assert.equal(checkTaskAnswer(expected("1/(x+1)"), "2/(2*x+2)").correct, true);
  assert.equal(checkTaskAnswer(expected("x^2"), "x^3").correct, false);
});

test("ungültige Syntax wird verständlich und nicht als falsch bewertet", () => {
  const result = checkTaskAnswer(task({ type: "expression", value: "x+1" }), "(x+1");
  assert.equal(result.valid, false);
  assert.match(result.message, /Klammer/);
});

test("strukturierte Felder, Matrizen und Dimensionen", () => {
  assert.equal(checkTaskAnswer(task({ type: "fields", values: { re: "1/2", im: -3 } }), { re: "0,5", im: "-3" }).correct, true);
  assert.equal(checkTaskAnswer(task({ type: "fields", values: { phi: "pi/3" } }), { phi: "π/3" }).correct, true);
  assert.equal(checkTaskAnswer(task({ type: "matrix", values: [[1, "1/2"], [-3, 4]] }), [["1", "2/4"], ["-3", "4"]]).correct, true);
  assert.equal(checkTaskAnswer(task({ type: "matrix", values: [[1, 2], [3, 4]] }), [["1", "2"]]).valid, false);
});

test("Eigenvektoren gelten bis auf einen Skalarfaktor", () => {
  const answer = task({ type: "proportional", values: { x: 2, y: -3, z: 1 } });
  assert.equal(checkTaskAnswer(answer, { x: "-4", y: "6", z: "-2" }).correct, true);
  assert.equal(checkTaskAnswer(answer, { x: "0", y: "0", z: "0" }).correct, false);
  assert.equal(checkTaskAnswer(answer, { x: "2", y: "3", z: "1" }).correct, false);
});

test("Lösungsmengen sind ungeordnet und behandeln Duplikate", () => {
  const answer = task({ type: "set", values: [-2, 3] });
  assert.equal(checkTaskAnswer(answer, "3; -2").correct, true);
  assert.equal(checkTaskAnswer(answer, "-2; -2").correct, false);
  assert.equal(checkTaskAnswer(answer, "3; -2; 3").correct, false);
});

test("komplexe Zahlen in kartesischer und Eulerform", () => {
  const euler = task({ type: "complex", expression: "exp(i*pi/3)" });
  assert.equal(checkTaskAnswer(euler, "1/2+sqrt(3)/2*i").correct, true);
  assert.equal(checkTaskAnswer(task({ type: "complex", re: -2, im: 3 }), "-2+3i").correct, true);
  assert.equal(checkTaskAnswer(euler, "1/2-sqrt(3)/2*i").correct, false);
});

test("Argumente werden modulo 2π geprüft", () => {
  const answer = task({ type: "angle", value: "pi/3", period: "2*pi" });
  assert.equal(checkTaskAnswer(answer, "7*pi/3").correct, true);
  assert.equal(checkTaskAnswer(answer, "-5*pi/3").correct, true);
  assert.equal(checkTaskAnswer(answer, "4*pi/3").correct, false);
});

test("Auswahl und Wahr/Falsch", () => {
  assert.equal(checkTaskAnswer(task({ type: "choice", value: "a" }), "a").correct, true);
  assert.equal(checkTaskAnswer(task({ type: "boolean", value: "false" }), "false").correct, true);
});

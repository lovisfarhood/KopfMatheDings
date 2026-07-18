import test from "node:test";
import assert from "node:assert/strict";
import { evaluateConstant, evaluateExpression, parseExpression } from "../src/core/expression.js";
import { createRng } from "../src/core/random.js";
import { registry } from "../src/core/registry.js";

const VARIANTS = 100;
const close = (actual, expected, tolerance = 1e-7) => Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(actual), Math.abs(expected));
const number = value => {
  const source = String(value);
  if (/^[+-]?\d+(?:\/[-+]?\d+)?$/.test(source)) {
    const [numerator, denominator = "1"] = source.split("/");
    return Number(numerator) / Number(denominator);
  }
  return evaluateConstant(source).re;
};
const expressionAt = (source, x) => evaluateExpression(parseExpression(source), { x }).re;

function multiplyMatrices(left, right) {
  return left.map((row, rowIndex) => right[0].map((_, column) => row.reduce((sum, value, index) => sum + value * right[index][column], 0)));
}

function determinantByElimination(input) {
  const matrix = input.map(row => row.map(Number));
  let sign = 1, determinant = 1;
  for (let pivot = 0; pivot < matrix.length; pivot += 1) {
    let row = pivot;
    while (row < matrix.length && Math.abs(matrix[row][pivot]) < 1e-12) row += 1;
    if (row === matrix.length) return 0;
    if (row !== pivot) {
      [matrix[row], matrix[pivot]] = [matrix[pivot], matrix[row]];
      sign *= -1;
    }
    const value = matrix[pivot][pivot];
    determinant *= value;
    for (let lower = pivot + 1; lower < matrix.length; lower += 1) {
      const factor = matrix[lower][pivot] / value;
      for (let column = pivot; column < matrix.length; column += 1) matrix[lower][column] -= factor * matrix[pivot][column];
    }
  }
  return sign * determinant;
}

function simpson(fn, lower, upper, panels = 400) {
  const count = panels % 2 ? panels + 1 : panels;
  const width = (upper - lower) / count;
  let sum = fn(lower) + fn(upper);
  for (let index = 1; index < count; index += 1) sum += (index % 2 ? 4 : 2) * fn(lower + index * width);
  return sum * width / 3;
}

const complexMultiply = (left, right) => ({
  re: left.re * right.re - left.im * right.im,
  im: left.re * right.im + left.im * right.re
});

const CHECKS = {
  "complex.division-general": task => {
    const { numerator: [a, b], denominator: [c, d], quotient: [re, im] } = task.reference;
    const denominator = c * c + d * d;
    assert.ok(close((a * c + b * d) / denominator, re));
    assert.ok(close((b * c - a * d) / denominator, im));
  },
  "complex.roots": task => {
    assert.equal(task.answer.values.length, task.reference.power);
    for (const source of task.answer.values) {
      const value = evaluateConstant(source);
      let powered = { re: 1, im: 0 };
      for (let count = 0; count < task.reference.power; count += 1) powered = complexMultiply(powered, value);
      assert.ok(close(powered.re, task.reference.target, 1e-6));
      assert.ok(close(powered.im, 0, 1e-6));
    }
  },
  "derivatives.quotient": task => {
    const [a, b, c, d] = task.reference.coefficients, x = task.reference.x, h = 1e-5;
    const fn = value => (a * value + b) / (c * value + d);
    const numerical = (fn(x + h) - fn(x - h)) / (2 * h);
    assert.ok(close(numerical, number(task.answer.value), 2e-5));
  },
  "derivatives.mixed-expression": task => {
    const { a, b, c } = task.reference;
    const fn = x => Math.sin(a * x + b) * Math.exp(c * x);
    for (const x of [-1.1, -0.2, 0.7, 1.4]) {
      const h = 1e-5, numerical = (fn(x + h) - fn(x - h)) / (2 * h);
      assert.ok(close(numerical, expressionAt(task.answer.value, x), 3e-5));
    }
  },
  "integrals.substitution": task => {
    const { a, b, n, bounds } = task.reference;
    const numerical = simpson(x => 2 * a * x * (a * x * x + b) ** n, bounds[0], bounds[1]);
    assert.ok(close(numerical, number(task.answer.value), 2e-7));
  },
  "integrals.partial-fractions": task => {
    const { p, q, A, B, numerator } = task.reference;
    assert.equal(number(task.answer.values.A), A);
    assert.equal(number(task.answer.values.B), B);
    for (const x of [-3.7, -1.2, 0.4, 2.8, 5.1].filter(value => Math.abs(value - p) > .1 && Math.abs(value - q) > .1)) {
      const original = (numerator[0] * x + numerator[1]) / ((x - p) * (x - q));
      const split = A / (x - p) + B / (x - q);
      assert.ok(close(original, split));
    }
  },
  "taylor.shifted-exp": task => {
    const { center, order } = task.reference;
    const factorial = n => Array.from({ length: n }, (_, index) => index + 1).reduce((product, value) => product * value, 1);
    for (const delta of [-0.25, -0.08, 0.12, 0.3]) {
      const manual = Math.exp(center) * Array.from({ length: order + 1 }, (_, degree) => delta ** degree / factorial(degree)).reduce((sum, value) => sum + value, 0);
      assert.ok(close(expressionAt(task.answer.value, center + delta), manual));
    }
  },
  "taylor.rational": task => {
    const { a, order } = task.reference;
    for (const x of [-0.3, -0.1, 0.15, 0.35]) {
      const manual = Array.from({ length: order + 1 }, (_, degree) => x ** degree / a ** (degree + 1)).reduce((sum, value) => sum + value, 0);
      assert.ok(close(expressionAt(task.answer.value, x), manual));
    }
  },
  "matrices.det-structured-3": task => {
    assert.ok(close(determinantByElimination(task.reference.matrix), task.reference.value));
  },
  "matrices.row-operation": task => {
    const { source, factor, result } = task.reference;
    const independentlyApplied = [source[0], source[1].map((value, index) => value - factor * source[0][index])];
    assert.deepEqual(independentlyApplied, result);
  },
  "matrices.eigenvalues": task => {
    for (const value of task.reference.values) {
      const shifted = task.reference.matrix.map((row, rowIndex) => row.map((item, column) => item - (rowIndex === column ? value : 0)));
      assert.ok(close(determinantByElimination(shifted), 0));
    }
  },
  "matrices.eigenvector": task => {
    const { matrix, lambda, vector } = task.reference;
    const product = matrix.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0));
    product.forEach((value, index) => assert.ok(close(value, lambda * vector[index])));
    assert.ok(vector.some(value => value !== 0));
  },
  "matrices.inverse": task => {
    const inverse = task.reference.inverse.map(row => row.map(number));
    const product = multiplyMatrices(task.reference.matrix, inverse);
    product.forEach((row, rowIndex) => row.forEach((value, column) => assert.ok(close(value, rowIndex === column ? 1 : 0))));
  },
  "linearSystems.gauss-steps": task => {
    const { matrix, rhs, solution } = task.reference;
    matrix.forEach((row, index) => assert.equal(row[0] * solution[0] + row[1] * solution[1], rhs[index]));
    const reduced = [matrix[0].concat(rhs[0]), matrix[1].map((value, index) => value - (matrix[1][0] / matrix[0][0]) * matrix[0][index]).concat(rhs[1] - (matrix[1][0] / matrix[0][0]) * rhs[0])];
    assert.deepEqual(reduced, task.reference.reduced);
  },
  "decompositions.lu-complete": task => {
    assert.deepEqual(multiplyMatrices(task.reference.lower, task.reference.upper), task.reference.matrix);
  },
  "decompositions.qr-first-vector": task => {
    const [x, y] = task.reference.column;
    assert.ok(close(Math.hypot(x, y), task.reference.norm));
    const vector = [number(task.reference.vector.x), number(task.reference.vector.y)];
    assert.ok(close(Math.hypot(...vector), 1));
    assert.ok(close(vector[0], x / task.reference.norm));
    assert.ok(close(vector[1], y / task.reference.norm));
  }
};

for (const [generatorId, verify] of Object.entries(CHECKS)) {
  test(`${generatorId}: ${VARIANTS} unabhängige Referenzprüfungen`, () => {
    const generator = registry.find(item => item.id === generatorId);
    assert.ok(generator, generatorId);
    const rng = createRng(`independent-${generatorId}`);
    for (let index = 0; index < VARIANTS; index += 1) {
      const task = generator.generate(rng, generator.levels[0]);
      assert.equal(task.reference?.kind != null, true, `${generatorId}:${index}`);
      verify(task);
    }
  });
}

test("unabhängige Eliminationsroutine behandelt singuläre Matrix und Nullpivot", () => {
  assert.equal(determinantByElimination([[0, 1], [1, 0]]), -1);
  assert.equal(determinantByElimination([[1, 2], [2, 4]]), 0);
  assert.equal(determinantByElimination([[0, 0], [0, 0]]), 0);
});

test("unabhängiger Umfang umfasst mindestens 1.500 Generatorvarianten", () => {
  assert.ok(Object.keys(CHECKS).length * VARIANTS >= 1500);
});

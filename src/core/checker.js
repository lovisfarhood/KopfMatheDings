import { Rational } from "./rational.js";
import {
  complexClose,
  equivalentEquations,
  equivalentExpressions,
  evaluateConstant,
  matchesRequiredForm,
  strictDomainEquivalent,
  splitTopLevel
} from "./expression.js";

export function parseNumber(value) {
  try {
    return { ok: true, value: Rational.parse(value) };
  } catch {
    try {
      const evaluated = evaluateConstant(value);
      if (Math.abs(evaluated.im) > 1e-10 || !Number.isFinite(evaluated.re)) return { ok: false };
      return { ok: true, value: evaluated.re, approximate: true };
    } catch {
      return { ok: false };
    }
  }
}

function numericValue(value) {
  const parsed = parseNumber(value);
  if (!parsed.ok) return null;
  return parsed.value instanceof Rational ? parsed.value.toNumber() : parsed.value;
}

function sameNumber(actual, expected, tolerance = 1e-9) {
  const parsed = parseNumber(actual);
  if (!parsed.ok) {
    return {
      valid: false,
      correct: false,
      message: "Bitte gib eine Zahl, einen Bruch oder einen exakten Ausdruck wie π/3 ein."
    };
  }
  const target = numericValue(expected);
  if (target === null) return { valid: false, correct: false, message: "Die Zielzahl ist ungültig." };
  const current = parsed.value instanceof Rational ? parsed.value.toNumber() : parsed.value;
  const scale = Math.max(1, Math.abs(current), Math.abs(target));
  return { valid: true, correct: Math.abs(current - target) <= tolerance * scale };
}

function sameExpression(actual, expected, options = {}) {
  if (!String(actual ?? "").trim()) return { valid: false, correct: false, message: "Bitte gib zuerst einen Ausdruck ein." };
  try {
    const mode = options.equivalenceMode || "algebraic";
    const comparisonOptions = {
      tolerance: options.tolerance ?? 1e-8,
      allowedVariables: options.allowedVariables,
      excludedValues: options.excludedValues
    };
    let correct;
    if (mode === "equation") correct = equivalentEquations(actual, expected, comparisonOptions);
    else if (mode === "strict-domain") correct = strictDomainEquivalent(actual, expected, comparisonOptions);
    else correct = equivalentExpressions(actual, expected, comparisonOptions);
    if (correct && !["algebraic", "equation", "strict-domain"].includes(mode)) {
      correct = matchesRequiredForm(actual, mode, comparisonOptions);
      if (!correct) return { valid: true, correct: false, message: `Der Wert stimmt, aber die verlangte Form „${mode}“ fehlt.` };
    }
    return { valid: true, correct };
  } catch (error) {
    return {
      valid: false,
      correct: false,
      message: error instanceof Error ? error.message : "Der Ausdruck konnte nicht gelesen werden."
    };
  }
}

function checkFields(raw, wanted, tolerance) {
  if (!raw || typeof raw !== "object") return { valid: false, correct: false, message: "Bitte fülle alle Positionen aus." };
  let correct = true;
  for (const [key, value] of Object.entries(wanted)) {
    if (!String(raw[key] ?? "").trim()) return { valid: false, correct: false, message: "Bitte fülle alle Positionen aus." };
    const result = sameNumber(raw[key], value, tolerance);
    if (!result.valid) return result;
    correct &&= result.correct;
  }
  return { valid: true, correct };
}

function checkMatrix(raw, wanted, tolerance) {
  if (!Array.isArray(raw) || raw.length !== wanted.length || raw.some((row, index) => !Array.isArray(row) || row.length !== wanted[index].length)) {
    return { valid: false, correct: false, message: "Die Matrix hat nicht die verlangte Dimension." };
  }
  let correct = true;
  for (let row = 0; row < wanted.length; row += 1) {
    for (let column = 0; column < wanted[row].length; column += 1) {
      if (!String(raw[row][column] ?? "").trim()) return { valid: false, correct: false, message: "Bitte fülle die ganze Matrix aus." };
      const result = sameNumber(raw[row][column], wanted[row][column], tolerance);
      if (!result.valid) return result;
      correct &&= result.correct;
    }
  }
  return { valid: true, correct };
}

function checkSet(raw, expected, tolerance, options = {}) {
  const parts = splitTopLevel(raw);
  if (!parts.length) return { valid: false, correct: false, message: "Bitte trenne mehrere Lösungen mit Semikolon." };
  if (parts.length !== expected.length) return { valid: true, correct: false };
  const remaining = [...expected];
  for (const part of parts) {
    let matched = -1;
    for (let index = 0; index < remaining.length; index += 1) {
      const comparison = typeof remaining[index] === "object" && remaining[index]?.expression
        ? sameExpression(part, remaining[index].expression, { ...options, ...remaining[index], tolerance })
        : sameExpression(part, String(remaining[index]), { ...options, tolerance });
      if (!comparison.valid) return comparison;
      if (comparison.correct) {
        matched = index;
        break;
      }
    }
    if (matched < 0) return { valid: true, correct: false };
    remaining.splice(matched, 1);
  }
  return { valid: true, correct: remaining.length === 0 };
}

function checkProportional(raw, wanted, tolerance) {
  const keys = Object.keys(wanted);
  const actual = keys.map(key => numericValue(raw?.[key]));
  const target = keys.map(key => numericValue(wanted[key]));
  if (actual.some(value => value === null)) return { valid: false, correct: false, message: "Bitte fülle alle Vektorkomponenten aus." };
  if (target.some(value => value === null)) return { valid: false, correct: false, message: "Der Zielvektor ist ungültig." };
  if (actual.every(value => Math.abs(value) <= tolerance)) return { valid: true, correct: false };
  const pivot = target.findIndex(value => Math.abs(value) > tolerance);
  if (pivot < 0) return { valid: true, correct: false };
  const factor = actual[pivot] / target[pivot];
  return {
    valid: true,
    correct: Math.abs(factor) > tolerance && actual.every((value, index) => Math.abs(value - factor * target[index]) <= tolerance * Math.max(1, Math.abs(value)))
  };
}

function checkComplex(raw, answer, tolerance) {
  if (!String(raw ?? "").trim()) return { valid: false, correct: false, message: "Bitte gib eine komplexe Zahl ein." };
  try {
    const actual = evaluateConstant(raw);
    const expected = answer.expression ? evaluateConstant(answer.expression) : { re: numericValue(answer.re), im: numericValue(answer.im) };
    if (expected.re === null || expected.im === null) throw new TypeError("Ungültiger Zielwert.");
    const valueCorrect = complexClose(actual, expected, tolerance);
    const formCorrect = !answer.equivalenceMode || matchesRequiredForm(raw, answer.equivalenceMode, { allowedVariables: [] });
    return {
      valid: true,
      correct: valueCorrect && formCorrect,
      ...(valueCorrect && !formCorrect ? { message: `Der Wert stimmt, aber die verlangte Form „${answer.equivalenceMode}“ fehlt.` } : {})
    };
  } catch (error) {
    return { valid: false, correct: false, message: error instanceof Error ? error.message : "Die komplexe Zahl konnte nicht gelesen werden." };
  }
}

function parseInterval(raw) {
  const source = String(raw ?? "").trim().replace(/−/g, "-");
  const match = source.match(/^([[(])\s*(.+?)\s*[;,]\s*(.+?)\s*([\])])$/);
  if (!match) return null;
  const boundary = value => {
    const normalized = value.trim().toLowerCase();
    if (["-inf", "-infinity", "-∞"].includes(normalized)) return -Infinity;
    if (["inf", "+inf", "infinity", "+infinity", "∞", "+∞"].includes(normalized)) return Infinity;
    return numericValue(value);
  };
  const lower = boundary(match[2]), upper = boundary(match[3]);
  if (lower === null || upper === null || lower > upper) return null;
  return { lower, upper, leftClosed: match[1] === "[", rightClosed: match[4] === "]" };
}

function checkInterval(raw, answer, tolerance) {
  const actual = parseInterval(raw);
  if (!actual) return { valid: false, correct: false, message: "Bitte gib ein Intervall wie [−1; 2) ein." };
  const expected = {
    lower: typeof answer.lower === "number" ? answer.lower : numericValue(answer.lower),
    upper: typeof answer.upper === "number" ? answer.upper : numericValue(answer.upper),
    leftClosed: Boolean(answer.leftClosed),
    rightClosed: Boolean(answer.rightClosed)
  };
  const sameBoundary = (left, right) => left === right || (Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) <= tolerance * Math.max(1, Math.abs(left), Math.abs(right)));
  return {
    valid: true,
    correct: sameBoundary(actual.lower, expected.lower)
      && sameBoundary(actual.upper, expected.upper)
      && actual.leftClosed === expected.leftClosed
      && actual.rightClosed === expected.rightClosed
  };
}

function checkAngle(raw, answer, tolerance) {
  const actual = numericValue(raw);
  const expected = numericValue(answer.value);
  if (actual === null) return { valid: false, correct: false, message: "Bitte gib den Winkel exakt, zum Beispiel als π/3, ein." };
  const period = answer.period ? numericValue(answer.period) : 2 * Math.PI;
  if (expected === null || period === null || !period) return { valid: false, correct: false, message: "Der Zielwinkel ist ungültig." };
  const distance = Math.abs(((actual - expected + period / 2) % period + period) % period - period / 2);
  return { valid: true, correct: distance <= tolerance * Math.max(1, Math.abs(period)) };
}

export function checkTaskAnswer(task, raw) {
  const answer = task.answer;
  const tolerance = answer.tolerance ?? 1e-8;
  const expressionOptions = {
    ...answer,
    allowedVariables: answer.allowedVariables || task.inputSpec?.allowedVariables,
    tolerance
  };
  let result;

  if (answer.type === "number") {
    if (!String(raw ?? "").trim()) return { valid: false, correct: false, message: "Bitte gib zuerst eine Antwort ein." };
    result = sameNumber(raw, answer.value, tolerance);
  } else if (answer.type === "expression") {
    result = sameExpression(raw, answer.value, expressionOptions);
  } else if (answer.type === "fields") {
    result = checkFields(raw, answer.values, tolerance);
  } else if (answer.type === "matrix") {
    result = checkMatrix(raw, answer.values, tolerance);
  } else if (answer.type === "set") {
    result = checkSet(raw, answer.values, tolerance, expressionOptions);
  } else if (answer.type === "proportional") {
    result = checkProportional(raw, answer.values, tolerance);
  } else if (answer.type === "complex") {
    result = checkComplex(raw, answer, tolerance);
  } else if (answer.type === "angle") {
    result = checkAngle(raw, answer, tolerance);
  } else if (answer.type === "interval") {
    result = checkInterval(raw, answer, tolerance);
  } else if (answer.type === "choice" || answer.type === "boolean") {
    if (!String(raw ?? "").trim()) return { valid: false, correct: false, message: "Bitte wähle eine Antwort aus." };
    result = { valid: true, correct: String(raw) === String(answer.value) };
  } else {
    return { valid: false, correct: false, message: "Unbekannte Antwortart." };
  }

  return result.valid
    ? { ...result, message: result.message || (result.correct ? "Richtig." : "Noch nicht richtig.") }
    : result;
}

export function canonicalRaw(task) {
  const answer = task.answer;
  if (["number", "choice", "boolean", "expression", "angle"].includes(answer.type)) return String(answer.value);
  if (answer.type === "complex") return answer.expression || `${answer.re}+(${answer.im})*i`;
  if (answer.type === "set") return answer.values.map(value => typeof value === "object" ? value.expression : value).join("; ");
  if (answer.type === "interval") return `${answer.leftClosed ? "[" : "("}${answer.lower}; ${answer.upper}${answer.rightClosed ? "]" : ")"}`;
  if (answer.type === "matrix") return answer.values.map(row => row.map(String));
  return Object.fromEntries(Object.entries(answer.values).map(([key, value]) => [key, String(value)]));
}

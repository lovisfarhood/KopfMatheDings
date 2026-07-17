const EPSILON = 1e-9;

const FUNCTION_NAMES = new Set(["sqrt", "sin", "cos", "tan", "ln", "log", "abs", "exp"]);
const CONSTANT_NAMES = new Set(["pi", "e", "i"]);

export function normalizeExpression(value) {
  return String(value ?? "")
    .trim()
    .replace(/[−–—]/g, "-")
    .replace(/[×·⋅]/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, "pi")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/√\s*\(/g, "sqrt(")
    .replace(/√\s*([\p{L}\d.]+)/gu, "sqrt($1)");
}

function isLetter(char) {
  return /[\p{L}_]/u.test(char || "");
}

function isLetterOrDigit(char) {
  return /[\p{L}\d_]/u.test(char || "");
}

function tokenize(source) {
  const input = normalizeExpression(source);
  const tokens = [];
  let index = 0;

  while (index < input.length) {
    const char = input[index];
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (/\d/.test(char) || ((char === "." || char === ",") && /\d/.test(input[index + 1] || ""))) {
      const start = index;
      let seenSeparator = false;
      while (index < input.length) {
        const current = input[index];
        if (/\d/.test(current)) {
          index += 1;
          continue;
        }
        if ((current === "." || current === ",") && !seenSeparator) {
          seenSeparator = true;
          index += 1;
          continue;
        }
        break;
      }
      if ((input[index] === "e" || input[index] === "E") && /[+\-\d]/.test(input[index + 1] || "")) {
        const exponentStart = index;
        index += 1;
        if (input[index] === "+" || input[index] === "-") index += 1;
        const digitsStart = index;
        while (/\d/.test(input[index] || "")) index += 1;
        if (digitsStart === index) index = exponentStart;
      }
      const raw = input.slice(start, index).replace(",", ".");
      const value = Number(raw);
      if (!Number.isFinite(value)) throw new SyntaxError("Diese Zahl ist nicht gültig.");
      tokens.push({ type: "number", value, raw });
      continue;
    }

    if (isLetter(char)) {
      const start = index;
      index += 1;
      while (isLetterOrDigit(input[index])) index += 1;
      const value = input.slice(start, index).toLowerCase();
      tokens.push({ type: "id", value });
      continue;
    }

    if ("+-*/^()[]{}=|;,".includes(char)) {
      tokens.push({ type: char, value: char });
      index += 1;
      continue;
    }

    throw new SyntaxError(`Das Zeichen „${char}“ wird nicht erkannt.`);
  }

  tokens.push({ type: "eof", value: "" });
  return tokens;
}

function binary(op, left, right, implicit = false) {
  return { type: op === "=" ? "equation" : "binary", op, left, right, implicit };
}

class Parser {
  constructor(source) {
    this.tokens = tokenize(source);
    this.index = 0;
  }

  current() {
    return this.tokens[this.index];
  }

  consume(type) {
    if (this.current().type !== type) return null;
    const token = this.current();
    this.index += 1;
    return token;
  }

  expect(type, message) {
    const token = this.consume(type);
    if (!token) throw new SyntaxError(message);
    return token;
  }

  parse() {
    if (this.current().type === "eof") throw new SyntaxError("Die Eingabe ist noch leer.");
    const result = this.parseEquation();
    if (this.current().type !== "eof") {
      if ([")", "]", "}"].includes(this.current().type)) throw new SyntaxError("Eine öffnende Klammer fehlt.");
      throw new SyntaxError(`Vor „${this.current().value}“ fehlt ein Rechenzeichen.`);
    }
    return result;
  }

  parseEquation() {
    const left = this.parseAdditive();
    if (!this.consume("=")) return left;
    const right = this.parseAdditive();
    if (this.current().type === "=") throw new SyntaxError("Bitte gib nur eine Gleichung ein.");
    return binary("=", left, right);
  }

  parseAdditive() {
    let node = this.parseMultiplicative();
    while (this.current().type === "+" || this.current().type === "-") {
      const op = this.current().type;
      this.index += 1;
      node = binary(op, node, this.parseMultiplicative());
    }
    return node;
  }

  startsPrimary(token = this.current()) {
    return token.type === "number" || token.type === "id" || ["(", "[", "{", "|"].includes(token.type);
  }

  parseMultiplicative() {
    let node = this.parseUnary();
    while (true) {
      if (this.current().type === "*" || this.current().type === "/") {
        const op = this.current().type;
        this.index += 1;
        node = binary(op, node, this.parseUnary());
        continue;
      }
      if (this.startsPrimary()) {
        node = binary("*", node, this.parseUnary(), true);
        continue;
      }
      break;
    }
    return node;
  }

  parseUnary() {
    if (this.current().type === "+" || this.current().type === "-") {
      const op = this.current().type;
      this.index += 1;
      return { type: "unary", op, value: this.parseUnary() };
    }
    return this.parsePower();
  }

  parsePower() {
    let node = this.parsePrimary();
    if (this.consume("^")) node = binary("^", node, this.parseUnary());
    return node;
  }

  parsePrimary() {
    const number = this.consume("number");
    if (number) return { type: "number", value: number.value, raw: number.raw };

    const identifier = this.consume("id");
    if (identifier) {
      if (FUNCTION_NAMES.has(identifier.value) && this.current().type === "(") {
        this.index += 1;
        const argument = this.parseEquation();
        this.expect(")", `Bei ${identifier.value} fehlt die schließende Klammer.`);
        return { type: "call", name: identifier.value, argument };
      }
      return { type: "identifier", name: identifier.value };
    }

    const pairs = { "(": ")", "[": "]", "{": "}" };
    if (pairs[this.current().type]) {
      const open = this.current().type;
      this.index += 1;
      const value = this.parseEquation();
      this.expect(pairs[open], `Zur Klammer „${open}“ fehlt der Abschluss.`);
      return { type: "group", open, value };
    }

    if (this.consume("|")) {
      const value = this.parseEquation();
      this.expect("|", "Zum Betrag fehlt der zweite Strich.");
      return { type: "call", name: "abs", argument: value };
    }

    if (this.current().type === "eof") throw new SyntaxError("Der Ausdruck ist noch nicht vollständig.");
    throw new SyntaxError(`Bei „${this.current().value}“ fehlt eine Zahl, Variable oder Klammer.`);
  }
}

export function parseExpression(source) {
  return new Parser(source).parse();
}

const complex = (re, im = 0) => ({ re: Number(re), im: Number(im) });
const add = (a, b) => complex(a.re + b.re, a.im + b.im);
const sub = (a, b) => complex(a.re - b.re, a.im - b.im);
const mul = (a, b) => complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const div = (a, b) => {
  const denominator = b.re * b.re + b.im * b.im;
  if (denominator < Number.EPSILON) throw new RangeError("Division durch null.");
  return complex((a.re * b.re + a.im * b.im) / denominator, (a.im * b.re - a.re * b.im) / denominator);
};
const magnitude = value => Math.hypot(value.re, value.im);
const expComplex = value => {
  const factor = Math.exp(value.re);
  return complex(factor * Math.cos(value.im), factor * Math.sin(value.im));
};
const logComplex = value => complex(Math.log(magnitude(value)), Math.atan2(value.im, value.re));
const pow = (base, exponent) => {
  if (Math.abs(exponent.im) < EPSILON && Number.isInteger(exponent.re) && Math.abs(exponent.re) <= 32) {
    if (exponent.re === 0) return complex(1);
    let result = complex(1);
    for (let count = 0; count < Math.abs(exponent.re); count += 1) result = mul(result, base);
    return exponent.re < 0 ? div(complex(1), result) : result;
  }
  if (magnitude(base) < EPSILON) {
    if (exponent.re > 0 && Math.abs(exponent.im) < EPSILON) return complex(0);
    throw new RangeError("Diese Potenz ist nicht definiert.");
  }
  return expComplex(mul(exponent, logComplex(base)));
};

function evaluateCall(name, argument) {
  if (name === "abs") return complex(magnitude(argument));
  if (name === "exp") return expComplex(argument);
  if (name === "ln" || name === "log") return logComplex(argument);
  if (name === "sqrt") return pow(argument, complex(0.5));
  if (name === "sin") {
    return complex(Math.sin(argument.re) * Math.cosh(argument.im), Math.cos(argument.re) * Math.sinh(argument.im));
  }
  if (name === "cos") {
    return complex(Math.cos(argument.re) * Math.cosh(argument.im), -Math.sin(argument.re) * Math.sinh(argument.im));
  }
  if (name === "tan") return div(evaluateCall("sin", argument), evaluateCall("cos", argument));
  throw new SyntaxError(`Die Funktion ${name} wird nicht unterstützt.`);
}

export function evaluateExpression(ast, variables = {}) {
  if (ast.type === "number") return complex(ast.value);
  if (ast.type === "identifier") {
    if (ast.name === "pi") return complex(Math.PI);
    if (ast.name === "e") return complex(Math.E);
    if (ast.name === "i") return complex(0, 1);
    if (!(ast.name in variables)) throw new ReferenceError(`Für ${ast.name} fehlt ein Wert.`);
    const value = variables[ast.name];
    return typeof value === "number" ? complex(value) : complex(value.re, value.im);
  }
  if (ast.type === "group") return evaluateExpression(ast.value, variables);
  if (ast.type === "unary") {
    const value = evaluateExpression(ast.value, variables);
    return ast.op === "-" ? complex(-value.re, -value.im) : value;
  }
  if (ast.type === "call") return evaluateCall(ast.name, evaluateExpression(ast.argument, variables));
  if (ast.type === "equation") return sub(evaluateExpression(ast.left, variables), evaluateExpression(ast.right, variables));
  if (ast.type === "binary") {
    const left = evaluateExpression(ast.left, variables);
    const right = evaluateExpression(ast.right, variables);
    if (ast.op === "+") return add(left, right);
    if (ast.op === "-") return sub(left, right);
    if (ast.op === "*") return mul(left, right);
    if (ast.op === "/") return div(left, right);
    if (ast.op === "^") return pow(left, right);
  }
  throw new TypeError("Unbekannter Ausdruck.");
}

export function variablesIn(ast, target = new Set()) {
  if (ast.type === "identifier" && !CONSTANT_NAMES.has(ast.name)) target.add(ast.name);
  if (ast.value && typeof ast.value === "object") variablesIn(ast.value, target);
  if (ast.argument) variablesIn(ast.argument, target);
  if (ast.left) variablesIn(ast.left, target);
  if (ast.right) variablesIn(ast.right, target);
  return target;
}

function closeEnough(left, right, tolerance = 1e-8) {
  if (![left.re, left.im, right.re, right.im].every(Number.isFinite)) return false;
  const delta = Math.hypot(left.re - right.re, left.im - right.im);
  const scale = Math.max(1, magnitude(left), magnitude(right));
  return delta <= tolerance * scale;
}

export function equivalentExpressions(actualSource, expectedSource, options = {}) {
  const actual = parseExpression(actualSource);
  const expected = parseExpression(expectedSource);
  const names = [...new Set([...variablesIn(actual), ...variablesIn(expected)])].sort();
  const tolerance = options.tolerance ?? 1e-8;

  if (!names.length) {
    return closeEnough(evaluateExpression(actual), evaluateExpression(expected), tolerance);
  }

  const samples = [-3.25, -2, -1.1, -0.35, 0.4, 0.9, 1.75, 2.6, 4.2];
  let validSamples = 0;
  for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
    const variables = Object.fromEntries(names.map((name, nameIndex) => [name, samples[(sampleIndex + nameIndex * 2) % samples.length] + nameIndex * 0.173]));
    try {
      const left = evaluateExpression(actual, variables);
      const right = evaluateExpression(expected, variables);
      if (![left.re, left.im, right.re, right.im].every(Number.isFinite)) continue;
      validSamples += 1;
      if (!closeEnough(left, right, tolerance)) return false;
    } catch {
      // Poles and real-domain gaps are skipped; several independent valid points are required below.
    }
  }
  return validSamples >= 4;
}

export function evaluateConstant(source) {
  const ast = parseExpression(source);
  if (variablesIn(ast).size) throw new ReferenceError("Die Antwort muss eine konkrete Zahl sein.");
  return evaluateExpression(ast);
}

export function splitTopLevel(source) {
  const normalized = normalizeExpression(source);
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    if ("([{\{".includes(char)) depth += 1;
    if (")]\}".includes(char)) depth -= 1;
    if (char === ";" && depth === 0) {
      parts.push(normalized.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(normalized.slice(start).trim());
  return parts.filter(Boolean);
}

const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[char]);

const PRECEDENCE = { equation: 0, "+": 1, "-": 1, "*": 2, "/": 2, "^": 4, unary: 3, atom: 5 };

function renderNode(node, parentPrecedence = -1) {
  if (node.type === "number") return escapeHtml(node.raw);
  if (node.type === "identifier") return node.name === "pi" ? "π" : escapeHtml(node.name);
  if (node.type === "group") {
    const pair = node.open === "[" ? ["[", "]"] : node.open === "{" ? ["{", "}"] : ["(", ")"];
    return `<span class="expr-group">${pair[0]}${renderNode(node.value)}${pair[1]}</span>`;
  }
  if (node.type === "unary") {
    const html = `${node.op === "-" ? "−" : "+"}${renderNode(node.value, PRECEDENCE.unary)}`;
    return parentPrecedence > PRECEDENCE.unary ? `(${html})` : html;
  }
  if (node.type === "call") {
    const inner = renderNode(node.argument);
    if (node.name === "sqrt") return `<span class="expr-root"><span class="root-sign">√</span><span class="radicand">${inner}</span></span>`;
    if (node.name === "abs") return `<span class="expr-abs">|${inner}|</span>`;
    const label = node.name === "log" ? "log" : node.name;
    return `<span class="expr-function">${label}</span><span class="expr-group">(${inner})</span>`;
  }
  if (node.type === "equation") return `${renderNode(node.left, 0)} = ${renderNode(node.right, 0)}`;
  if (node.type === "binary") {
    if (node.op === "/") {
      return `<span class="expr-fraction"><span class="numerator">${renderNode(node.left)}</span><span class="denominator">${renderNode(node.right)}</span></span>`;
    }
    if (node.op === "^") {
      const html = `${renderNode(node.left, PRECEDENCE["^"])}<sup>${renderNode(node.right)}</sup>`;
      return parentPrecedence > PRECEDENCE["^"] ? `(${html})` : html;
    }
    const precedence = PRECEDENCE[node.op];
    const operator = node.op === "-" ? " − " : node.op === "+" ? " + " : node.implicit ? "" : " · ";
    const html = `${renderNode(node.left, precedence)}${operator}${renderNode(node.right, precedence + (node.op === "-" ? 1 : 0))}`;
    return parentPrecedence > precedence ? `(${html})` : html;
  }
  return "";
}

export function formatExpression(source) {
  const parts = splitTopLevel(source);
  if (!parts.length) return { ok: false, html: "", text: "", error: "Noch keine Eingabe." };
  try {
    const asts = parts.map(parseExpression);
    return {
      ok: true,
      html: asts.map(ast => renderNode(ast)).join(" <span class=\"expr-separator\">;</span> "),
      text: normalizeExpression(source),
      ast: asts.length === 1 ? asts[0] : asts
    };
  } catch (error) {
    return {
      ok: false,
      html: escapeHtml(normalizeExpression(source).replace(/\*/g, "·").replace(/-/g, "−")),
      text: normalizeExpression(source),
      error: error instanceof Error ? error.message : "Der Ausdruck ist noch nicht vollständig."
    };
  }
}

export function complexClose(actual, expected, tolerance = 1e-8) {
  return closeEnough(actual, expected, tolerance);
}

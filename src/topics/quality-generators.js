import { nz } from "../core/random.js";
import { context, frac, math, matrix, vector } from "../core/display.js";
import {
  choiceInput,
  choices,
  expressionInput,
  fieldsInput,
  generator,
  makeTask,
  matrixInput,
  numberInput,
  rat,
  setInput,
  structuredInput,
  vectorInput
} from "./helpers.js";

const T = (topic, id, title, generate, metadata = {}) => generator(`${topic}.${id}`, topic, title, generate, {
  examRelevance: 3,
  cognitiveDemand: 3,
  weight: 1.35,
  ...metadata
});
const signed = value => value < 0 ? `− ${Math.abs(value)}` : `+ ${value}`;
const complexText = (re, im) => `${re}${signed(im)}i`;

const complex = [
  T("complex", "division-general", "Komplexe Division", (rng, difficulty) => {
    const c = nz(rng, -4, 4), d = nz(rng, -4, 4), re = rng.int(-4, 4), im = nz(rng, -4, 4);
    const a = re * c - im * d, b = re * d + im * c;
    return makeTask({
      topic: "complex", id: "complex.division-general", title: "Komplexe Division", difficulty,
      prompt: context("Rationalisiere mit dem Konjugierten und gib das Ergebnis in kartesischer Form an.") + math(`${frac(complexText(a, b), complexText(c, d))}`),
      input: expressionInput("a + bi"), answer: { type: "complex", re, im, equivalenceMode: "cartesian-complex" },
      explanation: `Mit ${c}${signed(-d)}i erweitern. Der Nenner wird ${c * c + d * d}; nach dem Zusammenfassen folgt <strong>${complexText(re, im)}</strong>.`,
      hints: ["Erweitere Zähler und Nenner mit dem konjugierten Nenner.", `Der neue Nenner ist ${c * c + d * d}.`, `Sammle Real- und Imaginärteil getrennt.`],
      complexity: 7, signature: `${a}:${b}:${c}:${d}`,
      reference: { kind: "complex-division", numerator: [a, b], denominator: [c, d], quotient: [re, im] }
    });
  }, { levels: ["standard"], requiredSymbols: ["i", "fraction", "minus"] }),
  T("complex", "polar", "Kartesisch zu Polar", (rng, difficulty) => {
    const item = rng.pick([
      { re: "1", im: "sqrt(3)", r: "2", phi: "pi/3" },
      { re: "sqrt(2)", im: "sqrt(2)", r: "2", phi: "pi/4" },
      { re: "-1", im: "sqrt(3)", r: "2", phi: "2*pi/3" },
      { re: "-sqrt(3)", im: "-1", r: "2", phi: "7*pi/6" },
      { re: "sqrt(3)", im: "1", r: "2", phi: "pi/6" },
      { re: "-sqrt(2)", im: "sqrt(2)", r: "2", phi: "3*pi/4" },
      { re: "1", im: "-sqrt(3)", r: "2", phi: "5*pi/3" },
      { re: "-sqrt(2)", im: "-sqrt(2)", r: "2", phi: "5*pi/4" }
    ]);
    const scale = rng.int(1, 4);
    const re = scale === 1 ? item.re : `${scale}*(${item.re})`;
    const im = scale === 1 ? item.im : `${scale}*(${item.im})`;
    const radius = String(scale * Number(item.r));
    return makeTask({
      topic: "complex", id: "complex.polar", title: "Kartesisch zu Polar", difficulty,
      prompt: context("Bestimme Betrag r und ein Argument φ im Intervall [0, 2π).") + math(`z=${re}+(${im})i`),
      input: structuredInput([{ key: "r", label: "r" }, { key: "phi", label: "φ" }], ["r = ", { slot: "r" }, ",  φ = ", { slot: "phi" }]),
      answer: { type: "fields", values: { r: radius, phi: item.phi } },
      explanation: `r=√(a²+b²)=${radius}; der Quadrant liefert <strong>φ=${item.phi.replaceAll("pi", "π")}</strong>.`,
      hints: ["Berechne zuerst √(a²+b²).", "Bestimme danach den Quadranten, nicht nur arctan(b/a).", `Der Betrag ist ${radius}.`],
      complexity: 7, signature: `${item.re}:${item.im}:${scale}`
    });
  }, { levels: ["standard"], requiredSymbols: ["i", "pi", "sqrt"] }),
  T("complex", "demoivre", "de Moivre", (rng, difficulty) => {
    const item = rng.pick([
      { z: "1/2+sqrt(3)/2*i", n: 2, value: "-1/2+sqrt(3)/2*i" },
      { z: "sqrt(2)/2+sqrt(2)/2*i", n: 2, value: "i" },
      { z: "-1/2+sqrt(3)/2*i", n: 3, value: "1" },
      { z: "sqrt(3)/2-1/2*i", n: 2, value: "1/2-sqrt(3)/2*i" }
    ]);
    const radius = rng.int(1, 3);
    const z = radius === 1 ? item.z : `${radius}*(${item.z})`;
    const factor = radius ** item.n;
    const value = factor === 1 ? item.value : `${factor}*(${item.value})`;
    return makeTask({
      topic: "complex", id: "complex.demoivre", title: "de Moivre", difficulty,
      prompt: context("Nutze Polarform und de Moivre.") + math(`(${z.replaceAll("sqrt", "√")})<sup>${item.n}</sup>`),
      input: expressionInput("Komplexe Zahl"), answer: { type: "complex", expression: value, equivalenceMode: "cartesian-complex" },
      explanation: `Argument mit ${item.n} multiplizieren, Betrag potenzieren. Ergebnis: <strong>${value}</strong>.`,
      hints: ["Lies Betrag und Argument der Basis ab.", `Multipliziere das Argument mit ${item.n}.`, "Wandle erst am Ende zurück in kartesische Form."],
      complexity: 8, signature: `${item.z}:${item.n}:${radius}`
    });
  }, { levels: ["plus"], requiredSymbols: ["i", "pi", "power", "sqrt"] }),
  T("complex", "roots", "Komplexe Wurzeln", (rng, difficulty) => {
    const root = rng.int(1, 12);
    const value = root ** 3;
    return makeTask({
      topic: "complex", id: "complex.roots", title: "Komplexe Wurzeln", difficulty,
      prompt: context("Bestimme alle drei Lösungen über Betrag und Argument.") + math(`z³ = ${value}`),
      input: setInput("z₁; z₂; z₃"), answer: { type: "set", values: [String(root), `${root}*(-1/2+sqrt(3)/2*i)`, `${root}*(-1/2-sqrt(3)/2*i)`] },
      explanation: `Die Argumente sind 0, 2π/3 und 4π/3; der Wurzelbetrag ist ${root}.`,
      hints: ["Schreibe die rechte Seite mit Argument 0 modulo 2π.", "Teile die drei möglichen Argumente durch 3.", "Die Lösungen liegen als gleichseitiges Dreieck auf dem Kreis."],
      complexity: 9, signature: `${root}:${rng.int(0, 99999)}`,
      reference: { kind: "complex-roots", power: 3, target: value, root }
    });
  }, { levels: ["transfer"] })
];

const derivatives = [
  T("derivatives", "quotient", "Quotientenregel", (rng, difficulty) => {
    const a = nz(rng, -4, 4), b = rng.int(-4, 4), c = nz(rng, -3, 3), x = rng.int(-2, 2);
    let d = nz(rng, -5, 5);
    if (c * x + d === 0) d += d > 0 ? 1 : -1;
    const numerator = a * (c * x + d) - c * (a * x + b);
    const denominator = (c * x + d) ** 2;
    return makeTask({
      topic: "derivatives", id: "derivatives.quotient", title: "Quotientenregel", difficulty,
      prompt: context(`f(x)=(${a}x${signed(b)})/(${c}x${signed(d)})`) + math(`f′(${x})=?`),
      input: numberInput("f′(x)"), answer: { type: "number", value: rat(numerator, denominator) },
      explanation: `(u/v)′=(u′v−uv′)/v². Eingesetzt ergibt das <strong>${rat(numerator, denominator)}</strong>.`,
      hints: ["Setze u=ax+b und v=cx+d.", "Im Zähler steht u′v−uv′; das Minus ist entscheidend.", `Der Nenner ist (${c * x + d})².`],
      complexity: 7, signature: `${a}:${b}:${c}:${d}:${x}`,
      reference: { kind: "derivative-quotient", coefficients: [a, b, c, d], x }
    });
  }, { levels: ["standard"] }),
  T("derivatives", "mixed-expression", "Produkt- und Kettenregel", (rng, difficulty) => {
    const a = nz(rng, 1, 4), b = rng.int(-3, 3), c = nz(rng, -3, 3);
    const expected = `${a}*cos(${a}*x+(${b}))*exp(${c}*x)+${c}*sin(${a}*x+(${b}))*exp(${c}*x)`;
    return makeTask({
      topic: "derivatives", id: "derivatives.mixed-expression", title: "Produkt- und Kettenregel", difficulty,
      prompt: context("Bestimme die vollständige Ableitung.") + math(`f(x)=sin(${a}x${signed(b)})·e<sup>${c}x</sup>`),
      input: expressionInput("f′(x)"), answer: { type: "expression", value: expected },
      explanation: `Produktregel mit Kettenfaktoren ${a} und ${c}: <strong>${expected}</strong>.`,
      hints: ["Die äußere Struktur ist ein Produkt.", "Beide Faktoren benötigen beim Ableiten einen Kettenfaktor.", `Die Ableitung von sin(${a}x${signed(b)}) beginnt mit ${a}cos(…).`],
      complexity: 8, signature: `${a}:${b}:${c}`,
      reference: { kind: "derivative-mixed", a, b, c, expression: `sin(${a}*x+(${b}))*exp(${c}*x)` }
    });
  }, { levels: ["plus"], requiredSymbols: ["sin", "cos", "e", "power"] }),
  T("derivatives", "chain-error", "Fehleranalyse Kettenregel", (rng, difficulty) => {
    const a = rng.int(2, 6), n = rng.int(2, 5), correct = `${n * a}(${a}x−1)^${n - 1}`;
    const options = choices(rng, correct, [`${n}(${a}x−1)^${n - 1}`, `${n * a}(${a}x−1)^${n}`, `${a}(${a}x−1)^${n - 1}`]);
    return makeTask({
      topic: "derivatives", id: "derivatives.chain-error", title: "Fehleranalyse Kettenregel", difficulty,
      prompt: context("Welche Ableitung ist korrekt? Die Distraktoren entsprechen typischen Fehlern.") + math(`f(x)=(${a}x−1)<sup>${n}</sup>`),
      input: choiceInput(options), answer: { type: "choice", value: correct },
      explanation: `Äußere Ableitung mal innere Ableitung: <strong>${correct}</strong>.`,
      hints: ["Leite zuerst die äußere Potenz ab.", `Die innere Ableitung ist ${a}.`],
      complexity: 9, signature: `${a}:${n}:${rng.int(0, 99999)}`
    });
  }, { levels: ["transfer"] })
];

const integrals = [
  T("integrals", "substitution", "Substitution", (rng, difficulty) => {
    const a = rng.int(1, 3), b = rng.int(1, 3), n = rng.int(1, 3);
    const value = rat((a + b) ** (n + 1) - b ** (n + 1), n + 1);
    return makeTask({
      topic: "integrals", id: "integrals.substitution", title: "Substitution", difficulty,
      prompt: context("Erkenne die innere Ableitung und substituiere.") + math(`∫<sub>0</sub><sup>1</sup>${2 * a}x(${a}x²+${b})<sup>${n}</sup> dx`),
      input: numberInput("Integralwert"), answer: { type: "number", value },
      explanation: `u=${a}x²+${b}, du=${2 * a}x dx. Grenzen ${b} bis ${a + b}; Ergebnis <strong>${value}</strong>.`,
      hints: [`Wähle u=${a}x²+${b}.`, `Dann ist du=${2 * a}x dx bereits vollständig vorhanden.`, `Die neuen Grenzen sind ${b} und ${a + b}.`],
      complexity: 7, signature: `${a}:${b}:${n}`,
      reference: { kind: "integral-substitution", a, b, n, bounds: [0, 1] }
    });
  }, { levels: ["standard"] }),
  T("integrals", "parts-choice", "Partielle Integration", (rng, difficulty) => {
    const correct = "(x−1)e^x+C";
    const options = choices(rng, correct, ["xe^x+C", "(x+1)e^x+C", "x²e^x/2+C"]);
    return makeTask({
      topic: "integrals", id: "integrals.parts-choice", title: "Partielle Integration", difficulty,
      prompt: context("Wähle eine Stammfunktion. Die falschen Antworten sind typische Produktregel-Fehler.") + math("∫ x·e<sup>x</sup> dx"),
      input: choiceInput(options), answer: { type: "choice", value: correct },
      explanation: `Partielle Integration liefert xeˣ−eˣ=<strong>(x−1)eˣ+C</strong>.`,
      hints: ["Setze u=x und dv=eˣdx.", "Nutze ∫u dv=uv−∫v du."],
      complexity: 5, signature: String(rng.int(0, 99999))
    });
  }, { levels: ["standard"] }),
  T("integrals", "partial-fractions-setup", "Partialbruchansatz erkennen", (rng, difficulty) => {
    let p = rng.int(-6, 5), q = rng.int(-5, 6);
    if (p === q) q += 1;
    const correct = "A/(x-p)+B/(x-q)";
    const options = choices(rng, correct, ["A/(x-p)^2+B/(x-q)^2", "(A*x+B)/((x-p)*(x-q))", "A*x+B"]);
    return makeTask({
      topic: "integrals", id: "integrals.partial-fractions-setup", title: "Partialbruchansatz erkennen", difficulty,
      prompt: context("Wähle nur den passenden Ansatz; Koeffizienten werden noch nicht bestimmt.") + math(`${frac("1", `(x−(${p}))(x−(${q}))`)}`),
      input: choiceInput(options), answer: { type: "choice", value: correct },
      explanation: "Zwei verschiedene lineare Nennerfaktoren erhalten je einen konstanten Zähler.",
      hints: ["Zerlege nach den verschiedenen irreduziblen Nennerfaktoren.", "Jeder lineare Faktor benötigt hier einen konstanten Zähler."],
      complexity: 4, signature: `${p}:${q}:${rng.int(0, 99999)}`,
      reference: { kind: "partial-fractions-setup", poles: [p, q] }
    });
  }, { levels: ["basis"] }),
  T("integrals", "partial-fractions", "Partialbruchzerlegung", (rng, difficulty) => {
    let p = rng.int(-4, 3), q = rng.int(-3, 4);
    if (p === q) q += 1;
    const A = nz(rng, -4, 4), B = nz(rng, -4, 4);
    const linear = -(A * q + B * p), constantTerm = A + B;
    const finalExpression = `${A}/(x-(${p}))+${B}/(x-(${q}))`;
    const coefficientInput = structuredInput([{ key: "A", label: "A" }, { key: "B", label: "B" }], ["A = ", { slot: "A" }, ",  B = ", { slot: "B" }]);
    return makeTask({
      topic: "integrals", id: "integrals.partial-fractions", title: "Partialbruchzerlegung", difficulty,
      prompt: context("Bestimme A und B.") + math(`${frac(`${constantTerm}x${signed(linear)}`, `(x−(${p}))(x−(${q}))`)}=${frac("A", `x−(${p})`)}+${frac("B", `x−(${q})`)}`),
      input: coefficientInput, answer: { type: "fields", values: { A, B } },
      explanation: `Koeffizientenvergleich liefert <strong>A=${A}, B=${B}</strong>; damit ${finalExpression}.`,
      hints: ["Multipliziere zuerst mit dem Hauptnenner.", `Setze danach x=${p} und x=${q}.`, "Alternativ vergleiche den x- und den konstanten Koeffizienten."],
      steps: [
        { id: "ansatz", prompt: "Wähle den passenden Ansatz.", inputSpec: choiceInput([{ value: "linear", label: "A/(x−p)+B/(x−q)" }, { value: "double", label: "A/(x−p)²+B/(x−q)²" }, { value: "poly", label: "Ax+B" }]), answer: { type: "choice", value: "linear" }, explanation: "Zwei verschiedene lineare Faktoren benötigen je einen konstanten Zähler.", chipLabel: "Ansatz gewählt", chipValue: "A/(x-p)+B/(x-q)" },
        { id: "coefficients", prompt: "Bestimme die beiden Koeffizienten.", inputSpec: coefficientInput, answer: { type: "fields", values: { A, B } }, explanation: `A=${A}, B=${B}.`, chipLabel: `A=${A}, B=${B}`, chipValue: finalExpression },
        { id: "result", prompt: "Setze die Koeffizienten in die Partialbruchform ein.", inputSpec: expressionInput("Zerlegung"), answer: { type: "expression", value: finalExpression, equivalenceMode: "partial-fractions", allowedVariables: ["x"] }, explanation: `Die Zerlegung lautet ${finalExpression}.`, chipLabel: "Partialbrüche", chipValue: finalExpression }
      ],
      complexity: 8, signature: `${p}:${q}:${A}:${B}`,
      reference: { kind: "partial-fractions", p, q, A, B, numerator: [constantTerm, linear] }
    });
  }, { levels: ["standard"], taskModes: ["step", "head"], requiredSymbols: ["fraction", "variables"] })
];

const taylor = [
  T("taylor", "shifted-exp", "Taylor um x₀", (rng, difficulty) => {
    const center = rng.pick([-2, -1, 1, 2]), order = rng.pick([2, 3, 4]);
    const delta = `(x-(${center}))`;
    const factorial = value => Array.from({ length: value }, (_, index) => index + 1).reduce((product, item) => product * item, 1);
    const terms = Array.from({ length: order + 1 }, (_, degree) => degree === 0 ? "1" : degree === 1 ? delta : `${delta}^${degree}/${factorial(degree)}`);
    const expected = `exp(${center})*(${terms.join("+")})`;
    return makeTask({
      topic: "taylor", id: "taylor.shifted-exp", title: "Taylor um x₀", difficulty,
      prompt: context(`Entwickle eˣ um x₀=${center} bis Grad ${order}.`) + math(`T<sub>${order}</sub>(x)=?`),
      input: expressionInput("Taylorpolynom"), answer: { type: "expression", value: expected },
      explanation: `Alle Ableitungen sind eˣ; bei x₀=${center} entsteht <strong>${expected}</strong>.`,
      hints: ["Schreibe das Taylorpolynom in Potenzen von (x−x₀).", `Alle Ableitungswerte sind e^${center}.`, "Vergiss die Fakultäten 2! und 3! nicht."],
      steps: [
        { id: "values", prompt: "Welchen Wert haben f(x₀), f′(x₀) und f″(x₀)?", inputSpec: fieldsInput(["f0", "f1", "f2"], 3), answer: { type: "fields", values: { f0: `exp(${center})`, f1: `exp(${center})`, f2: `exp(${center})` } }, explanation: "eˣ bleibt bei jeder Ableitung gleich.", chipLabel: `f⁽ᵏ⁾(${center})=e^${center}`, chipValue: `exp(${center})` },
        { id: "assemble", prompt: "Setze die Werte mit den passenden Fakultäten zusammen.", inputSpec: expressionInput("Taylorpolynom"), answer: { type: "expression", value: expected }, explanation: expected, chipLabel: `T${order}`, chipValue: expected }
      ],
      complexity: 8, signature: `${center}:${order}`,
      reference: { kind: "taylor-exp", center, order }
    });
  }, { levels: ["plus"], taskModes: ["step", "head"], requiredSymbols: ["e", "power", "fraction"] }),
  T("taylor", "rational", "Rationale Taylorstruktur", (rng, difficulty) => {
    const a = rng.pick([2, 3, 4, 5, 6]), order = rng.pick([2, 3, 4]);
    const expected = Array.from({ length: order + 1 }, (_, n) => n ? `x^${n}/${a ** (n + 1)}` : `1/${a}`).join("+");
    return makeTask({
      topic: "taylor", id: "taylor.rational", title: "Rationale Taylorstruktur", difficulty,
      prompt: context(`Entwickle um 0 bis Grad ${order}.`) + math(`${frac("1", `${a}−x`)}`),
      input: expressionInput("Taylorpolynom"), answer: { type: "expression", value: expected },
      explanation: `1/(${a}−x)=1/${a}·1/(1−x/${a}); geometrische Reihe ergibt <strong>${expected}</strong>.`,
      hints: [`Klammere ${a} im Nenner aus.`, "Nutze 1/(1−u)=1+u+u²+…", `Setze u=x/${a}.`],
      complexity: 7, signature: `${a}:${order}`,
      reference: { kind: "taylor-rational", a, order }
    });
  }, { levels: ["transfer"] })
];

const matrices = [
  T("matrices", "det-structured-3", "Strategische 3×3-Determinante", (rng, difficulty) => {
    const a = nz(rng, -4, 4), b = nz(rng, -4, 4), c = nz(rng, -4, 4), k = nz(rng, -3, 3);
    const rows = [[a, rng.int(-4, 4), rng.int(-4, 4)], [k * a, b + k * 0, rng.int(-4, 4)], [0, 0, c]];
    rows[1][1] = b + k * rows[0][1];
    rows[1][2] = k * rows[0][2];
    const value = a * b * c;
    return makeTask({
      topic: "matrices", id: "matrices.det-structured-3", title: "Strategische 3×3-Determinante", difficulty,
      prompt: context(`Nutze zuerst R₂ ← R₂ − (${k})R₁.`) + math(`det ${matrix(rows)}`),
      input: numberInput("Determinante"), answer: { type: "number", value },
      explanation: `Die Zeilenoperation ändert die Determinante nicht und erzeugt eine Dreiecksmatrix mit Diagonale ${a}, ${b}, ${c}. Ergebnis <strong>${value}</strong>.`,
      hints: ["Die angegebene Zeilenaddition verändert die Determinante nicht.", "Danach ist die Matrix dreieckig.", "Multipliziere die drei Diagonaleinträge."],
      complexity: 8, signature: rows.flat().join(":"),
      reference: { kind: "determinant", matrix: rows, value }
    });
  }, { levels: ["transfer"] }),
  T("matrices", "row-operation", "Zeilenoperation", (rng, difficulty) => {
    const a = nz(rng, -4, 4), b = rng.int(-5, 5), k = nz(rng, -3, 3), c = rng.int(-5, 5), d = rng.int(-5, 5);
    const source = [[a, b], [k * a + c, k * b + d]], result = [[a, b], [c, d]];
    return makeTask({
      topic: "matrices", id: "matrices.row-operation", title: "Zeilenoperation", difficulty,
      prompt: context(`Führe R₂ ← R₂ − (${k})R₁ aus.`) + math(matrix(source)),
      input: matrixInput(2, 2), answer: { type: "matrix", values: result },
      explanation: `Die erste Zeile bleibt; die zweite wird komponentenweise berechnet: <strong>${matrix(result)}</strong>.`,
      hints: ["Verändere nur die zweite Zeile.", "Subtrahiere komponentenweise.", `Der erste neue Eintrag ist ${c}.`],
      complexity: 6, signature: source.flat().join(":"),
      reference: { kind: "row-operation", source, factor: k, result }
    });
  }, { levels: ["basis"] }),
  T("matrices", "eigenvalues", "Eigenwerte einer Dreiecksmatrix", (rng, difficulty) => {
    let first = rng.int(-5, 5), second = rng.int(-5, 5);
    if (first === second) second += 1;
    const off = nz(rng, -6, 6);
    return makeTask({
      topic: "matrices", id: "matrices.eigenvalues", title: "Eigenwerte einer Dreiecksmatrix", difficulty,
      prompt: context("Bestimme beide Eigenwerte; die Reihenfolge ist egal.") + math(matrix([[first, off], [0, second]])),
      input: setInput("λ₁; λ₂"), answer: { type: "set", values: [first, second] },
      explanation: `Bei einer Dreiecksmatrix stehen die Eigenwerte auf der Diagonale: <strong>${first}, ${second}</strong>.`,
      hints: ["Nutze die Dreiecksstruktur.", "Das charakteristische Polynom ist das Produkt der Diagonalterme von A−λI."],
      complexity: 5, signature: `${first}:${second}:${off}`,
      reference: { kind: "eigenvalues", matrix: [[first, off], [0, second]], values: [first, second] }
    });
  }, { levels: ["standard"] }),
  T("matrices", "eigenvector", "Eigenvektor", (rng, difficulty) => {
    const lambda = rng.int(-4, 4), other = lambda + nz(rng, 1, 4), orientation = rng.bool();
    const values = orientation ? { x: 1, y: 1 } : { x: 1, y: -1 };
    const matrixValue = orientation
      ? [[(lambda + other) / 2, (lambda - other) / 2], [(lambda - other) / 2, (lambda + other) / 2]]
      : [[(lambda + other) / 2, (other - lambda) / 2], [(other - lambda) / 2, (lambda + other) / 2]];
    if (matrixValue.flat().some(value => !Number.isInteger(value))) {
      matrixValue.forEach((row, i) => row.forEach((value, j) => { matrixValue[i][j] = 2 * value; }));
      return makeTask({
        topic: "matrices", id: "matrices.eigenvector", title: "Eigenvektor", difficulty,
        prompt: context(`Gib einen Eigenvektor ≠0 zum Eigenwert ${2 * lambda} an.`) + math(matrix(matrixValue)),
        input: vectorInput(), answer: { type: "proportional", values },
        explanation: `Lösen von (A−λI)v=0 ergibt den Spann von <strong>${vector([values.x, values.y])}</strong>; jedes von null verschiedene Vielfache gilt.`,
        complexity: 8, signature: `${matrixValue.flat()}:${2 * lambda}`,
        reference: { kind: "eigenvector", matrix: matrixValue, lambda: 2 * lambda, vector: [values.x, values.y] }
      });
    }
    return makeTask({
      topic: "matrices", id: "matrices.eigenvector", title: "Eigenvektor", difficulty,
      prompt: context(`Gib einen Eigenvektor ≠0 zum Eigenwert ${lambda} an.`) + math(matrix(matrixValue)),
      input: vectorInput(), answer: { type: "proportional", values },
      explanation: `Lösen von (A−λI)v=0 ergibt den Spann von <strong>${vector([values.x, values.y])}</strong>; jedes von null verschiedene Vielfache gilt.`,
      complexity: 8, signature: `${matrixValue.flat()}:${lambda}`,
      reference: { kind: "eigenvector", matrix: matrixValue, lambda, vector: [values.x, values.y] }
    });
  }, { levels: ["plus"] }),
  T("matrices", "inverse", "Inverse 2×2", (rng, difficulty) => {
    const a = nz(rng, -3, 3), b = rng.int(-3, 3), c = rng.int(-3, 3), d = nz(rng, -3, 3), det = a * d - b * c;
    if (!det) return qualityByTopic.matrices.find(item => item.id === "matrices.inverse").generate(rng, difficulty);
    const values = [[rat(d, det), rat(-b, det)], [rat(-c, det), rat(a, det)]];
    return makeTask({
      topic: "matrices", id: "matrices.inverse", title: "Inverse 2×2", difficulty,
      prompt: context("Bestimme A⁻¹ exakt.") + math(`A=${matrix([[a, b], [c, d]])}`),
      input: matrixInput(2, 2), answer: { type: "matrix", values },
      explanation: `A⁻¹=1/det(A)·[[d,−b],[−c,a]], det(A)=${det}. Ergebnis <strong>${matrix(values)}</strong>.`,
      hints: ["Berechne zuerst ad−bc.", "Vertausche a und d; negiere b und c.", "Teile jeden Eintrag durch die Determinante."],
      complexity: 8, signature: `${a}:${b}:${c}:${d}`,
      reference: { kind: "inverse", matrix: [[a, b], [c, d]], inverse: values }
    });
  }, { levels: ["plus"] })
];

const linearSystems = [
  T("linearSystems", "classification", "LGS klassifizieren", (rng, difficulty) => {
    const a = nz(rng, 1, 4), b = nz(rng, -4, 4), factor = rng.pick([2, 3]), right = rng.int(-6, 6), mode = rng.pick(["infinite", "none"]);
    const secondRight = mode === "infinite" ? factor * right : factor * right + nz(rng, 1, 3);
    const correct = mode === "infinite" ? "Unendlich viele Lösungen" : "Keine Lösung";
    const options = choices(rng, correct, ["Genau eine Lösung", mode === "infinite" ? "Keine Lösung" : "Unendlich viele Lösungen"]);
    return makeTask({
      topic: "linearSystems", id: "linearSystems.classification", title: "LGS klassifizieren", difficulty,
      prompt: context("Klassifiziere ohne vollständiges Ausrechnen.") + math(`${a}x${signed(b)}y=${right}<br>${factor * a}x${signed(factor * b)}y=${secondRight}`),
      input: choiceInput(options), answer: { type: "choice", value: correct },
      explanation: `Die linke Seite der zweiten Gleichung ist das ${factor}-Fache; die rechte Seite ${mode === "infinite" ? "ebenfalls" : "nicht"}. Daher: <strong>${correct}</strong>.`,
      hints: ["Vergleiche die beiden Koeffizientenzeilen als Vielfache.", "Prüfe danach, ob die rechte Seite denselben Faktor besitzt."],
      complexity: 9, signature: `${a}:${b}:${factor}:${right}:${secondRight}`
    });
  }, { levels: ["transfer"] }),
  T("linearSystems", "gauss-steps", "Gauß in Schritten", (rng, difficulty) => {
    const x = rng.int(-4, 4), y = rng.int(-4, 4), k = nz(rng, -3, 3), a = nz(rng, 1, 4), b = rng.int(-4, 4);
    const rhs1 = a * x + b * y, rhs2 = k * a * x + (k * b + 1) * y;
    const reduced = [[a, b, rhs1], [0, 1, y]];
    const finalInput = structuredInput([{ key: "x", label: "x" }, { key: "y", label: "y" }], ["(x, y) = (", { slot: "x" }, ", ", { slot: "y" }, ")"]);
    return makeTask({
      topic: "linearSystems", id: "linearSystems.gauss-steps", title: "Gauß in Schritten", difficulty,
      prompt: context("Löse das System mit einer sinnvollen Zeilenoperation.") + math(matrix([[a, b, rhs1], [k * a, k * b + 1, rhs2]])),
      input: finalInput, answer: { type: "fields", values: { x, y } },
      explanation: `R₂←R₂−(${k})R₁ ergibt ${matrix(reduced)}. Rückwärtseinsetzen: <strong>x=${x}, y=${y}</strong>.`,
      hints: [`Eliminiere den ersten Eintrag in Zeile 2 mit R₂−(${k})R₁.`, `Danach steht y=${y} direkt in der zweiten Zeile.`, "Setze y in die erste Zeile ein."],
      steps: [
        { id: "operation", prompt: "Welche Zeilenoperation eliminiert den ersten Eintrag unten?", inputSpec: choiceInput([{ value: "correct", label: `R₂ ← R₂ − (${k})R₁` }, { value: "plus", label: `R₂ ← R₂ + (${k})R₁` }, { value: "swap", label: "R₁ ↔ R₂" }]), answer: { type: "choice", value: "correct" }, explanation: `Der erste Eintrag wird ${k * a}−${k}·${a}=0.`, chipLabel: `R₂←R₂−(${k})R₁`, chipValue: `R2=R2-(${k})R1` },
        { id: "reduced", prompt: "Gib die neue erweiterte Matrix ein.", inputSpec: matrixInput(2, 3), answer: { type: "matrix", values: reduced }, explanation: `Die zweite Zeile lautet [0,1,${y}].`, chipLabel: "Zeilenstufe", chipValue: `y=${y}` },
        { id: "solution", prompt: "Bestimme nun die Lösung.", inputSpec: finalInput, answer: { type: "fields", values: { x, y } }, explanation: `x=${x}, y=${y}.`, chipLabel: `Lösung (${x},${y})`, chipValue: `(${x};${y})` }
      ],
      complexity: 9, signature: `${a}:${b}:${k}:${x}:${y}`,
      reference: { kind: "linear-system", matrix: [[a, b], [k * a, k * b + 1]], rhs: [rhs1, rhs2], solution: [x, y], reduced }
    });
  }, { levels: ["plus"], taskModes: ["step", "head"] })
];

const vectorSpaces = [
  T("vectorSpaces", "coordinates", "Basisdarstellung", (rng, difficulty) => {
    const p = rng.int(-4, 4), q = rng.int(-4, 4);
    const target = [p + q, p - q];
    const input = structuredInput([{ key: "a", label: "a" }, { key: "b", label: "b" }], ["v = ", { slot: "a" }, "·b₁ + ", { slot: "b" }, "·b₂"]);
    return makeTask({
      topic: "vectorSpaces", id: "vectorSpaces.coordinates", title: "Basisdarstellung", difficulty,
      prompt: context(`b₁=(1,1), b₂=(1,−1), v=(${target[0]},${target[1]}). Bestimme die Koordinaten.`) + math("v=a·b₁+b·b₂"),
      input, answer: { type: "fields", values: { a: p, b: q } },
      explanation: `a+b=${target[0]}, a−b=${target[1]}; damit <strong>a=${p}, b=${q}</strong>.`,
      hints: ["Vergleiche beide Komponenten.", `Es gilt a+b=${target[0]} und a−b=${target[1]}.`, "Addiere die beiden Gleichungen, um a zu bestimmen."],
      complexity: 7, signature: `${p}:${q}`
    });
  }, { levels: ["standard"] })
];

const orthogonality = [
  T("orthogonality", "angle", "Winkel zwischen Vektoren", (rng, difficulty) => {
    const item = rng.pick([
      { u: [1, 0], v: [1, 1], value: "pi/4" },
      { u: [1, 0], v: [0, 2], value: "pi/2" },
      { u: [1, 1], v: [1, -1], value: "pi/2" },
      { u: [1, 0], v: [-1, 1], value: "3*pi/4" }
    ]);
    const leftScale = rng.int(1, 4), rightScale = rng.int(1, 4);
    const u = item.u.map(value => value * leftScale);
    const v = item.v.map(value => value * rightScale);
    return makeTask({
      topic: "orthogonality", id: "orthogonality.angle", title: "Winkel zwischen Vektoren", difficulty,
      prompt: context("Bestimme den kleineren Winkel exakt.") + math(`u=${vector(u)}, v=${vector(v)}`),
      input: expressionInput("φ"), answer: { type: "angle", value: item.value, period: "2*pi" },
      explanation: `cos φ=(u·v)/(‖u‖‖v‖); daraus folgt <strong>φ=${item.value.replaceAll("pi", "π")}</strong>.`,
      hints: ["Berechne Skalarprodukt und beide Normen.", "Setze in cos φ=(u·v)/(‖u‖‖v‖) ein."],
      complexity: 7, signature: `${u}:${v}`
    });
  }, { levels: ["plus"] })
];

const decompositions = [
  T("decompositions", "lu-complete", "LU-Zerlegung", (rng, difficulty) => {
    const u11 = nz(rng, -4, 4), u12 = rng.int(-4, 4), l21 = nz(rng, -3, 3), u22 = nz(rng, -4, 4);
    const A = [[u11, u12], [l21 * u11, l21 * u12 + u22]];
    const input = structuredInput([{ key: "l21", label: "l₂₁" }, { key: "u22", label: "u₂₂" }], ["l₂₁ = ", { slot: "l21" }, ",  u₂₂ = ", { slot: "u22" }]);
    return makeTask({
      topic: "decompositions", id: "decompositions.lu-complete", title: "LU-Zerlegung", difficulty,
      prompt: context("Für A=LU mit Einsen auf der Diagonale von L: bestimme l₂₁ und u₂₂.") + math(matrix(A)),
      input, answer: { type: "fields", values: { l21, u22 } },
      explanation: `l₂₁=a₂₁/u₁₁=${l21}; u₂₂=a₂₂−l₂₁u₁₂=${u22}.`,
      hints: ["Die erste Zeile von U entspricht der ersten Zeile von A.", "Bestimme l₂₁ aus a₂₁=l₂₁u₁₁.", "Danach folgt u₂₂=a₂₂−l₂₁u₁₂."],
      steps: [
        { id: "factor", prompt: "Bestimme den Eliminationsfaktor l₂₁.", inputSpec: numberInput("l₂₁"), answer: { type: "number", value: l21 }, explanation: `l₂₁=${l21}.`, chipLabel: `l₂₁=${l21}`, chipValue: String(l21) },
        { id: "remainder", prompt: "Bestimme damit u₂₂.", inputSpec: numberInput("u₂₂"), answer: { type: "number", value: u22 }, explanation: `u₂₂=${u22}.`, chipLabel: `u₂₂=${u22}`, chipValue: String(u22) },
        { id: "assemble", prompt: "Trage beide Werte zusammen ein.", inputSpec: input, answer: { type: "fields", values: { l21, u22 } }, explanation: `L=${matrix([[1, 0], [l21, 1]])}, U=${matrix([[u11, u12], [0, u22]])}.`, chipLabel: "LU vollständig", chipValue: `l21=${l21};u22=${u22}` }
      ],
      complexity: 8, signature: A.flat().join(":"),
      reference: { kind: "lu", matrix: A, lower: [[1, 0], [l21, 1]], upper: [[u11, u12], [0, u22]] }
    });
  }, { levels: ["plus"], taskModes: ["step", "head"] }),
  T("decompositions", "qr-first-vector", "QR: erster Q-Vektor", (rng, difficulty) => {
    const triple = rng.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17]]), signs = [rng.bool() ? 1 : -1, rng.bool() ? 1 : -1];
    const u = [triple[0] * signs[0], triple[1] * signs[1]], answer = { x: rat(u[0], triple[2]), y: rat(u[1], triple[2]) };
    return makeTask({
      topic: "decompositions", id: "decompositions.qr-first-vector", title: "QR: erster Q-Vektor", difficulty,
      prompt: context("Normiere die erste Spalte von A und gib q₁ an.") + math(matrix([[u[0], rng.int(-5, 5)], [u[1], rng.int(-5, 5)]])),
      input: vectorInput(), answer: { type: "fields", values: answer },
      explanation: `‖a₁‖=${triple[2]}, daher <strong>q₁=${vector([answer.x, answer.y])}</strong>.`,
      hints: ["q₁ ist die erste Spalte geteilt durch ihre Norm.", `Die Norm ist ${triple[2]}.`],
      complexity: 6, signature: `${u}:${rng.int(0, 99999)}`,
      reference: { kind: "qr-first-vector", column: u, norm: triple[2], vector: answer }
    });
  }, { levels: ["standard"] })
];

const algebra = [
  T("algebra", "factor-structure", "Faktorisierung", (rng, difficulty) => {
    let p = rng.int(-6, 6), q = rng.int(-6, 6);
    if (p === q) q += 1;
    const b = -(p + q), c = p * q;
    const input = structuredInput([{ key: "p", label: "p" }, { key: "q", label: "q" }], ["(x − ", { slot: "p" }, ")(x − ", { slot: "q" }, ")"]);
    return makeTask({
      topic: "algebra", id: "algebra.factor-structure", title: "Faktorisierung", difficulty,
      prompt: context("Faktorisiere in der vorgegebenen Form.") + math(`x²${signed(b)}x${signed(c)}=(x−p)(x−q)`),
      input, answer: { type: "fields", values: { p, q } },
      explanation: `p+q=${p + q} und pq=${c}; eine passende Faktorisierung ist <strong>(x−(${p}))(x−(${q}))</strong>.`,
      hints: [`Gesucht sind zwei Zahlen mit Produkt ${c}.`, `Ihre Summe muss ${p + q} sein.`],
      complexity: 6, signature: `${b}:${c}`
    });
  }, { levels: ["standard"] })
];

export const qualityByTopic = Object.freeze({
  algebra,
  complex,
  derivatives,
  integrals,
  taylor,
  matrices,
  linearSystems,
  vectorSpaces,
  orthogonality,
  decompositions
});

export const qualityGenerators = Object.freeze(Object.values(qualityByTopic).flat());

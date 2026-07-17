const LAYERS = Object.freeze({
  basis: [
    ["7", "7"], ["8", "8"], ["9", "9"], ["−", "minus"], ["÷", "divide"],
    ["4", "4"], ["5", "5"], ["6", "6"], ["+", "+"], ["×", "multiply"],
    ["1", "1"], ["2", "2"], ["3", "3"], ["( )", "parens"], ["x", "x"],
    ["0", "0"], [",", "decimal"], ["=", "="], [";", ";"], ["i", "i"]
  ],
  functions: [
    ["x", "x"], ["y", "y"], ["t", "t"], ["e", "e"], ["π", "pi"],
    ["sin", "sin"], ["cos", "cos"], ["tan", "tan"], ["ln", "ln"], ["log", "log"],
    ["x²", "square"], ["xⁿ", "power"], ["√", "sqrt"], ["|x|", "absolute"], ["i", "i"],
    ["+", "+"], ["−", "minus"], ["×", "multiply"], ["÷", "divide"], ["=", "="]
  ],
  structures: [
    ["a⁄b", "fraction"], ["xⁿ", "power"], ["√", "sqrt"], ["( )", "parens"], ["|x|", "absolute"],
    ["{ }", "set"], ["[ ]", "interval"], [",", ","], [";", ";"], ["=", "="],
    ["←", "left", "Cursor nach links"], ["→", "right", "Cursor nach rechts"], ["↑", "up", "Eine Matrixzeile nach oben"], ["↓", "down", "Eine Matrixzeile nach unten"], ["⌫", "backspace", "Rücktaste"],
    ["x", "x"], ["y", "y"], ["π", "pi"], ["i", "i"], ["Leeren", "clear", "Gesamte Eingabe löschen"]
  ]
});

const TAB_LABELS = Object.freeze({ basis: "Basis", functions: "Funktionen", structures: "Strukturen" });

export class MathKeyboard {
  constructor(root, options = {}) {
    this.root = root;
    this.options = options;
    this.controller = null;
    this.layer = "basis";
    this.render();
  }

  setController(controller) {
    this.controller = controller;
    this.root.classList.toggle("is-choice", controller?.spec?.type === "choice");
  }

  render() {
    this.root.replaceChildren();
    this.root.className = "math-keyboard";
    this.root.setAttribute("aria-label", "KopfMathe-Tastatur");

    const tabs = document.createElement("div");
    tabs.className = "keyboard-tabs";
    tabs.setAttribute("role", "tablist");
    for (const [key, label] of Object.entries(TAB_LABELS)) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "keyboard-tab";
      button.textContent = label;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(this.layer === key));
      button.addEventListener("click", () => {
        this.layer = key;
        this.render();
        this.setController(this.controller);
      });
      tabs.append(button);
    }

    const navigation = document.createElement("div");
    navigation.className = "keyboard-navigation";
    for (const [label, action, aria] of [["←", "left", "Cursor nach links"], ["→", "right", "Cursor nach rechts"], ["⌫", "backspace", "Rücktaste"]]) {
      navigation.append(this.makeKey(label, action, aria, "utility"));
    }
    const check = this.makeKey("Prüfen", "submit", "Antwort prüfen", "submit");
    navigation.append(check);

    const keys = document.createElement("div");
    keys.className = "keyboard-grid";
    keys.setAttribute("role", "tabpanel");
    for (const [label, action, aria] of LAYERS[this.layer]) keys.append(this.makeKey(label, action, aria));

    this.root.append(tabs, navigation, keys);
  }

  makeKey(label, action, aria = null, variant = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `math-key${variant ? ` is-${variant}` : ""}`;
    button.textContent = label;
    button.dataset.action = action;
    button.setAttribute("aria-label", aria || `${label} eingeben`);
    button.addEventListener("pointerdown", event => event.preventDefault());
    button.addEventListener("click", () => {
      if (action === "pi") this.controller?.applyKey("pi", "pi");
      else this.controller?.applyKey(action);
    });
    return button;
  }
}

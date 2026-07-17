const INSERTIONS = Object.freeze({
  minus: { text: "-", offset: 1 },
  multiply: { text: "*", offset: 1 },
  divide: { text: "/", offset: 1 },
  decimal: { text: ",", offset: 1 },
  parens: { text: "()", offset: 1 },
  fraction: { text: "()/()", offset: 1 },
  power: { text: "^()", offset: 2 },
  square: { text: "^2", offset: 2 },
  sqrt: { text: "sqrt()", offset: 5 },
  absolute: { text: "abs()", offset: 4 },
  set: { text: "{}", offset: 1 },
  interval: { text: "[]", offset: 1 },
  sin: { text: "sin()", offset: 4 },
  cos: { text: "cos()", offset: 4 },
  tan: { text: "tan()", offset: 4 },
  ln: { text: "ln()", offset: 3 },
  log: { text: "log()", offset: 4 }
});

const ALLOWED_HARDWARE = /^[0-9a-zA-ZäöüÄÖÜßπ+\-*/^=(),.;{}\[\]|]$/u;

export class MathEntryModel {
  constructor(keys = ["value"], options = {}) {
    if (!keys.length) throw new RangeError("Mindestens ein Eingabeplatz ist erforderlich.");
    this.columns = Math.max(1, Number(options.columns) || keys.length);
    this.slots = keys.map(key => ({ key, value: "", cursor: 0 }));
    this.activeIndex = 0;
  }

  get active() {
    return this.slots[this.activeIndex];
  }

  activate(index, cursor = null) {
    const next = Math.max(0, Math.min(this.slots.length - 1, Number(index) || 0));
    this.activeIndex = next;
    if (cursor !== null) this.active.cursor = Math.max(0, Math.min(this.active.value.length, Number(cursor) || 0));
    return this.active;
  }

  setValue(key, value) {
    const index = this.slots.findIndex(slot => slot.key === key);
    if (index < 0) return false;
    this.slots[index].value = String(value ?? "");
    this.slots[index].cursor = this.slots[index].value.length;
    return true;
  }

  insertText(text, offset = String(text).length) {
    const slot = this.active;
    const insertion = String(text);
    slot.value = `${slot.value.slice(0, slot.cursor)}${insertion}${slot.value.slice(slot.cursor)}`;
    slot.cursor += Math.max(0, Math.min(insertion.length, offset));
    return slot.value;
  }

  insertAction(action, literal = null) {
    if (literal !== null) return this.insertText(literal);
    const insertion = INSERTIONS[action];
    if (insertion) return this.insertText(insertion.text, insertion.offset);
    return this.insertText(action);
  }

  moveLeft() {
    if (this.active.cursor > 0) {
      this.active.cursor -= 1;
    } else if (this.activeIndex > 0) {
      this.activeIndex -= 1;
      this.active.cursor = this.active.value.length;
    }
    return this.active;
  }

  moveRight() {
    if (this.active.cursor < this.active.value.length) {
      this.active.cursor += 1;
    } else if (this.activeIndex < this.slots.length - 1) {
      this.activeIndex += 1;
      this.active.cursor = 0;
    }
    return this.active;
  }

  moveVertical(direction) {
    const target = this.activeIndex + this.columns * direction;
    if (target >= 0 && target < this.slots.length) {
      const cursor = this.active.cursor;
      this.activeIndex = target;
      this.active.cursor = Math.min(cursor, this.active.value.length);
    }
    return this.active;
  }

  nextSlot(direction = 1) {
    const target = this.activeIndex + direction;
    if (target >= 0 && target < this.slots.length) {
      this.activeIndex = target;
      this.active.cursor = direction > 0 ? 0 : this.active.value.length;
    }
    return this.active;
  }

  backspace() {
    if (this.active.cursor > 0) {
      const slot = this.active;
      slot.value = `${slot.value.slice(0, slot.cursor - 1)}${slot.value.slice(slot.cursor)}`;
      slot.cursor -= 1;
    } else if (this.activeIndex > 0) {
      this.activeIndex -= 1;
      this.active.cursor = this.active.value.length;
    }
    return this.active;
  }

  clearActive() {
    this.active.value = "";
    this.active.cursor = 0;
  }

  clearAll() {
    for (const slot of this.slots) {
      slot.value = "";
      slot.cursor = 0;
    }
    this.activeIndex = 0;
  }

  values() {
    return Object.fromEntries(this.slots.map(slot => [slot.key, slot.value]));
  }

  handleHardwareKey(event) {
    const key = event.key;
    if (key === "ArrowLeft") return this.moveLeft(), "move";
    if (key === "ArrowRight") return this.moveRight(), "move";
    if (key === "ArrowUp") return this.moveVertical(-1), "move";
    if (key === "ArrowDown") return this.moveVertical(1), "move";
    if (key === "Backspace") return this.backspace(), "edit";
    if (key === "Delete") return this.clearActive(), "edit";
    if (key === "Tab") {
      const direction = event.shiftKey ? -1 : 1;
      const target = this.activeIndex + direction;
      if (target < 0 || target >= this.slots.length) return "ignored";
      return this.nextSlot(direction), "move";
    }
    if (key === "Enter") return "submit";
    if (key === "Escape") return this.clearAll(), "edit";
    if (key.length === 1 && ALLOWED_HARDWARE.test(key)) return this.insertText(key === "." ? "," : key), "edit";
    return "ignored";
  }
}

export function insertionFor(action) {
  return INSERTIONS[action] || null;
}

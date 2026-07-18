import { parseHTML } from "linkedom";

export function memoryStorage() {
  const values = new Map();
  return {
    getItem: key => values.has(String(key)) ? values.get(String(key)) : null,
    setItem: (key, value) => values.set(String(key), String(value)),
    removeItem: key => values.delete(String(key)),
    clear: () => values.clear()
  };
}

export function installDom(html = "<!doctype html><html><body></body></html>") {
  const { window } = parseHTML(html);
  const location = new URL("https://lovisfarhood.github.io/KopfMatheDings/");
  const storage = memoryStorage();

  Object.defineProperty(window.navigator, "onLine", { configurable: true, value: true });
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 844 });
  window.confirm = () => true;
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.requestAnimationFrame = callback => (callback(), 1);
  window.HTMLElement.prototype.scrollIntoView ||= function scrollIntoView() {};

  const globals = {
    window,
    document: window.document,
    navigator: window.navigator,
    location,
    localStorage: storage,
    HTMLElement: window.HTMLElement,
    Event: window.Event,
    CustomEvent: window.CustomEvent,
    requestAnimationFrame: window.requestAnimationFrame,
    matchMedia: window.matchMedia,
    CSS: window.CSS || { escape: value => String(value).replace(/[^a-zA-Z0-9_-]/g, character => `\\${character}`) }
  };
  for (const [key, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  return { window, document: window.document, storage };
}

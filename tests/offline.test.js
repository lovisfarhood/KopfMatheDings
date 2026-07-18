import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = readFileSync(`${root}/sw.js`, "utf8");
const base = "https://lovisfarhood.github.io/KopfMatheDings/";

function workerHarness() {
  const listeners = new Map();
  const stores = new Map();
  const normalize = request => new URL(typeof request === "string" ? request : request.url, base).href;
  const response = marker => ({ ok: true, marker, clone() { return response(marker); } });
  const cacheFor = name => {
    if (!stores.has(name)) stores.set(name, new Map());
    const store = stores.get(name);
    return {
      async addAll(urls) {
        for (const url of urls) store.set(normalize(url), response(url));
      },
      async put(request, value) {
        store.set(normalize(request), value);
      }
    };
  };
  const caches = {
    open: async name => cacheFor(name),
    keys: async () => [...stores.keys()],
    delete: async name => stores.delete(name),
    match: async request => {
      const key = normalize(request);
      for (const store of stores.values()) if (store.has(key)) return store.get(key);
      return undefined;
    }
  };
  const self = {
    location: { origin: new URL(base).origin },
    clients: { claim: async () => true },
    addEventListener: (type, listener) => listeners.set(type, listener),
    skipWaiting: () => { self.skipped = true; }
  };
  const context = {
    self,
    caches,
    URL,
    Response,
    Promise,
    console,
    fetch: async request => response(normalize(request))
  };
  vm.runInNewContext(source, context, { filename: "sw.js" });
  return { listeners, stores, context };
}

async function runWaitEvent(listener, event = {}) {
  let pending;
  listener({ ...event, waitUntil: promise => { pending = promise; } });
  await pending;
}

test("Installationsereignis cached die vollständige App-Shell am Pages-Unterpfad", async () => {
  const harness = workerHarness();
  await runWaitEvent(harness.listeners.get("install"));
  const [cacheName] = [...harness.stores.keys()];
  const assets = [...harness.stores.get(cacheName).keys()];
  assert.match(cacheName, /^kopfmathe-v4-/);
  assert.ok(assets.includes(new URL("./src/core/later-queue.js", base).href));
  assert.ok(assets.includes(new URL("./index.html", base).href));
  assert.ok(assets.every(url => new URL(url).pathname.startsWith("/KopfMatheDings/")));
});

test("Offline-Navigation am GitHub-Pages-Unterpfad fällt auf index.html zurück", async () => {
  const harness = workerHarness();
  await runWaitEvent(harness.listeners.get("install"));
  harness.context.fetch = async () => { throw new Error("offline"); };
  let responsePromise;
  harness.listeners.get("fetch")({
    request: { method: "GET", mode: "navigate", url: base },
    respondWith: promise => { responsePromise = promise; }
  });
  const result = await responsePromise;
  assert.equal(result.marker, "./index.html");
});

test("Offline-Assets sind cache-first und fremde Origins werden nicht abgefangen", async () => {
  const harness = workerHarness();
  await runWaitEvent(harness.listeners.get("install"));
  harness.context.fetch = async () => { throw new Error("offline"); };
  let responsePromise;
  harness.listeners.get("fetch")({
    request: { method: "GET", mode: "cors", url: `${base}styles.css` },
    respondWith: promise => { responsePromise = promise; }
  });
  assert.equal((await responsePromise).marker, "./styles.css");

  let intercepted = false;
  harness.listeners.get("fetch")({
    request: { method: "GET", mode: "cors", url: "https://example.org/file.js" },
    respondWith: () => { intercepted = true; }
  });
  assert.equal(intercepted, false);
});

test("Aktivierung entfernt alte Caches und Update-Nachricht aktiviert den Worker", async () => {
  const harness = workerHarness();
  harness.stores.set("kopfmathe-v1-old", new Map());
  await runWaitEvent(harness.listeners.get("install"));
  await runWaitEvent(harness.listeners.get("activate"));
  assert.deepEqual([...harness.stores.keys()], ["kopfmathe-v4-20260718"]);
  harness.listeners.get("message")({ data: { type: "SKIP_WAITING" } });
  assert.equal(harness.context.self.skipped, true);
});

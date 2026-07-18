const CACHE = "kopfmathe-v4-20260718";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./src/app.js",
  "./src/core/rational.js",
  "./src/core/random.js",
  "./src/core/display.js",
  "./src/core/expression.js",
  "./src/core/checker.js",
  "./src/core/storage.js",
  "./src/core/registry.js",
  "./src/ui/input-model.js",
  "./src/ui/inputs.js",
  "./src/ui/math-keyboard.js",
  "./src/ui/layout.js",
  "./src/core/later-queue.js",
  "./src/topics/helpers.js",
  "./src/topics/catalog-a.js",
  "./src/topics/catalog-b.js",
  "./src/topics/quality-generators.js",
  "./src/topics/basics.js",
  "./src/topics/algebra.js",
  "./src/topics/complex.js",
  "./src/topics/limits.js",
  "./src/topics/sequences.js",
  "./src/topics/series.js",
  "./src/topics/derivatives.js",
  "./src/topics/taylor.js",
  "./src/topics/integrals.js",
  "./src/topics/matrices.js",
  "./src/topics/linearSystems.js",
  "./src/topics/vectorSpaces.js",
  "./src/topics/orthogonality.js",
  "./src/topics/decompositions.js",
  "./src/topics/numericalMethods.js",
  "./src/topics/differentialEquations.js",
  "./src/topics/trueFalse.js",
  "./src/topics/matlab.js"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

async function navigationResponse(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put("./index.html", response.clone());
    }
    return response;
  } catch {
    return (await caches.match("./index.html")) || Response.error();
  }
}

async function assetResponse(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  const refresh = fetch(request).then(async response => {
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  return cached || (await refresh) || Response.error();
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(event.request.mode === "navigate" ? navigationResponse(event.request) : assetResponse(event.request));
});

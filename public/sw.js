// Minimal app-shell cache: cache-first for anything already fetched, refreshed
// in the background on every request, falling back to cache when offline.
// Not an offline-data-sync layer — just keeps the built assets available.
const CACHE_NAME = "forge-flow-shell-v1";
const CORE_ASSETS = ["/", "/index.html", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function putInCache(request, response) {
  const copy = response.clone();
  caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // The app shell (index.html) can reference hashed asset filenames that change on every
  // build — serve it network-first so a fresh deploy doesn't get stuck pointing at assets
  // that no longer exist. Everything else (hashed, effectively-immutable build assets) is
  // safe to serve cache-first, refreshed in the background.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) putInCache(event.request, response);
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/index.html"))),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response.ok) putInCache(event.request, response);
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    }),
  );
});

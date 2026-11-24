const CACHE = "campus-nexus-static-v1";
const STATIC = ["/manifest.webmanifest"];
self.addEventListener("install", (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(STATIC))));
self.addEventListener("activate", (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("message", (event) => { if (event.data?.type === "SKIP_WAITING") self.skipWaiting(); });
// Never cache API responses. In particular, this protects grievance payloads,
// private IDs, auth material and examination credentials from offline storage.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  if (new URL(event.request.url).pathname.startsWith("/api/")) return;
  if (STATIC.includes(new URL(event.request.url).pathname)) event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});

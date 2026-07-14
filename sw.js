const CACHE_NAME = "guelle-mist-v3";
const ASSETS = ["guelle-app.html", "manifest.json", "icon.svg"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: bei Internetverbindung immer die aktuelle Version laden
// (und den Offline-Cache dabei aktualisieren). Nur wenn kein Netz verfügbar
// ist, wird auf die zuletzt gecachte Version zurückgegriffen.
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request))
  );
});

self.addEventListener("install", (e) => {
  console.log("[Service Worker] Instalado");
  e.waitUntil(
    caches.open("pupuseria-v1").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/bebidas.html",
        "/pupuseria.js",
        "/favicon.png",
        "/offline.html",
        "/pupuseria.json",
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );

});

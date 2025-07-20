const CACHE_NAME = 'plataforma-consultas-cache-v2';
const urlsToCache = [
  '.',
  'index.html',
  'styles.css',
  'script.js',
  'manifest.json',
  'data.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

// Evento 'install': se dispara cuando el SW se instala.
// Abre la caché y guarda los archivos de la aplicación (app shell).
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierta y guardando app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Forzar la activación del nuevo SW
  );
});

// Evento 'fetch': se dispara con cada petición de red.
// Intenta responder desde la caché primero, y si no puede, va a la red.
self.addEventListener('fetch', event => {
  // Estrategia: Cache, falling back to Network.
  // Si ambos fallan (offline y no está en caché), para las navegaciones,
  // devolvemos la página principal para que la app (SPA) pueda arrancar.
  event.respondWith(caches.match(event.request)
    .then(cachedResponse => {
      // Si la respuesta está en la caché, la devolvemos.
      if (cachedResponse) {
        return cachedResponse;
      }
      // Si no, vamos a la red.
      return fetch(event.request);
    }).catch(() => {
      // Si la red también falla, y es una petición de navegación (abrir una página),
      // devolvemos el index.html como fallback para que la app siempre cargue.
      if (event.request.mode === 'navigate') {
        return caches.match('index.html');
      }
    }));
});

// Evento 'activate': se dispara cuando el SW se activa.
// Es el lugar ideal para limpiar cachés antiguas.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Si la caché no está en nuestra "lista blanca", la borramos.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim()) // Tomar control de los clientes abiertos
  );
});
/**
 * sw.js - Service Worker para OSINT Hub
 */

const CACHE_NAME = 'osint-hub-v2';
const OFFLINE_URL = 'offline.html';

const STATIC_ASSETS = [
  '/',
  'index.html',
  'styles.css',
  'script.js',
  'data.json',
  'manifest.json',
  'offline.html',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/favicon.ico',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

// Instalación: Cachear activos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación: Limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Estrategia Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  // Solo manejar peticiones GET
  if (event.request.method !== 'GET') return;

  // Ignorar peticiones a dominios externos excepto FontAwesome
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin && !url.hostname.includes('cdnjs.cloudflare.com')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Si falla la red y no hay caché, mostrar offline.html para navegaciones
          if (event.request.mode === 'navigate') {
            return cache.match(OFFLINE_URL);
          }
        });

        return cachedResponse || fetchPromise;
      });
    })
  );
});

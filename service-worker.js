const CACHE_NAME = 'truco-v1.0.1';
const ASSETS_TO_CACHE = [
  './',
  './index.php',
  './style.css',
  './app.js',
  './manifest.json',
  './favicon.png',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch((err) => console.warn('Cache addAll error:', err))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Pure Network-First Strategy with robust fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Only handle http/https requests within origin
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request, { ignoreSearch: true });
        if (cached) return cached;

        // If navigation request, fallback to root or index.php
        if (event.request.mode === 'navigate') {
          const rootCached = (await caches.match('./')) || (await caches.match('./index.php'));
          if (rootCached) return rootCached;
        }

        // Return a valid Response object so respondWith never receives undefined
        return new Response('Offline - Conteúdo não disponível sem conexão.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      })
  );
});

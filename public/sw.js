const CACHE_NAME = 'ai-block-v3.4'; 

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './icons/site.webmanifest',
  './sounds/bonus.mp3',      
  './sounds/clear.mp3',
  './sounds/gameOver.mp3',
  './sounds/place.mp3',
  './icons/favicon.svg',     
  './icons/web-app-manifest-192x192.png',
  './icons/web-app-manifest-512x512.png',
  './icons/apple-touch-icon.png'
];

// INSTALACIÓN
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Instalando archivos en caché...');
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => 
          cache.add(url).catch(err => console.warn(`Error al cachear: ${url}`, err))
        )
      );
    })
  );
  self.skipWaiting();
});

// ACTIVACIÓN: Limpia lo viejo
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH: Estrategia de Entrega Offline Real
self.addEventListener('fetch', (event) => {
  // Ignoramos lo que no sea GET o sea desarrollo/extensiones
  if (
    event.request.method !== 'GET' || 
    event.request.url.includes('chrome-extension') ||
    event.request.url.includes('localhost') || 
    event.request.url.includes('socket.io')
  ) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Si está en caché, lo devolvemos de inmediato (Modo Offline instantáneo)
      if (cachedResponse) {
        // Opcional: Actualizamos la caché en segundo plano mientras el usuario juega
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {}); // Fallo de red silencioso, ya servimos la caché

        return cachedResponse;
      }

      // 2. Si no está en caché, intentamos ir a la red
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        return networkResponse;
      });
    })
  );
});
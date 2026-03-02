const CACHE_NAME = 'ai-block-v2.9'; // Incrementamos versión

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/icons/manifest.json',
  '/sounds/place.mp3',
  '/sounds/clear.mp3',
  '/sounds/gameOver.mp3',
  '/icons/android-icon-192x192.png'
];

// INSTALACIÓN
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usamos addAll pero permitimos que falle si un archivo no existe
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.warn("Fallo caché inicial:", err));
    })
  );
  self.skipWaiting();
});

// ACTIVACIÓN: Borra caches viejas inmediatamente
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim()) // Toma el control de la página YA
  );
});

// FETCH: Estrategia Network First para el HTML y archivos críticos
self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la red responde, guardamos una copia en caché
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => {
        // Si falla la red (offline), buscamos en caché
        return caches.match(event.request);
      })
  );
});
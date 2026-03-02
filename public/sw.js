const CACHE_NAME = 'ai-block-v2.8';

// Lista de archivos que se guardarán en el teléfono del usuario
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/icons/manifest.json',
  '/sounds/place.mp3',
  '/sounds/clear.mp3',
  '/sounds/gameOver.mp3',
  '/sounds/bonus.mp3', // Agregado según tu lista de archivos
  '/icons/android-icon-192x192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
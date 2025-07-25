const CACHE_NAME = 'fyraxr-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/ar/ARManager.js',
  '/src/tiles/TilesManager.js',
  '/src/calibration/CalibrationManager.js',
  '/src/ui/UIController.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
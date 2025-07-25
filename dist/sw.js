const CACHE_NAME = 'fyraxr-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/main-BNBVKrJr.js',  // ✅ 正确的构建文件路径
  '/assets/sw-6sQpYQrK.js',   // ✅ 正确的构建文件路径
  '/icon/icon.png',           // ✅ 正确的图标路径
  '/models/mj/'               // ✅ 模型文件夹
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
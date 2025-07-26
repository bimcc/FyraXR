const CACHE_NAME = 'fyraxr-v1';

// 获取当前作用域的基础路径，这样在GitHub Pages和本地环境都能正常工作
const getBasePath = () => {
  return self.location.pathname.replace(/\/sw\.js$/, '');
};

// 动态确定要缓存的URL
const urlsToCache = [
  './', 
  './index.html',
  './src/main.js',
  './src/ar/ARManager.js',
  './src/tiles/TilesManager.js',
  './src/calibration/CalibrationManager.js',
  './src/ui/UIController.js'
];

self.addEventListener('install', event => {
  console.log('Service Worker 安装中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存文件列表:', urlsToCache);
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
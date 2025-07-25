const CACHE_NAME = 'fyraxr-v2';

// 获取当前作用域的基础路径
const getBasePath = () => {
  const path = self.location.pathname.replace(/\/sw\.js$/, '');
  return path === '' ? '/' : path + '/';
};

self.addEventListener('install', event => {
  console.log('Service Worker 安装中...');
  
  // 动态计算基础路径
  const base = getBasePath();
  console.log('Service Worker 基础路径:', base);
  
  // 要缓存的URL列表
  const urlsToCache = [
    base,
    base + 'index.html',
    base + 'assets/index-DqvpZU2w.js', // 确保这个名称与构建后的文件匹配
    base + 'manifest.json',
    base + 'icon/icon.png'
  ];
  
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
        // 缓存命中
        if (response) {
          return response;
        }
        
        // 缓存未命中，则发起网络请求
        return fetch(event.request).then(
          function(response) {
            // 检查是否收到了有效响应
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 复制响应，因为响应是流，只能使用一次
            var responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(function(cache) {
                // 将响应添加到缓存
                cache.put(event.request, responseToCache);
              });
              
            return response;
          }
        );
      })
    );
});
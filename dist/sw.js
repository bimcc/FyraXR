const CACHE_NAME = 'fyraxr-v6'; // 更新版本号

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
  
  // 只缓存基础静态资源，不使用通配符
  const urlsToCache = [
    base + 'manifest.json',
    base + 'icon/icon.png'
    // 不再使用通配符，在fetch事件中缓存JS资源
  ];
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存基础文件:', urlsToCache);
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('缓存文件失败:', error);
        // 错误时继续，不阻止SW安装
      })
  );
  
  // 强制激活新的Service Worker
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  // 只处理同源请求
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  const url = new URL(event.request.url);
  
  // 对HTML文件使用网络优先策略
  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 网络请求成功，返回最新内容
          if (response && response.status === 200) {
            return response;
          }
          // 网络失败，尝试从缓存获取
          return caches.match(event.request);
        })
        .catch(() => {
          // 网络和缓存都失败，返回缓存或离线页面
          return caches.match(event.request) || new Response('离线模式', {
            status: 200,
            statusText: 'OK',
            headers: new Headers({
              'Content-Type': 'text/html'
            })
          });
        })
    );
    return;
  }
  
  // 特殊处理JS资源，确保找到正确的缓存
  if (url.pathname.includes('/assets/') && 
      (url.pathname.includes('.js') || url.pathname.includes('.json') || url.pathname.includes('.png'))) {
    event.respondWith(
      // 先尝试网络请求
      fetch(event.request)
        .then(response => {
          // 检查是否收到了有效响应
          if (response && response.status === 200) {
            // 复制响应，因为响应是流，只能使用一次
            var responseToCache = response.clone();
            
            // 更新缓存
            caches.open(CACHE_NAME).then(cache => {
              console.log('缓存资源:', url.pathname);
              cache.put(event.request, responseToCache);
            });
            
            return response;
          }
          // 网络失败，使用缓存
          return caches.match(event.request);
        })
        .catch(() => {
          // 网络失败，尝试使用缓存
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // 对其他资源使用缓存优先策略
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
        ).catch(error => {
          console.error('Fetch 失败:', error);
          return new Response('离线模式', {
            status: 200,
            statusText: 'OK',
            headers: new Headers({
              'Content-Type': 'text/html'
            })
          });
        });
      })
    );
});

// 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // 立即控制所有客户端
  return self.clients.claim();
});
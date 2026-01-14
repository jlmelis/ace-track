
const CACHE_NAME = 'acetrack-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/metadata.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests and skip chrome-extension/etc
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then(fetchRes => {
        return caches.open(CACHE_NAME).then(cache => {
          // Don't cache everything, just core assets if needed
          // For now, let's keep it simple
          return fetchRes;
        });
      });
    })
  );
});

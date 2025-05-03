const CACHE_NAME = 'window-reminder-v1';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/window.svg',
  '/reminder.mp3',
  // Add more static assets if needed
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request).then(fetchRes => {
        // Cache assets but not API requests
        if (event.request.url.includes('/api/')) {
          return fetchRes;
        }
        
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchRes.clone());
          return fetchRes;
        });
      }).catch(() => {
        // Return a fallback for offline pages
        return caches.match('/');
      })
    )
  );
}); 
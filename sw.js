const CACHE = 'prolan-ptar-v20261109-actualizacion';
const OFFLINE = ['./', './index.html'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(OFFLINE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name !== CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req, {cache:'no-store'}).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put('./index.html', copy));
      }
      return response;
    }).catch(() => caches.match('./index.html')));
  } else {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
  }
});

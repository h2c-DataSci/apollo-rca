const CACHE = 'h2c-rca-shell-v23';
const SHELL = [
  './',
  './index.html',
  './styles-v13.css',
  './index-v13.js',
  './routes-v13.js',
  './rolldown-runtime-v11.js',
  './h2c-shell.js?v=22',
  './h2c-help.js?v=22',
  './help-kb.js?v=22',
  './help-diagrams.js?v=22',
  './h2c-videos.js?v=22',
  './local-ai-bridge.js?v=21',
  './ai-config.js',
  './browser-ai.js?v=22',
  './favicon.svg',
  './h2c-logo.jpg',
  './manifest.webmanifest',
  './sw.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      await Promise.all(SHELL.map((url) => cache.add(url).catch(() => {})));
    }).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(async () => {
        const hit = await caches.match(request);
        if (hit) return hit;
        if (request.mode === 'navigate') {
          return (await caches.match('./index.html')) || (await caches.match('./'));
        }
        return new Response('', { status: 504, statusText: 'Offline' });
      }),
  );
});

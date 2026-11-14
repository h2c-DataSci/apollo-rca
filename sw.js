const CACHE = 'apollo-rca-shell-v27';
const RUNTIME = 'apollo-rca-runtime-v2';
const OWN_PREFIX = 'apollo-rca-';
const RUNTIME_MAX_ENTRIES = 40;
const RUNTIME_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const RUNTIME_MAX_BYTES = 1500000;
const SHELL = [
  './',
  './index.html',
  './styles-v13.css',
  './index-v13.js',
  './routes-v13.js',
  './rolldown-runtime-v11.js',
  './h2c-shell.js?v=28',
  './h2c-help.js?v=27',
  './help-kb.js?v=22',
  './help-diagrams.js?v=22',
  './h2c-videos.js?v=25',
  './local-ai-bridge.js?v=24',
  './ai-config.js',
  './provider-presets.js',
  './session-store.js',
  './browser-ai.js?v=24',
  './favicon.svg',
  './h2c-logo.jpg',
  './manifest.webmanifest',
  './sw.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(SHELL.map((url) => cache.add(new Request(new URL(url, self.location.href), { cache: 'reload' }))));
    await self.skipWaiting();
  })());
});

async function trimRuntime() {
  const cache = await caches.open(RUNTIME);
  const keys = await cache.keys();
  const now = Date.now();
  const fresh = [];
  for (const key of keys) {
    const hit = await cache.match(key);
    const at = Number(hit?.headers.get('x-apollo-cached-at') || 0);
    if (!hit || !at || now - at > RUNTIME_MAX_AGE_MS) {
      await cache.delete(key);
      continue;
    }
    fresh.push(key);
  }
  while (fresh.length > RUNTIME_MAX_ENTRIES) {
    await cache.delete(fresh.shift());
  }
}

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = new Set([CACHE, RUNTIME]);
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith(OWN_PREFIX) && !keep.has(key))
        .map((key) => caches.delete(key)),
    );
    await trimRuntime();
    await self.clients.claim();
  })());
});

async function putRuntime(request, response) {
  // Limit bytes accumulated for caching, not browser/network internal buffers.
  const declaredLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > RUNTIME_MAX_BYTES) {
    response.body?.cancel().catch(() => undefined);
    return;
  }
  if (!response.body) return;
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > RUNTIME_MAX_BYTES) {
        // Do not await cancellation of a tee: the page may still be reading
        // the original response. Discard only this cache branch.
        reader.cancel().catch(() => undefined);
        return;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const headers = new Headers(response.headers);
  headers.set('x-apollo-cached-at', String(Date.now()));
  const cache = await caches.open(RUNTIME);
  await cache.put(request, new Response(bytes, { status: response.status, statusText: response.statusText, headers }));
  await trimRuntime();
}

async function matchCached(request) {
  const shell = await caches.open(CACHE).then((cache) => cache.match(request));
  if (shell) return shell;
  const cache = await caches.open(RUNTIME);
  const hit = await cache.match(request);
  if (!hit) return null;
  const at = Number(hit.headers.get('x-apollo-cached-at') || 0);
  if (!at || Date.now() - at > RUNTIME_MAX_AGE_MS) {
    await cache.delete(request);
    return null;
  }
  return hit;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || request.headers.has('authorization')) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const network = fetch(request);
  // Register lifetime work synchronously; cache failures must not fail a
  // successful page response or turn a quota error into an offline fallback.
  event.waitUntil(
    network.then(async (response) => {
      if (response && response.ok && response.type === 'basic') {
        await putRuntime(request, response.clone());
      }
    }).catch(() => undefined),
  );
  event.respondWith(
    network.catch(async () => {
        const hit = await matchCached(request);
        if (hit) return hit;
        if (request.mode === 'navigate') {
          return (await caches.match('./index.html')) || (await caches.match('./'));
        }
        return new Response('', { status: 504, statusText: 'Offline' });
      }),
  );
});

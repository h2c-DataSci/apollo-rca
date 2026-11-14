import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('./sw.js', import.meta.url), 'utf8');
const BASE = 'https://example.invalid/apollo-rca/';
const key = (request) => new URL(typeof request === 'string' ? request : request.url, BASE).href;
const deferred = () => { let resolve; const promise = new Promise((r) => { resolve = r; }); return { promise, resolve }; };

function harness({ fetchImpl = async () => { throw new Error('offline fixture'); }, putHook, addHook } = {}) {
  const listeners = new Map();
  const stores = new Map();
  const deleted = [];
  let skipCalls = 0;
  const cacheFor = (name) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const entries = stores.get(name);
    return {
      match: async (request) => entries.get(key(request))?.clone(),
      keys: async () => [...entries.keys()].map((url) => new Request(url)),
      delete: async (request) => entries.delete(key(request)),
      add: async (url) => { if (addHook) await addHook(url); entries.set(key(url), new Response('shell')); },
      put: async (request, response) => { if (putHook) await putHook(); entries.set(key(request), response); },
    };
  };
  const context = vm.createContext({
    URL, Request, Response, Headers, Uint8Array, Set, Date,
    self: {
      location: { origin: new URL(BASE).origin, href: new URL('sw.js', BASE).href },
      addEventListener: (name, fn) => listeners.set(name, fn),
      skipWaiting: async () => { skipCalls += 1; },
      clients: { claim: async () => {} },
    },
    caches: {
      open: async (name) => cacheFor(name),
      keys: async () => [...stores.keys()],
      delete: async (name) => { deleted.push(name); return stores.delete(name); },
      match: async (request) => {
        for (const name of stores.keys()) { const hit = await cacheFor(name).match(request); if (hit) return hit; }
      },
    },
    fetch: fetchImpl,
  });
  vm.runInContext(source, context, { filename: 'sw.js' });
  const event = (request) => {
    const waits = [];
    let response;
    const value = { request, waitUntil: (p) => waits.push(p), respondWith: (p) => { response = p; } };
    return { value, waits, response: () => response };
  };
  return { context, stores, deleted, listeners, event, cacheFor, skipCalls: () => skipCalls };
}
const basic = (body) => { const response = new Response(body); Object.defineProperty(response, 'type', { value: 'basic' }); return response; };

test('fetch registers cache lifetime synchronously and serves the page before a delayed write finishes', async () => {
  const gate = deferred();
  const started = deferred();
  const h = harness({ fetchImpl: async () => basic('page'), putHook: async () => { started.resolve(); await gate.promise; } });
  const e = h.event(new Request(BASE + 'asset.js'));
  h.listeners.get('fetch')(e.value);
  assert.equal(e.waits.length, 1);
  const response = await e.response();
  assert.equal(await response.text(), 'page');
  await started.promise;
  let done = false;
  const completion = e.waits[0].then(() => { done = true; });
  await Promise.resolve();
  assert.equal(done, false);
  gate.resolve();
  await completion;
  assert.equal(await (await h.cacheFor('apollo-rca-runtime-v2').match(e.value.request)).text(), 'page');
});

test('cache quota failures do not replace a successful network response', async () => {
  const h = harness({ fetchImpl: async () => basic('online'), putHook: async () => { throw new Error('quota fixture'); } });
  const e = h.event(new Request(BASE + 'asset.js'));
  h.listeners.get('fetch')(e.value);
  assert.equal(await (await e.response()).text(), 'online');
  await Promise.all(e.waits);
});

test('offline fetch falls back to the shell cache without a rejected lifetime promise', async () => {
  const h = harness();
  await h.cacheFor('apollo-rca-shell-v30').put(BASE + 'asset.js', new Response('offline copy'));
  const e = h.event(new Request(BASE + 'asset.js'));
  h.listeners.get('fetch')(e.value);
  assert.equal(await (await e.response()).text(), 'offline copy');
  await Promise.all(e.waits);
});

test('streaming cache reader cancels at the body cap without buffering the entire response', async () => {
  const h = harness();
  let reads = 0;
  let cancelled = false;
  const body = new ReadableStream({
    pull(controller) { reads += 1; controller.enqueue(new Uint8Array(800000)); },
    cancel() { cancelled = true; },
  }, { highWaterMark: 0 });
  const response = new Response(body);
  response.arrayBuffer = () => { throw new Error('whole-body buffering forbidden'); };
  await vm.runInContext('putRuntime', h.context)(new Request(BASE + 'large.bin'), response);
  assert.equal(reads, 2);
  assert.equal(cancelled, true);
  assert.equal(h.stores.size, 0);
});

test('oversized cache branch cancellation leaves the original page response readable', async () => {
  const h = harness({ fetchImpl: async () => basic(new Uint8Array(1500001)) });
  const e = h.event(new Request(BASE + 'large.bin'));
  h.listeners.get('fetch')(e.value);
  assert.equal((await (await e.response()).arrayBuffer()).byteLength, 1500001);
  await Promise.all(e.waits);
  assert.equal(h.stores.size, 0);
});

test('oversized declared length skips reading and cancels only the supplied cache body', async () => {
  const h = harness();
  let reads = 0;
  let cancelled = false;
  const response = new Response(new ReadableStream({
    pull() { reads += 1; }, cancel() { cancelled = true; },
  }, { highWaterMark: 0 }), { headers: { 'content-length': '1500001' } });
  await vm.runInContext('putRuntime', h.context)(new Request(BASE + 'large.bin'), response);
  assert.equal(reads, 0);
  assert.equal(cancelled, true);
});

test('runtime trimming preserves the count bound and expires old entries', async () => {
  const h = harness();
  const cache = h.cacheFor('apollo-rca-runtime-v2');
  for (let i = 0; i < 42; i += 1) {
    await cache.put(BASE + i, new Response('x', { headers: { 'x-apollo-cached-at': String(Date.now()) } }));
  }
  await cache.put(BASE + 'old', new Response('old', { headers: { 'x-apollo-cached-at': '1' } }));
  await vm.runInContext('trimRuntime', h.context)();
  assert.equal((await cache.keys()).length, 40);
  assert.equal(await cache.match(BASE + 'old'), undefined);
});

test('failed essential precache prevents skipWaiting', async () => {
  const h = harness({ addHook: async () => { throw new Error('missing shell fixture'); } });
  const e = h.event();
  h.listeners.get('install')(e.value);
  await assert.rejects(e.waits[0], /missing shell fixture/);
  assert.equal(h.skipCalls(), 0);
});

test('activation only deletes this app old caches', async () => {
  const h = harness();
  for (const name of ['apollo-rca-shell-v23', 'apollo-rca-shell-v24', 'apollo-rca-shell-v25', 'apollo-rca-shell-v27', 'apollo-rca-shell-v28', 'apollo-rca-shell-v29', 'apollo-rca-runtime-v1', 'heat-index-shell-v2', 'model-cache']) h.cacheFor(name);
  const e = h.event();
  h.listeners.get('activate')(e.value);
  await Promise.all(e.waits);
  assert.deepEqual(h.deleted, ['apollo-rca-shell-v23', 'apollo-rca-shell-v24', 'apollo-rca-shell-v25', 'apollo-rca-shell-v27', 'apollo-rca-shell-v28', 'apollo-rca-shell-v29', 'apollo-rca-runtime-v1']);
});

test('non-GET, credential-bearing and cross-origin requests remain untouched', () => {
  const h = harness();
  for (const request of [new Request(BASE, { method: 'POST' }), new Request(BASE, {headers: {authorization:'Bearer synthetic'}}), new Request('https://other.invalid/')]) {
    const e = h.event(request); h.listeners.get('fetch')(e.value);
    assert.equal(e.waits.length, 0); assert.equal(e.response(), undefined);
  }
});


test('new shell installation revalidates same-name assets instead of reusing the HTTP cache', async () => {
  const requests = [];
  const h = harness({ addHook: async request => requests.push(request) });
  const e = h.event(); h.listeners.get('install')(e.value); await Promise.all(e.waits);
  assert.ok(requests.length > 0);
  assert.ok(requests.every(request => request.cache === 'reload'));
  assert.ok(requests.some(request => request.url === BASE + 'session-store.js'));
  assert.equal(h.skipCalls(), 1);
});

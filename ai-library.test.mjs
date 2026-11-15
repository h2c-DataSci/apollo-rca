import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { MODEL_CONFIG } from './ai-config.js';
import { importVerifiedLibrary } from './ai-library.js';

test('vendored transformers file matches the pinned sha384', () => {
  const bytes = readFileSync(new URL('./vendor/transformers-3.7.6.min.js', import.meta.url));
  assert.equal(`sha384-${createHash('sha384').update(bytes).digest('base64')}`, MODEL_CONFIG.libraryIntegrity);
  assert.equal(MODEL_CONFIG.libraryUrl, './vendor/transformers-3.7.6.min.js');
});

test('pinned transformers import is checked with SRI before it loads', async () => {
  const calls = [];
  let imported = false;
  const mod = await importVerifiedLibrary(MODEL_CONFIG.libraryUrl, MODEL_CONFIG.libraryIntegrity, {
    fetch: async (url, init) => { calls.push({ url, init }); return { ok: true, arrayBuffer: async () => new ArrayBuffer(0) }; },
    importModule: async (url) => { imported = url; return { ok: true }; }
  });
  assert.equal(mod.ok, true);
  assert.equal(imported, MODEL_CONFIG.libraryUrl);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.integrity, MODEL_CONFIG.libraryIntegrity);
  assert.match(calls[0].init.integrity, /^sha384-[A-Za-z0-9+/]{64}$/);
  assert.equal(calls[0].init.credentials, 'same-origin');
  assert.equal(calls[0].init.redirect, 'error');
  await assert.rejects(() => importVerifiedLibrary('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.6', MODEL_CONFIG.libraryIntegrity, {
    fetch: async () => { throw new Error('should not fetch'); }
  }), /pinned release/);
});

test('a failed integrity check does not import the library', async () => {
  let imported = false;
  await assert.rejects(() => importVerifiedLibrary(MODEL_CONFIG.libraryUrl, MODEL_CONFIG.libraryIntegrity, {
    fetch: async () => { throw new Error('integrity mismatch'); },
    importModule: async () => { imported = true; }
  }), /integrity mismatch/);
  assert.equal(imported, false);
});

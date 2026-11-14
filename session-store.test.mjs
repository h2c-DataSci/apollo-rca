import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { sessionStore, LEGACY_KEYS, listLegacyData, removeLegacyData } from './session-store.js';

test('case storage is string-based memory only and does not access browser storage', () => {
  let touched = false;
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { touched = true; throw Error('storage blocked'); } });
  try {
    sessionStore.clear();
    assert.equal(sessionStore.getItem('case'), null);
    sessionStore.setItem('case', 123);
    assert.equal(sessionStore.getItem('case'), '123');
    sessionStore.removeItem('case');
    assert.equal(sessionStore.getItem('case'), null);
    assert.equal(touched, false);
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete globalThis.localStorage;
    sessionStore.clear();
  }
});

test('legacy discovery is explicit and deletion affects only known app data', () => {
  const values = new Map([['realitychart-intake-v1', '{"case":"old"}'], ['h2c-local-ai-bridge-v1', '{"apiKey":"secret"}'], ['another-app', 'keep']]);
  const storage = { getItem: key => values.get(key) ?? null, removeItem: key => values.delete(key) };
  const saved = listLegacyData(storage);
  assert.equal(saved['realitychart-intake-v1'], '{"case":"old"}');
  assert.equal(sessionStore.getItem('realitychart-intake-v1'), null);
  assert.equal(values.size, 3);
  assert.deepEqual(removeLegacyData(storage), []);
  assert.deepEqual([...values], [['another-app', 'keep']]);
  assert.equal(LEGACY_KEYS.includes('h2c-local-ai-bridge-v1'), true);
});

test('legacy helper handles blocked storage and reports deletion failure', () => {
  const blocked = { getItem() { throw Error('blocked'); }, removeItem() { throw Error('blocked'); } };
  assert.deepEqual(listLegacyData(blocked), {});
  assert.deepEqual(removeLegacyData(blocked), [...LEGACY_KEYS]);
});

test('active editor uses memory store and remounts on explicit session change', async () => {
  const source = await readFile(new URL('./routes-v13.js', import.meta.url), 'utf8');
  assert.equal(source.includes('localStorage'), false);
  assert.match(source, /window\.addEventListener\(SESSION_CHANGED,e\)/);
  assert.match(source, /\(0,B\.jsx\)\(Xn,\{\},e\)/);
  assert.match(source, /If AI assistance was used/);
});

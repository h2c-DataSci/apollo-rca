import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { MODEL_CONFIG } from './ai-config.js';

const wasmDir = new URL('./vendor/onnx-wasm/', import.meta.url);

test('vendored ONNX wasm files match the pinned sha384 values', () => {
  const names = Object.keys(MODEL_CONFIG.wasmFiles);
  assert.deepEqual(names.sort(), [
    'ort-wasm-simd-threaded.asyncify.mjs',
    'ort-wasm-simd-threaded.asyncify.wasm',
    'ort-wasm-simd-threaded.mjs',
    'ort-wasm-simd-threaded.wasm',
  ]);
  assert.equal(MODEL_CONFIG.wasmDir, './vendor/onnx-wasm/');
  assert.equal(MODEL_CONFIG.wasmVersion, '1.31.0-dev.20260914-8d85527a0');
  for (const [name, integrity] of Object.entries(MODEL_CONFIG.wasmFiles)) {
    const bytes = readFileSync(new URL(name, wasmDir));
    assert.ok(bytes.byteLength < 100 * 1024 * 1024, `${name} must stay under the GitHub Pages 100 MB file limit`);
    assert.equal(`sha384-${createHash('sha384').update(bytes).digest('base64')}`, integrity, name);
    assert.match(integrity, /^sha384-[A-Za-z0-9+/]+={0,2}$/);
  }
});

test('the published coach worker loads ONNX wasm from the vendored folder, not jsDelivr', () => {
  const worker = readFileSync(new URL('./rca-coach.worker-v13.js', import.meta.url), 'utf8');
  assert.doesNotMatch(worker, /cdn\.jsdelivr\.net/);
  assert.doesNotMatch(worker, /onnxruntime-web@/);
  assert.equal(
    worker.includes('new URL("./vendor/onnx-wasm/ort-wasm-simd-threaded.asyncify.wasm", import.meta.url).href'),
    true,
  );
  assert.equal(
    worker.includes('new URL("./vendor/onnx-wasm/", import.meta.url).href'),
    true,
  );
});

test('the asyncify wasm binary is a valid WebAssembly module', () => {
  const bytes = readFileSync(new URL('ort-wasm-simd-threaded.asyncify.wasm', wasmDir));
  assert.deepEqual([...bytes.subarray(0, 4)], [0x00, 0x61, 0x73, 0x6d]);
  assert.ok(WebAssembly.validate(bytes), 'asyncify wasm failed WebAssembly.validate');
});

test('the unsuffixed Safari-fallback wasm binary is a valid WebAssembly module', () => {
  const bytes = readFileSync(new URL('ort-wasm-simd-threaded.wasm', wasmDir));
  assert.deepEqual([...bytes.subarray(0, 4)], [0x00, 0x61, 0x73, 0x6d]);
  assert.ok(WebAssembly.validate(bytes), 'fallback wasm failed WebAssembly.validate');
});

test('shell cache was bumped and does not precache the 41 MB wasm files', () => {
  const sw = readFileSync(new URL('./sw.js', import.meta.url), 'utf8');
  assert.match(sw, /const CACHE = 'apollo-rca-shell-v57'/);
  assert.doesNotMatch(sw, /ort-wasm-simd-threaded/);
  assert.match(sw, /vendor\/transformers-3\.7\.6\.min\.js/);
});

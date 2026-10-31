// Main-thread transport to the worker. Replaceable (tests use a mock).
import { MODEL_CONFIG } from './ai-config.js';
export function detectCapability() {
  const mem = navigator.deviceMemory; const small = /Mobi|Android|iPhone/i.test(navigator.userAgent) && mem && mem < 4;
  if (typeof Worker === 'undefined') return { supported: false, reason: 'Web Workers unavailable' };
  if (small) return { supported: false, reason: 'Low-memory device; Standard Mode only' };
  if (!navigator.gpu && typeof WebAssembly === 'undefined') return { supported: false, reason: 'Neither WebGPU nor WebAssembly available' };
  return { supported: true, backend: navigator.gpu ? 'WebGPU (WASM fallback)' : 'WASM (CPU)' };
}
export class WorkerTransport {
  constructor() { this.w = null; this.n = 0; this.pend = new Map(); this.onProgress = null; }
  async capability() { return detectCapability(); }
  ensure() {
    if (this.w) return;
    this.w = new Worker(new URL('./ai-worker.js', import.meta.url), { type: 'module' });
    this.w.onmessage = (e) => { const m = e.data; if (m.type === 'progress') return this.onProgress && this.onProgress(m.value); const p = this.pend.get(m.id); if (!p) return; this.pend.delete(m.id); m.type === 'error' ? p.rej(new Error(m.message)) : p.res(m); };
    this.w.onerror = (e) => { this.pend.forEach((p) => p.rej(new Error(e.message || 'Worker error'))); this.pend.clear(); };
  }
  call(msg) { this.ensure(); const id = ++this.n; return new Promise((res, rej) => { this.pend.set(id, { res, rej }); this.w.postMessage({ ...msg, id }); }); }
  async load(onProgress) { this.onProgress = onProgress; await this.call({ type: 'load' }); }
  async generate(messages) { return (await this.call({ type: 'generate', messages })).text; }
  cancel() { if (this.w) this.w.postMessage({ type: 'cancel' }); }
  async unload() { if (this.w) { this.w.terminate(); this.w = null; this.pend.clear(); } }
}

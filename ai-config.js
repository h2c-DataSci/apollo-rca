// Single replaceable model configuration (Layer B). Swap here only.
export const MODEL_CONFIG = {
  id: 'onnx-community/Qwen2.5-0.5B-Instruct',
  label: 'Qwen2.5-0.5B-Instruct (ONNX, q4)',
  license: 'Apache-2.0',
  approxDownloadMB: 400,
  library: '@huggingface/transformers',
  libraryVersion: '3.7.6',
  libraryUrl: './vendor/transformers-3.7.6.min.js',
  // sha384 of the vendored 3.7.6 file. A worker import cannot carry an
  // integrity attribute, so this file is served by the app and checked
  // before it is imported.
  libraryIntegrity: 'sha384-ypqDKlGaciPzMZFxk0iPx9blYGxbZIWTqZX7f6BuiicO9rTfnXfprLBev5KE5OfK',
  // The published coach uses rca-coach.worker-v13.js, which embeds
  // onnxruntime-web 1.31.0-dev.20260914-8d85527a0. Those wasm files are
  // stored under vendor/onnx-wasm/ and loaded same-origin. The asyncify
  // pair is the default; the unsuffixed pair is the Safari < 26 fallback
  // when WebGPU is missing. Files are not in the shell cache (about 41 MB).
  wasmDir: './vendor/onnx-wasm/',
  wasmVersion: '1.31.0-dev.20260914-8d85527a0',
  wasmFiles: {
    'ort-wasm-simd-threaded.asyncify.wasm': 'sha384-JuzrCV6BUmTUbsgNhgU94qo0vZ4l3w0VqgQAKPm0La2hXL9kmv8P9pGenfsWJY9c',
    'ort-wasm-simd-threaded.asyncify.mjs': 'sha384-ik7L7J2uXfXmGuWHh3yOUDPpUslz/dJjcvZgdX5hcItLjxlkEpUF7mpCcATr3Dg8',
    'ort-wasm-simd-threaded.wasm': 'sha384-LrOPe1yNsLVzhsriuQfxO06RWx/XakR0S8uiOMx7HVJP6N/IEaR1EAgJMFeTanif',
    'ort-wasm-simd-threaded.mjs': 'sha384-rwgdUeIyqfd2lxMuhdqXYPnZiluDqSM5liz/q+ulIt4vYtB52NCoTVWBkm1KFOeN',
  },
  dtypeWebGPU: 'q4f16',
  dtypeWasm: 'q4',
  generation: { max_new_tokens: 384, temperature: 0.2, top_p: 0.9, do_sample: true, repetition_penalty: 1.1 },
};
export const LIMITS = { inputChars: 4000, outputChars: 1500, questions: 5, rewrites: 3, issues: 6, hypotheses: 4, events: 12 };
export const AI_VERSION = '1.0.0';

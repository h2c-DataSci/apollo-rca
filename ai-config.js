// Single replaceable model configuration (Layer B). Swap here only.
export const MODEL_CONFIG = {
  id: 'onnx-community/Qwen2.5-0.5B-Instruct',
  label: 'Qwen2.5-0.5B-Instruct (ONNX, q4)',
  license: 'Apache-2.0',
  approxDownloadMB: 400,
  library: '@huggingface/transformers',
  libraryVersion: '3.7.6',
  libraryUrl: 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.6',
  // sha384 of the pinned 3.7.6 file (same bytes as dist/transformers.min.js).
  // A worker import cannot carry an integrity attribute, so the worker checks
  // this hash with a CORS fetch before importing that same URL.
  libraryIntegrity: 'sha384-ypqDKlGaciPzMZFxk0iPx9blYGxbZIWTqZX7f6BuiicO9rTfnXfprLBev5KE5OfK',
  dtypeWebGPU: 'q4f16',
  dtypeWasm: 'q4',
  generation: { max_new_tokens: 384, temperature: 0.2, top_p: 0.9, do_sample: true, repetition_penalty: 1.1 },
};
export const LIMITS = { inputChars: 4000, outputChars: 1500, questions: 5, rewrites: 3, issues: 6, hypotheses: 4, events: 12 };
export const AI_VERSION = '1.0.0';

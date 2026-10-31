// Web Worker: Transformers.js + ONNX model. Loaded lazily; never at first paint.
import { MODEL_CONFIG } from './ai-config.js';
let tf, generator, tokenizer, stopper;
const post = (m) => self.postMessage(m);
self.onmessage = async (e) => {
  const { type, id } = e.data;
  try {
    if (type === 'load') {
      tf = tf || (await import(MODEL_CONFIG.libraryUrl));
      const webgpu = !!(self.navigator && self.navigator.gpu);
      const progress_callback = (p) => { if (p.status === 'progress' && p.total) post({ type: 'progress', value: Math.round((p.loaded / p.total) * 100) }); };
      const opts = webgpu ? { device: 'webgpu', dtype: MODEL_CONFIG.dtypeWebGPU, progress_callback } : { dtype: MODEL_CONFIG.dtypeWasm, progress_callback };
      try { generator = await tf.pipeline('text-generation', MODEL_CONFIG.id, opts); }
      catch (err) { if (!webgpu) throw err; generator = await tf.pipeline('text-generation', MODEL_CONFIG.id, { dtype: MODEL_CONFIG.dtypeWasm, progress_callback }); }
      stopper = new tf.InterruptableStoppingCriteria();
      post({ type: 'loaded', id });
    } else if (type === 'generate') {
      stopper.reset();
      const out = await generator(e.data.messages, { ...MODEL_CONFIG.generation, stopping_criteria: stopper, return_full_text: false });
      const g = out[0].generated_text; post({ type: 'result', id, text: Array.isArray(g) ? g[g.length - 1].content : String(g) });
    } else if (type === 'cancel') { stopper && stopper.interrupt(); }
    else if (type === 'unload') { generator = null; post({ type: 'unloaded', id }); }
  } catch (err) { post({ type: 'error', id, message: String(err && err.message || err) }); }
};

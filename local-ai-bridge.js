// Local and bring-your-own AI. Ollama stays on this computer.
// A user-supplied HTTPS API is used only when that provider is selected.
// There is no silent fallback to a cloud model.

const BRIDGE_STORAGE_KEY = 'h2c-local-ai-bridge-v1';

export const DEFAULT_BRIDGE_CONFIG = {
  enabled: true,
  provider: 'ollama',
  endpoint: 'http://127.0.0.1:11434',
  model: 'qwen3:2b',
  apiKey: '',
  timeoutMs: 25000,
  temperature: 0.2,
  numPredict: 384
};

export const RECOMMENDED_LOCAL_MODELS = [
  {
    id: 'qwen3:2b',
    name: 'Qwen3 (2B)',
    vendor: 'Alibaba Cloud',
    specs: 'Usual Ollama tag for a local Qwen3 2B model. Confirm it with Test Connection.',
    cmd: 'ollama list'
  },
  {
    id: 'gemma2:2b',
    name: 'Google Gemma 2 (2B)',
    vendor: 'Google DeepMind',
    specs: 'Example local tag. Use it only if it is already installed.',
    cmd: 'ollama list'
  },
  {
    id: 'qwen2.5:1.5b',
    name: 'Qwen 2.5 (1.5B)',
    vendor: 'Alibaba Cloud',
    specs: 'Example local tag. Use it only if it is already installed.',
    cmd: 'ollama list'
  },
  {
    id: 'llama3.2:1b',
    name: 'Llama 3.2 (1B)',
    vendor: 'Meta AI',
    specs: 'Example local tag. Use it only if it is already installed.',
    cmd: 'ollama list'
  }
];

function storage() {
  try { return globalThis.localStorage || null; } catch { return null; }
}

export function getBridgeConfig() {
  try {
    const raw = storage()?.getItem(BRIDGE_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_BRIDGE_CONFIG };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_BRIDGE_CONFIG, ...parsed, apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '' };
  } catch {
    return { ...DEFAULT_BRIDGE_CONFIG };
  }
}

export function saveBridgeConfig(cfg) {
  try {
    const updated = { ...getBridgeConfig(), ...cfg };
    storage()?.setItem(BRIDGE_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return { ...DEFAULT_BRIDGE_CONFIG, ...cfg };
  }
}

export function isLoopback(endpoint) {
  try {
    const host = new URL(String(endpoint || '').trim()).hostname.replace(/^\[|\]$/g, '').toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  } catch {
    return false;
  }
}

export function localDaemonUrl(endpoint) {
  let parsed;
  try {
    parsed = new URL(String(endpoint || '').trim());
  } catch {
    throw new Error('Endpoint must be a local address such as http://127.0.0.1:11434');
  }
  if (!isLoopback(parsed.origin) || (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')) {
    throw new Error('Ollama must stay on 127.0.0.1 or localhost. This app will not send the case to another host.');
  }
  if (parsed.username || parsed.password) throw new Error('Credentials in the endpoint are not allowed.');
  return parsed.origin;
}

export function apiEndpoint(endpoint) {
  let parsed;
  try {
    parsed = new URL(String(endpoint || '').trim());
  } catch {
    throw new Error('API address must be a full URL, such as https://api.example.com/v1');
  }
  if (parsed.username || parsed.password) throw new Error('Put the API key in the key field, not in the URL.');
  const loopback = isLoopback(parsed.origin);
  if (!loopback && parsed.protocol !== 'https:') {
    throw new Error('A remote API must use https. Only 127.0.0.1 or localhost may use http.');
  }
  if (loopback && parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Local API address must start with http:// or https://');
  }
  return parsed.href.replace(/\/$/, '');
}

export function pickInstalledQwen(models) {
  const list = (models || []).filter((name) => typeof name === 'string' && name.trim());
  const exact = list.find((name) => name.toLowerCase() === 'qwen3:2b');
  if (exact) return exact;
  return list.find((name) => /qwen3/i.test(name) && /(?:^|[^a-z0-9])2b(?:[^a-z0-9]|$)/i.test(name)) || '';
}

export function stripModelThinking(text) {
  const raw = String(text ?? '');
  const stripped = raw.replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, '').replace(/<thinking\b[^>]*>[\s\S]*?<\/thinking>/gi, '').trim();
  if (!stripped && /<think/i.test(raw)) {
    throw new Error('The model returned only internal reasoning. Nothing was applied.');
  }
  return stripped;
}

function modelNames(list, pick) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => {
    const value = pick(item);
    return typeof value === 'string' ? value.slice(0, 120) : '';
  }).filter(Boolean);
}

function offline(endpoint, error) {
  return { online: false, endpoint: String(endpoint || ''), models: [], error, message: error };
}

function timeoutMs(cfg, fallback) {
  const value = Number(cfg && cfg.timeoutMs);
  return Number.isFinite(value) && value >= 1000 ? value : fallback;
}

async function errorText(res) {
  try {
    const body = await res.text();
    try {
      const parsed = JSON.parse(body);
      const nested = parsed && parsed.error;
      return String((nested && (nested.message || nested)) || parsed.message || body || res.status).slice(0, 300);
    } catch {
      return String(body || res.status).slice(0, 300);
    }
  } catch {
    return String(res.status);
  }
}

function missingModel(message) {
  return /not found|does not exist|unknown model|model .* not/i.test(message);
}

function unreachableMessage(endpoint, provider) {
  const where = provider === 'openai' ? 'API' : 'Ollama';
  return `${where} is not reachable at ${endpoint}. Start it on this computer, or correct the address. This app will not switch to a cloud model.`;
}

export async function testLocalDaemonConnection(endpoint = 'http://127.0.0.1:11434') {
  return testConfiguredConnection({ provider: 'ollama', endpoint });
}

export async function testConfiguredConnection(options = {}) {
  const cfg = { ...getBridgeConfig(), ...options };
  if (cfg.provider === 'browser') return offline(cfg.endpoint, 'Browser ONNX is selected. No daemon call was made.');
  if (cfg.provider === 'openai') return testOpenAi(cfg);
  return testOllama(cfg.endpoint);
}

async function testOllama(endpoint) {
  let url;
  try { url = localDaemonUrl(endpoint); }
  catch (error) { return offline(endpoint, error.message); }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch(`${url}/api/tags`, { method: 'GET', headers: { Accept: 'application/json' }, signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) {
      const detail = await errorText(res);
      return offline(url, `Ollama returned HTTP ${res.status}. ${detail}`);
    }
    const data = await res.json();
    const models = modelNames(data.models, (m) => m && (m.name || m.model));
    return { online: true, type: 'ollama', endpoint: url, models, message: `Connected to Ollama on ${url} (${models.length} model(s) installed).` };
  } catch (err) {
    clearTimeout(timer);
    const timedOut = err && err.name === 'AbortError';
    return offline(url, timedOut ? 'Connection timed out' : unreachableMessage(url, 'ollama'));
  }
}

async function testOpenAi(cfg) {
  let url;
  try { url = apiEndpoint(cfg.endpoint); }
  catch (error) { return offline(cfg.endpoint, error.message); }
  if (!isLoopback(url) && !String(cfg.apiKey || '').trim()) {
    return offline(url, 'Add your API key. This app does not include one.');
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const headers = { Accept: 'application/json' };
    if (cfg.apiKey) headers.Authorization = `Bearer ${cfg.apiKey}`;
    const res = await fetch(modelsUrl(url), { method: 'GET', headers, signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) {
      const detail = await errorText(res);
      if (res.status === 401 || res.status === 403) return offline(url, `The API rejected the key (HTTP ${res.status}).`);
      return offline(url, `The API returned HTTP ${res.status}. ${detail}`);
    }
    const data = await res.json();
    const models = modelNames(data.data || data.models, (m) => m && (m.id || m.name));
    return { online: true, type: 'openai', endpoint: url, models, message: `Connected to the API at ${url}.` };
  } catch (err) {
    clearTimeout(timer);
    return offline(url, err && err.name === 'AbortError' ? 'Connection timed out' : unreachableMessage(url, 'openai'));
  }
}

function modelsUrl(endpoint) {
  return /\/models$/.test(endpoint) ? endpoint : endpoint.endsWith('/v1') ? `${endpoint}/models` : `${endpoint}/v1/models`;
}

function chatUrl(endpoint) {
  if (/\/chat\/completions$/.test(endpoint)) return endpoint;
  return endpoint.endsWith('/v1') ? `${endpoint}/chat/completions` : `${endpoint}/v1/chat/completions`;
}

function visibleAnswer(payload) {
  const message = payload && payload.message || {};
  const choice = payload && payload.choices && payload.choices[0] && payload.choices[0].message || {};
  const text = stripModelThinking(message.content || choice.content || payload.response || '');
  if (!text) throw new Error('The model returned an empty answer. Nothing was applied.');
  return text;
}

function createVisibleSink(onChunk) {
  let pending = '';
  let hidden = false;
  let out = '';
  const emit = (piece) => {
    if (!piece) return;
    out += piece;
    if (onChunk) onChunk(piece);
  };
  return {
    push(piece) {
      pending += String(piece || '');
      while (pending) {
        if (hidden) {
          const end = pending.search(/<\/think>/i);
          if (end < 0) {
            pending = pending.slice(-8);
            return;
          }
          pending = pending.slice(end).replace(/^<\/think>/i, '');
          hidden = false;
          continue;
        }
        const start = pending.search(/<think\b/i);
        if (start < 0) {
          const hold = pending.match(/<$|<t$|<th$|<thi$|<thin$|<think$/i);
          const cut = hold ? hold[0].length : 0;
          emit(pending.slice(0, pending.length - cut));
          pending = pending.slice(pending.length - cut);
          return;
        }
        emit(pending.slice(0, start));
        pending = pending.slice(start);
        const open = pending.match(/^<think\b[^>]*>/i);
        if (!open) return;
        pending = pending.slice(open[0].length);
        hidden = true;
      }
    },
    finish() {
      if (!hidden && pending) emit(pending);
      pending = '';
      return out.trim();
    }
  };
}

function chunkText(obj) {
  const message = obj && obj.message || {};
  const choice = obj && obj.choices && obj.choices[0] || {};
  const delta = choice.delta || {};
  if (typeof delta.content === 'string') return delta.content;
  if (typeof message.content === 'string') return message.content;
  if (typeof obj.response === 'string') return obj.response;
  if (choice.message && typeof choice.message.content === 'string') return choice.message.content;
  return '';
}

export function collectStreamedAnswer(raw, onChunk) {
  const text = String(raw ?? '');
  const sink = createVisibleSink(onChunk);
  const lines = text.split(/\r?\n/);
  let mode = '';
  let error = '';
  const apply = (obj) => {
    if (obj && obj.error) error = String(typeof obj.error === 'string' ? obj.error : (obj.error.message || obj.error)).slice(0, 300);
    const piece = chunkText(obj);
    if (piece) sink.push(piece);
  };
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (!mode) mode = trimmed.startsWith('data:') ? 'sse' : 'ndjson';
    if (mode === 'sse') {
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try { apply(JSON.parse(payload)); } catch { mode = 'json'; break; }
      continue;
    }
    try { apply(JSON.parse(trimmed)); }
    catch { mode = 'json'; break; }
  }
  if (mode === 'json' || !mode) {
    let obj;
    try { obj = JSON.parse(text); }
    catch { throw new Error('The model response could not be read.'); }
    const answer = visibleAnswer(obj);
    if (onChunk) onChunk(answer);
    return answer;
  }
  const answer = sink.finish();
  if (!answer) {
    if (error) throw new Error(error);
    throw new Error('The model returned only internal reasoning. Nothing was applied.');
  }
  return answer;
}

let activeGeneration = null;

export function abortActiveGeneration() {
  if (activeGeneration) activeGeneration.reason = 'cancel';
  activeGeneration?.ctrl.abort();
}

function beginGeneration(ms) {
  const ctrl = new AbortController();
  const generation = { ctrl, reason: '' };
  activeGeneration = generation;
  const timer = setTimeout(() => {
    generation.reason = 'timeout';
    ctrl.abort();
  }, ms);
  return {
    signal: ctrl.signal,
    finish() {
      clearTimeout(timer);
      if (activeGeneration === generation) activeGeneration = null;
    },
    failure(err, label) {
      if (err && err.name === 'AbortError') {
        if (generation.reason === 'cancel') throw new Error('Generation cancelled. Nothing was changed.');
        throw new Error(`${label} generation timed out after ${Math.round(ms / 1000)}s. Nothing was changed.`);
      }
    }
  };
}

async function answerFromResponse(res, onChunk) {
  const reader = res.body && typeof res.body.getReader === 'function' ? res.body.getReader() : null;
  if (!reader) return collectStreamedAnswer(await res.text(), onChunk);
  const decoder = new TextDecoder();
  const sink = createVisibleSink(onChunk);
  let raw = '';
  let buf = '';
  let mode = '';
  let error = '';
  let streamed = false;
  const apply = (obj) => {
    if (obj && obj.error) error = String(typeof obj.error === 'string' ? obj.error : (obj.error.message || obj.error)).slice(0, 300);
    const piece = chunkText(obj);
    if (piece) sink.push(piece);
  };
  const take = (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (!mode) mode = trimmed.startsWith('data:') ? 'sse' : 'ndjson';
    if (mode === 'json') return;
    if (mode === 'sse') {
      if (!trimmed.startsWith('data:')) return;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') return;
      try { apply(JSON.parse(payload)); streamed = true; } catch { mode = 'json'; }
      return;
    }
    try { apply(JSON.parse(trimmed)); streamed = true; }
    catch { mode = 'json'; }
  };
  try {
    while (true) {
      const step = await reader.read();
      const chunk = decoder.decode(step.value || new Uint8Array(), { stream: !step.done });
      raw += chunk;
      buf += chunk;
      const lines = buf.split(/\n/);
      buf = lines.pop() || '';
      for (const line of lines) take(line);
      if (step.done) break;
    }
  } finally {
    reader.releaseLock?.();
  }
  if (buf) take(buf);
  if (mode === 'json' || !streamed) return collectStreamedAnswer(raw, onChunk);
  const answer = sink.finish();
  if (!answer) {
    if (error) throw new Error(error);
    throw new Error('The model returned only internal reasoning. Nothing was applied.');
  }
  return answer;
}

export async function executeLocalChat(messages, options = {}) {
  const cfg = { ...getBridgeConfig(), ...options };
  if (cfg.provider === 'openai') return openAiChat(cfg, messages);
  return ollamaChat(cfg, messages);
}

async function ollamaChat(cfg, messages) {
  const url = localDaemonUrl(cfg.endpoint);
  const ms = timeoutMs(cfg, 25000);
  const generation = beginGeneration(ms);
  let res;
  try {
    res = await fetch(`${url}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' },
      body: JSON.stringify({
        model: cfg.model,
        messages: messages.map((m) => ({ role: m.role || 'user', content: String(m.content || '') })),
        stream: true,
        think: false,
        options: { temperature: cfg.temperature ?? 0.2, num_predict: cfg.numPredict ?? 384 }
      }),
      signal: generation.signal
    });
  } catch (err) {
    generation.finish();
    try { generation.failure(err, 'Local model'); } catch (e) { throw e; }
    throw new Error(unreachableMessage(url, 'ollama'));
  }
  if (!res.ok) {
    generation.finish();
    const detail = await errorText(res);
    if (missingModel(detail)) throw new Error(`Model "${cfg.model}" is not installed at ${url}. Nothing was downloaded.`);
    if (res.status !== 404) throw new Error(`Ollama returned HTTP ${res.status}. ${detail}`);
    return sameHostOpenAi(url, cfg, messages);
  }
  try {
    return await answerFromResponse(res, cfg.onChunk);
  } catch (err) {
    try { generation.failure(err, 'Local model'); } catch (e) { throw e; }
    throw err;
  } finally {
    generation.finish();
  }
}

async function sameHostOpenAi(url, cfg, messages) {
  const ms = timeoutMs(cfg, 25000);
  const generation = beginGeneration(ms);
  try {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        model: cfg.model,
        messages: messages.map((m) => ({ role: m.role || 'user', content: String(m.content || '') })),
        stream: true,
        temperature: cfg.temperature ?? 0.2,
        max_tokens: cfg.numPredict ?? 384
      }),
      signal: generation.signal
    });
    if (!res.ok) {
      const detail = await errorText(res);
      if (missingModel(detail)) throw new Error(`Model "${cfg.model}" is not installed at ${url}. Nothing was downloaded.`);
      throw new Error(`Local server returned HTTP ${res.status}. ${detail}`);
    }
    return await answerFromResponse(res, cfg.onChunk);
  } catch (err) {
    try { generation.failure(err, 'Local model'); } catch (e) { throw e; }
    throw err;
  } finally {
    generation.finish();
  }
}

async function openAiChat(cfg, messages) {
  const url = apiEndpoint(cfg.endpoint);
  if (!isLoopback(url) && !String(cfg.apiKey || '').trim()) throw new Error('Add your API key. This app does not include one.');
  const ms = timeoutMs(cfg, 25000);
  const generation = beginGeneration(ms);
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (cfg.apiKey) headers.Authorization = `Bearer ${cfg.apiKey}`;
  try {
    const res = await fetch(chatUrl(url), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: cfg.model,
        messages: messages.map((m) => ({ role: m.role || 'user', content: String(m.content || '') })),
        stream: true,
        temperature: cfg.temperature ?? 0.2,
        max_tokens: cfg.numPredict ?? 384
      }),
      signal: generation.signal
    });
    if (!res.ok) {
      const detail = await errorText(res);
      if (res.status === 401 || res.status === 403) throw new Error('The API rejected the key. Nothing was sent to another provider.');
      if (missingModel(detail)) throw new Error(`Model "${cfg.model}" is not available at that API. Nothing was downloaded.`);
      throw new Error(`The API returned HTTP ${res.status}. ${detail}`);
    }
    return await answerFromResponse(res, cfg.onChunk);
  } catch (err) {
    try { generation.failure(err, 'API'); } catch (e) { throw e; }
    if (err instanceof TypeError) throw new Error(unreachableMessage(url, 'openai'));
    throw err;
  } finally {
    generation.finish();
  }
}

export async function prepareConfiguredModel() {
  const cfg = getBridgeConfig();
  if (cfg.provider === 'browser' || cfg.enabled === false) throw new Error('External AI is off.');
  const status = await testConfiguredConnection(cfg);
  if (!status.online) throw new Error(status.error || status.message || 'The configured AI is not reachable.');
  if (cfg.provider === 'ollama' && status.models.length && !status.models.includes(cfg.model)) {
    const picked = pickInstalledQwen(status.models);
    if (picked && (cfg.model === 'qwen3:2b' || cfg.model === 'gemma2:2b')) {
      saveBridgeConfig({ model: picked, enabled: true });
      return picked;
    }
    throw new Error(`Model "${cfg.model}" is not installed. Installed: ${status.models.slice(0, 8).join(', ')}. Nothing was downloaded.`);
  }
  return cfg.model;
}

export async function generateWithConfiguredModel(promptText) {
  const cfg = getBridgeConfig();
  if (cfg.provider === 'browser' || cfg.enabled === false) throw new Error('External AI is off.');
  let shown = 0;
  return executeLocalChat([
    { role: 'system', content: 'You are an RCA Coach for Apollo-style analysis. Reply with one JSON object only. Do not include a thinking trace.' },
    { role: 'user', content: String(promptText || '') }
  ], {
    ...cfg,
    onChunk(piece) {
      shown += piece.length;
      const el = typeof document !== 'undefined' ? document.querySelector('.h2c-bridge-feedback') : null;
      if (!el) return;
      el.style.display = 'block';
      el.style.color = '#065f46';
      el.textContent = `Receiving answer (${shown} characters). Reasoning is not shown.`;
    }
  });
}

export function installExternalCoach() {
  globalThis.h2cUseExternalAi = () => {
    const cfg = getBridgeConfig();
    return cfg.enabled !== false && cfg.provider !== 'browser';
  };
  globalThis.h2cExternalReady = () => prepareConfiguredModel();
  globalThis.h2cExternalGenerate = (prompt) => generateWithConfiguredModel(prompt);
  globalThis.h2cExternalAbort = () => abortActiveGeneration();
}

installExternalCoach();

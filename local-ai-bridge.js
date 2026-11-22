// Local and bring-your-own AI. Ollama stays on this computer.
// A user-supplied HTTPS API is used only when that provider is selected.
// There is no silent fallback to a cloud model.

import { PROVIDER_PRESETS, LOCAL_PRESETS, presetModelIds } from './provider-presets.js';

export const DEFAULT_BRIDGE_CONFIG = {
  enabled: true,
  provider: 'ollama',
  mode: 'local',
  preset: '',
  providerName: '',
  apiStyle: '',
  extraHeaders: {},
  rememberKey: false,
  cloudConsent: false,
  endpoint: 'http://127.0.0.1:11434',
  model: 'qwen3:2b',
  apiKey: '',
  timeoutMs: 25000,
  temperature: 0.2,
  numPredict: 384
};

export const REMEMBER_KEY = 'h2c-coach-remember-v1';

function memoryStore() {
  try { return globalThis.localStorage || null; } catch { return null; }
}

export function clearRememberedKey() {
  const store = memoryStore();
  try { if (store && typeof store.removeItem === 'function') store.removeItem(REMEMBER_KEY); } catch {}
}

export function loadRememberedKey() {
  const store = memoryStore();
  if (!store || typeof store.getItem !== 'function') return null;
  try {
    const raw = store.getItem(REMEMBER_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && data.remembered === true && typeof data.apiKey === 'string') return data;
  } catch {}
  return null;
}

export function persistRememberedKey(cfg) {
  if (!cfg || cfg.rememberKey !== true) { clearRememberedKey(); return; }
  const store = memoryStore();
  if (!store || typeof store.setItem !== 'function') return;
  try {
    store.setItem(REMEMBER_KEY, JSON.stringify({
      remembered: true,
      provider: cfg.provider || '',
      preset: cfg.preset || '',
      endpoint: cfg.endpoint || '',
      apiKey: cfg.apiKey || ''
    }));
  } catch {}
}

export function redactConfig(cfg) {
  const out = { ...(cfg || {}) };
  delete out.apiKey;
  if (out.extraHeaders && typeof out.extraHeaders === 'object') {
    const headers = {};
    for (const [key, value] of Object.entries(out.extraHeaders)) {
      if (/authorization|api[-_]?key|secret|token|password/i.test(key)) continue;
      headers[key] = value;
    }
    out.extraHeaders = headers;
  }
  return out;
}

export function parseExtraHeaders(raw) {
  const out = {};
  if (!raw) return out;
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    for (const [key, value] of Object.entries(raw)) {
      const name = String(key || '').trim();
      const text = String(value ?? '').trim();
      if (name && text && !/[\r\n]/.test(name + text)) out[name] = text;
    }
    return out;
  }
  for (const line of String(raw).split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx < 1) continue;
    const name = line.slice(0, idx).trim();
    const text = line.slice(idx + 1).trim();
    if (name && text && !/[\r\n]/.test(name + text)) out[name] = text;
  }
  return out;
}

export function sanitizeExtraHeaders(raw, hasApiKey = false) {
  const out = {};
  for (const [key, value] of Object.entries(parseExtraHeaders(raw))) {
    if (/^(cookie|set-cookie|host|content-length|connection|transfer-encoding)$/i.test(key)) continue;
    if (hasApiKey && /^authorization$/i.test(key)) continue;
    out[key] = value;
  }
  return out;
}

export function resolveApiStyle(cfg) {
  const explicit = String(cfg?.apiStyle || '').toLowerCase();
  if (explicit === 'anthropic' || explicit === 'gemini' || explicit === 'openai') return explicit;
  if (cfg?.preset === 'anthropic' || String(cfg?.endpoint || '').includes('api.anthropic.com')) return 'anthropic';
  if (cfg?.preset === 'google' || String(cfg?.endpoint || '').startsWith('https://generativelanguage.googleapis.com/')) return 'gemini';
  return 'openai';
}

export function usesChatProtocol(cfg) {
  if (resolveApiStyle(cfg) !== 'openai') return true;
  if (cfg?.provider === 'openai' || cfg?.provider === 'freellmapi' || cfg?.preset === 'freellmapi' || cfg?.preset === 'custom' || cfg?.preset === 'lmstudio' || cfg?.preset === 'mistral' || cfg?.preset === 'huggingface' || cfg?.preset === 'anthropic') return true;
  try {
    const path = new URL(String(cfg?.endpoint || '').trim()).pathname.replace(/\/$/, '');
    return path === '/v1' || path.endsWith('/v1') || path.includes('/openai');
  } catch { return false; }
}

export function extractApiKeyFromText(raw) {
  const text = String(raw || '').slice(0, 65536).trim();
  if (!text) throw new Error('The key file is empty.');
  if (text.startsWith('{')) {
    try {
      const obj = JSON.parse(text);
      for (const field of ['apiKey', 'api_key', 'unifiedKey', 'unified_key', 'FREELMAPI_API_KEY', 'FREELM_API_KEY', 'key', 'token']) {
        if (typeof obj?.[field] === 'string' && obj[field].trim()) return obj[field].trim();
      }
    } catch {}
  }
  const unified = text.match(/\bfreellmapi-[A-Za-z0-9._-]{8,}\b/);
  if (unified) return unified[0];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;
    const kv = line.match(/^(?:export\s+)?[A-Za-z0-9_.-]+\s*[:=]\s*["']?([^\s"']+)["']?/);
    if (kv && kv[1]) return kv[1].replace(/^Bearer\s+/i, '').trim();
    const bearer = line.match(/^Bearer\s+([^\s'"]+)/i);
    if (bearer && bearer[1]) return bearer[1].trim();
    const token = line.split(/\s+/)[0].replace(/^["']|["']$/g, '').trim();
    if (token) return token;
  }
  throw new Error('Could not find an API key in that file.');
}

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

const sharedConfig = Symbol.for('h2c.bridge.config');
const sharedGeneration = Symbol.for('h2c.bridge.generation');

function readConfig() {
  if (!globalThis[sharedConfig]) globalThis[sharedConfig] = { ...DEFAULT_BRIDGE_CONFIG };
  return globalThis[sharedConfig];
}

export function getBridgeConfig() { return { ...readConfig() }; }

export function saveBridgeConfig(cfg) {
  const current = readConfig();
  const destinationChanged = ['endpoint', 'provider', 'preset', 'mode'].some((key) => key in cfg && cfg[key] !== current[key]);
  const next = { ...current, ...(destinationChanged ? { apiKey: '', cloudConsent: false } : {}), ...cfg };
  if (next.extraHeaders) next.extraHeaders = parseExtraHeaders(next.extraHeaders);
  globalThis[sharedConfig] = next;
  if (next.rememberKey === true) persistRememberedKey(next);
  else if ('rememberKey' in (cfg || {}) || destinationChanged) clearRememberedKey();
  return getBridgeConfig();
}

function configuredOptions(options) {
  const saved = getBridgeConfig();
  const destinationChanged = ['endpoint', 'provider', 'preset', 'mode'].some((key) => key in options && options[key] !== saved[key]);
  return { ...saved, ...(destinationChanged ? { apiKey: '', cloudConsent: false, ...(options.provider === 'openai' ? { numPredict: 1536 } : {}) } : {}), ...options };
}

export function clearBridgeSession() { abortActiveGeneration(); globalThis[sharedConfig] = { ...DEFAULT_BRIDGE_CONFIG }; clearRememberedKey(); }

export function validateCloudConfig(cfg, requireConsent = true) {
  const url = apiEndpoint(cfg.endpoint);
  if (!isLoopback(url) && requireConsent && cfg.cloudConsent !== true) throw new Error('Confirm cloud processing before sending investigation information.');
  if (cfg.mode === 'free') {
    if (cfg.preset === 'custom') {
      if (!String(cfg.model || '').trim()) throw new Error('Choose a model first.');
    } else {
      const preset = PROVIDER_PRESETS.find((item) => item.id === cfg.preset && item.free);
      const ids = presetModelIds(preset);
      if (!preset || url !== preset.endpoint || (ids.length && !ids.includes(cfg.model))) throw new Error('Free cloud mode requires a listed free provider and model. No paid fallback was used.');
    }
  }
  if (requireConsent && !String(cfg.model || '').trim()) throw new Error('Choose a model first.');
  return url;
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
  const raw = String(endpoint || '').trim();
  if (!raw) throw new Error('Enter the API address, such as https://api.deepseek.com/v1, or choose DeepSeek (paid API).');
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error('API address must be a full URL, such as https://api.deepseek.com/v1');
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) throw new Error('API address must not contain credentials, query parameters or fragments. Put the API key in the key field.');
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
  return Number.isFinite(value) && value >= 1000 ? Math.min(value, 120000) : fallback;
}

// Inspect only for a known recovery category; never echo provider bodies that
// may contain investigation text, credentials or internal diagnostic details.
async function errorText(res) {
  try {
    const body = await res.text();
    return missingModel(body) ? 'Model not found.' : 'The request was rejected by the server.';
  } catch { return 'The server response could not be read.'; }
}

function missingModel(message) {
  return /not found|does not exist|unknown model|model .* not/i.test(message);
}

function unreachableMessage(endpoint, provider) {
  const where = provider === 'openai' ? 'API' : 'Ollama';
  return provider === 'openai' ? `API connection failed. Check the address, internet connection and browser access (CORS). If the provider blocks browser requests, it cannot be used from this page; no proxy is used. No other provider was called.` : `${where} is not reachable at ${endpoint}. Start the local server on this computer, then retry. Browser local-network permission or origin settings may be required. No cloud fallback was used.`;
}

export async function testLocalDaemonConnection(endpoint = 'http://127.0.0.1:11434') {
  return testConfiguredConnection({ provider: 'ollama', endpoint });
}

export async function testConfiguredConnection(options = {}) {
  const cfg = configuredOptions(options);
  if (cfg.provider === 'browser') return offline(cfg.endpoint, 'Browser ONNX is selected. No daemon call was made.');
  if (cfg.provider === 'ollama' && !usesChatProtocol(cfg)) return testOllama(cfg.endpoint);
  return testOpenAi(cfg);
}

async function testOllama(endpoint) {
  let url;
  try { url = localDaemonUrl(endpoint); }
  catch (error) { return offline(endpoint, error.message); }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch(`${url}/api/tags`, { method: 'GET', headers: { Accept: 'application/json' }, signal: ctrl.signal, redirect: 'error' });
    if (!res.ok) {
      const detail = await errorText(res);
      return offline(url, `Ollama returned HTTP ${res.status}. ${detail}`);
    }
    const data = await res.json();
    const models = modelNames(data.models, (m) => m && (m.name || m.model));
    clearTimeout(timer);
    return { online: true, type: 'ollama', endpoint: url, models, message: `Connected to Ollama on ${url} (${models.length} model(s) installed).` };
  } catch (err) {
    clearTimeout(timer);
    const timedOut = err && err.name === 'AbortError';
    return offline(url, timedOut ? 'Connection timed out' : unreachableMessage(url, 'ollama'));
  } finally { clearTimeout(timer); }
}

async function testOpenAi(cfg) {
  let url;
  try { url = validateCloudConfig(cfg, false); }
  catch (error) { return offline(cfg.endpoint, error.message); }
  if ((!isLoopback(url) || cfg?.preset === 'freellmapi' || cfg?.provider === 'freellmapi') && !String(cfg.apiKey || '').trim()) {
    return offline(url, cfg?.preset === 'freellmapi' || cfg?.provider === 'freellmapi'
      ? 'Add your FreeLLMAPI unified key (or load keys_FreeLLMAPI.txt).'
      : 'Add your API key. This app does not include one.');
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const headers = cloudHeaders(cfg);
    const res = await fetch(testModelsUrl(cfg, url), { method: 'GET', headers: testHeaders(cfg), signal: ctrl.signal, redirect: 'error', cache: 'no-store' });
    if (!res.ok) {
      const detail = await errorText(res);
      if (res.status === 429) return offline(url, 'Provider quota or rate limit reached. Try later or choose Local AI. No paid fallback was used.');
      if (res.status === 401 || res.status === 403) return offline(url, `The API rejected the key (HTTP ${res.status}). Check the key and try again.`);
      if (res.status === 404 || missingModel(detail)) return offline(url, `Model not found (HTTP ${res.status}). ${detail}`);
      return offline(url, `The API returned HTTP ${res.status}. ${detail}`);
    }
    const data = await res.json();
    const models = modelNames(data.data || data.models, (m) => m && (m.id || m.name));
    clearTimeout(timer);
    return { online: true, type: 'openai', endpoint: url, models, message: `Connected to the API at ${url}.` };
  } catch (err) {
    clearTimeout(timer);
    return offline(url, err && err.name === 'AbortError' ? 'Connection timed out' : (err && err.name === 'TypeError' ? unreachableMessage(url, 'openai') : (err && err.message) || unreachableMessage(url, 'openai')));
  } finally { clearTimeout(timer); }
}

export function modelsUrl(endpoint) {
  const base = endpoint.replace(/\/(?:chat\/completions|models)$/, '');
  return `${base}${new URL(base).pathname === '/' ? '/v1' : ''}/models`;
}

export function chatUrl(endpoint) {
  const base = endpoint.replace(/\/(?:chat\/completions|models)$/, '');
  return `${base}${new URL(base).pathname === '/' ? '/v1' : ''}/chat/completions`;
}

function responseFailure(obj) {
  if (obj?.promptFeedback?.blockReason) return 'The provider blocked the request. Nothing was applied.';
  if (obj?.error) return 'The provider reported a generation error. Nothing was applied.';
  const reason = String(obj?.choices?.[0]?.finish_reason || obj?.done_reason || obj?.candidates?.[0]?.finishReason || '').toLowerCase();
  if (!reason || reason === 'stop') return '';
  return `The model did not finish normally (${reason.slice(0, 40)}). Nothing was applied.`;
}

function geminiText(obj) {
  const parts = obj?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts.filter((part) => part && typeof part.text === 'string' && part.thought !== true).map((part) => part.text).join('');
}

function visibleAnswer(payload) {
  const failure = responseFailure(payload); if (failure) throw new Error(failure);
  const message = payload && payload.message || {};
  const choice = payload && payload.choices && payload.choices[0] && payload.choices[0].message || {};
  const text = stripModelThinking(message.content || choice.content || payload.response || geminiText(payload) || '');
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
  return geminiText(obj);
}

export function collectStreamedAnswer(raw, onChunk) {
  const text = String(raw ?? '');
  const sink = createVisibleSink(onChunk);
  const lines = text.split(/\r?\n/);
  let mode = '';
  let error = '';
  let requiresEnd = false;
  let ended = false;
  const apply = (obj) => {
    error = responseFailure(obj) || error;
    if (obj?.done === false || obj?.choices?.[0]?.delta) requiresEnd = true;
    if (obj?.done === true || obj?.choices?.[0]?.finish_reason === 'stop') ended = true;
    const piece = chunkText(obj);
    if (piece) sink.push(piece);
  };
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(':') || /^(event|id|retry):/.test(trimmed)) continue;
    if (!mode) mode = trimmed.startsWith('data:') ? 'sse' : 'ndjson';
    if (mode === 'sse') {
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') { ended = true; continue; }
      if (!payload) continue;
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
  if (error) throw new Error(error);
  if (requiresEnd && !ended) throw new Error('The model stream ended early. Nothing was applied.');
  const answer = sink.finish();
  if (!answer) {
    if (error) throw new Error(error);
    throw new Error('The model returned only internal reasoning. Nothing was applied.');
  }
  return answer;
}

export function abortActiveGeneration() {
  const active = globalThis[sharedGeneration];
  if (active) active.reason = 'cancel';
  active?.ctrl.abort();
}

function beginGeneration(ms) {
  if (globalThis[sharedGeneration]) throw new Error('A generation is already running. Cancel it or wait for completion.');
  const ctrl = new AbortController();
  const generation = { ctrl, reason: '' };
  globalThis[sharedGeneration] = generation;
  const timer = setTimeout(() => {
    generation.reason = 'timeout';
    ctrl.abort();
  }, ms);
  return {
    signal: ctrl.signal,
    finish() {
      clearTimeout(timer);
      if (globalThis[sharedGeneration] === generation) globalThis[sharedGeneration] = null;
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
  let requiresEnd = false;
  let ended = false;
  let streamed = false;
  const apply = (obj) => {
    error = responseFailure(obj) || error;
    if (obj?.done === false || obj?.choices?.[0]?.delta) requiresEnd = true;
    if (obj?.done === true || obj?.choices?.[0]?.finish_reason === 'stop') ended = true;
    const piece = chunkText(obj);
    if (piece) sink.push(piece);
  };
  const take = (line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(':') || /^(event|id|retry):/.test(trimmed)) return;
    if (!mode) mode = trimmed.startsWith('data:') ? 'sse' : 'ndjson';
    if (mode === 'json') return;
    if (mode === 'sse') {
      if (!trimmed.startsWith('data:')) return;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') { ended = true; return; }
      if (!payload) return;
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
  if (error) throw new Error(error);
  if (requiresEnd && !ended) throw new Error('The model stream ended early. Nothing was applied.');
  const answer = sink.finish();
  if (!answer) {
    if (error) throw new Error(error);
    throw new Error('The model returned only internal reasoning. Nothing was applied.');
  }
  return answer;
}

export async function executeLocalChat(messages, options = {}) {
  const cfg = configuredOptions(options);
  if (cfg.enabled === false || cfg.provider === 'browser') throw new Error('External AI is off.');
  if (!Array.isArray(messages) || JSON.stringify(messages).length > 64000) throw new Error('The AI request is too large. Select a smaller task or shorten the context.');
  if (cfg.provider === 'openai' || usesChatProtocol(cfg)) return openAiChat(cfg, messages);
  return ollamaChat(cfg, messages);
}

async function ollamaChat(cfg, messages) {
  const url = localDaemonUrl(cfg.endpoint);
  if (/(?:^|[-:])cloud(?:$|[-:])/i.test(cfg.model)) throw new Error('Cloud-backed Ollama models are not allowed in Local AI mode.');
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
      signal: generation.signal,
      redirect: 'error'
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
      signal: generation.signal,
      redirect: 'error'
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

function isGoogle(cfg) {
  return resolveApiStyle(cfg) === 'gemini';
}

function isAnthropic(cfg) {
  return resolveApiStyle(cfg) === 'anthropic';
}

function cloudHeaders(cfg, json = false) {
  const headers = { Accept: 'application/json', ...sanitizeExtraHeaders(cfg.extraHeaders, !!cfg.apiKey) };
  if (json) headers['Content-Type'] = 'application/json';
  if (!cfg.apiKey) return headers;
  if (isGoogle(cfg)) headers['x-goog-api-key'] = cfg.apiKey;
  else if (isAnthropic(cfg)) {
    headers['x-api-key'] = cfg.apiKey;
    headers['anthropic-version'] = headers['anthropic-version'] || '2023-06-01';
  } else headers.Authorization = `Bearer ${cfg.apiKey}`;
  return headers;
}

function testHeaders(cfg) {
  return cloudHeaders(cfg, false);
}

export function testModelsUrl(cfg, endpoint) {
  const base = endpoint.replace(/\/$/, '');
  if (isAnthropic(cfg)) return `${base}/v1/models`;
  if (isGoogle(cfg)) return `${base}/models`;
  return modelsUrl(endpoint);
}

export function anthropicMessagesUrl(endpoint) {
  const base = String(endpoint || '').replace(/\/$/, '');
  return base.endsWith('/v1') ? `${base}/messages` : `${base}/v1/messages`;
}

export function anthropicRequestBody(cfg, messages) {
  const system = [];
  const chat = [];
  for (const message of messages) {
    const text = String(message.content || '');
    if ((message.role || 'user') === 'system') system.push(text);
    else chat.push({ role: message.role === 'assistant' ? 'assistant' : 'user', content: text });
  }
  const body = {
    model: cfg.model,
    max_tokens: cfg.numPredict ?? 1536,
    messages: chat.length ? chat : [{ role: 'user', content: '' }]
  };
  if (system.length) body.system = system.join('\n\n');
  return body;
}

export function buildChatRequest(cfg, messages) {
  const url = apiEndpoint(cfg.endpoint);
  const headers = cloudHeaders(cfg, true);
  if (isAnthropic(cfg)) return { url: anthropicMessagesUrl(url), headers, body: anthropicRequestBody(cfg, messages) };
  if (isGoogle(cfg)) return { url: googleGenerateUrl(url, cfg.model), headers, body: googleRequestBody(cfg, messages) };
  return { url: chatUrl(url), headers, body: cloudRequestBody(cfg, messages, url) };
}

export function googleGenerateUrl(endpoint, model) {
  return `${String(endpoint || '').replace(/\/$/, '')}/models/${encodeURIComponent(model)}:generateContent`;
}

export function googleRequestBody(cfg, messages) {
  const system = [];
  const contents = [];
  for (const message of messages) {
    const text = String(message.content || '');
    if ((message.role || 'user') === 'system') system.push(text);
    else contents.push({ role: message.role === 'assistant' ? 'model' : 'user', parts: [{ text }] });
  }
  const body = {
    contents: contents.length ? contents : [{ role: 'user', parts: [{ text: '' }] }],
    generationConfig: { temperature: cfg.temperature ?? 0.2, maxOutputTokens: cfg.numPredict ?? 1536, responseMimeType: 'application/json' }
  };
  if (system.length) {
    const instruction = { parts: [{ text: system.join('\n\n') }] };
    if (/^gemma-4-/.test(cfg.model)) instruction.role = 'system';
    body.systemInstruction = instruction;
  }
  return body;
}

function deepseekModelId(model) {
  const name = String(model || '').trim();
  if (/^deepseek[-_ ]v4(?:\.1)?[-_ ]flash(?:[-_ ]1017)?$/i.test(name) || /^deepseek-v4-flash(?:-vision-exp)?$/i.test(name)) return 'deepseek-flash';
  return name;
}

function cloudRequestBody(cfg, messages, url) {
  const limit = cfg.numPredict ?? 1536;
  const deepseek = new URL(url).hostname === 'api.deepseek.com';
  const body = {
    model: deepseek ? deepseekModelId(cfg.model) : cfg.model,
    messages: messages.map((m) => ({ role: m.role || 'user', content: String(m.content || '') })),
    stream: true
  };
  if (cfg.preset === 'groq' && url === 'https://api.groq.com/openai/v1' && /^openai\/gpt-oss-(?:20b|120b)$/.test(cfg.model)) {
    return { ...body, max_completion_tokens: limit, reasoning_effort: 'low', include_reasoning: false, response_format: { type: 'json_object' } };
  }
  if (url === 'https://api.openai.com/v1' && /^(?:o[134](?:-|$)|gpt-[56])/.test(cfg.model)) {
    return { ...body, max_completion_tokens: limit };
  }
  if (deepseek) return { ...body, temperature: cfg.temperature ?? 0.2, max_tokens: limit, thinking: { type: 'disabled' } };
  return { ...body, temperature: cfg.temperature ?? 0.2, max_tokens: limit };
}

async function openAiChat(cfg, messages) {
  const url = validateCloudConfig(cfg);
  if ((!isLoopback(url) || cfg?.preset === 'freellmapi' || cfg?.provider === 'freellmapi') && !String(cfg.apiKey || '').trim()) {
    throw new Error(cfg?.preset === 'freellmapi' || cfg?.provider === 'freellmapi'
      ? 'Add your FreeLLMAPI unified key (or load keys_FreeLLMAPI.txt).'
      : 'Add your API key. This app does not include one.');
  }
  const ms = timeoutMs(cfg, 25000);
  const generation = beginGeneration(ms);
  const request = buildChatRequest(cfg, messages);
  try {
    const res = await fetch(request.url, {
      method: 'POST',
      headers: request.headers,
      redirect: 'error',
      cache: 'no-store',
      body: JSON.stringify(request.body),
      signal: generation.signal
    });
    if (!res.ok) {
      const detail = await errorText(res);
      if (res.status === 429) throw new Error('Provider quota or rate limit reached. Try later or choose Local AI. No paid fallback was used.');
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
  globalThis.h2cExternalModelInfo = () => { const cfg = getBridgeConfig(); return { model: cfg.model, provider: cfg.provider === 'openai' ? cfg.preset : cfg.provider }; };
  globalThis.h2cUseExternalAi = () => {
    const cfg = getBridgeConfig();
    return cfg.enabled !== false && cfg.provider !== 'browser';
  };
  globalThis.h2cExternalReady = () => prepareConfiguredModel();
  globalThis.h2cExternalGenerate = (prompt) => generateWithConfiguredModel(prompt);
  globalThis.h2cExternalAbort = () => abortActiveGeneration();
}

installExternalCoach();

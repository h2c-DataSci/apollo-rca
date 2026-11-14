import test from 'node:test';
import assert from 'node:assert/strict';
import { getBridgeConfig, saveBridgeConfig, clearBridgeSession, validateCloudConfig, executeLocalChat, collectStreamedAnswer, modelsUrl, chatUrl, apiEndpoint, testConfiguredConnection, googleRequestBody } from './local-ai-bridge.js';
import { PROVIDER_PRESETS } from './provider-presets.js';

test('cloud configuration is memory-only and changing destination clears consent and credentials', () => {
  clearBridgeSession();
  const previous = globalThis.localStorage;
  globalThis.localStorage = { getItem() { throw new Error('must not read'); }, setItem() { throw new Error('must not write'); } };
  try {
    saveBridgeConfig({ provider: 'openai', mode: 'free', preset: 'groq', endpoint: 'https://api.groq.com/openai/v1', apiKey: 'temporary', cloudConsent: true });
    assert.equal(getBridgeConfig().apiKey, 'temporary');
    saveBridgeConfig({ endpoint: 'https://different.example/v1' });
    assert.equal(getBridgeConfig().apiKey, '');
    assert.equal(getBridgeConfig().cloudConsent, false);
    clearBridgeSession();
    assert.equal(getBridgeConfig().apiKey, '');
  } finally { globalThis.localStorage = previous; clearBridgeSession(); }
});

test('cloud generation requires consent before any request', async () => {
  await assert.rejects(() => executeLocalChat([{role:'user',content:'private'}], { provider:'openai', endpoint:'https://api.groq.com/openai/v1', model:'openai/gpt-oss-20b', apiKey:'fake' }), /Confirm cloud/);
});

test('free mode rejects paid models and altered destinations', () => {
  const cfg = { mode:'free', preset:'groq', endpoint:'https://api.groq.com/openai/v1', model:'openai/gpt-oss-20b', cloudConsent:true };
  assert.equal(validateCloudConfig(cfg), cfg.endpoint);
  assert.throws(() => validateCloudConfig({...cfg,model:'paid-model'}), /listed free/);
  assert.throws(() => validateCloudConfig({...cfg,endpoint:'https://other.example/v1'}), /listed free/);
});

test('API paths preserve provider base paths and reject embedded credentials', () => {
  assert.equal(chatUrl('https://generativelanguage.googleapis.com/v1beta/openai'), 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions');
  assert.equal(modelsUrl('https://api.groq.com/openai/v1'), 'https://api.groq.com/openai/v1/models');
  assert.equal(chatUrl('http://127.0.0.1:1234'), 'http://127.0.0.1:1234/v1/chat/completions');
  assert.throws(() => apiEndpoint('https://example.com/v1?key=secret'), /query/);
});

test('partial answers cannot conceal stream errors, truncation or length limits', () => {
  const partial = JSON.stringify({message:{content:'partial'},done:false});
  assert.throws(() => collectStreamedAnswer(partial+'\n'+JSON.stringify({error:'server failed'})), /generation error/);
  assert.throws(() => collectStreamedAnswer(partial), /ended early/);
  assert.throws(() => collectStreamedAnswer(JSON.stringify({choices:[{message:{content:'partial'},finish_reason:'length'}]})), /finish normally/);
  assert.throws(() => collectStreamedAnswer('data: '+JSON.stringify({choices:[{delta:{content:'partial'}}]})), /ended early/);
});

test('local mode rejects cloud-backed Ollama tags without a request', async () => {
  await assert.rejects(() => executeLocalChat([{role:'user',content:'private'}], { provider:'ollama', model:'gpt-oss:120b-cloud' }), /Cloud-backed/);
});


test('overriding a saved destination cannot forward its key or consent', async () => {
  clearBridgeSession();
  saveBridgeConfig({ provider:'openai', mode:'paid', endpoint:'https://one.example/v1', model:'example', apiKey:'must-not-forward', cloudConsent:true });
  try {
    await assert.rejects(() => executeLocalChat([{role:'user',content:'private'}], {endpoint:'https://two.example/v1'}), /Confirm cloud/);
  } finally { clearBridgeSession(); }
});


test('free cloud sends only to selected endpoint and handles quota without fallback', async () => {
  clearBridgeSession();
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({url, init});
    return new Response('{"error":"quota"}', {status:429});
  };
  try {
    await assert.rejects(() => executeLocalChat([{role:'user',content:'synthetic'}], {provider:'openai',mode:'free',preset:'groq',endpoint:'https://api.groq.com/openai/v1',model:'openai/gpt-oss-20b',apiKey:'fake-test',cloudConsent:true}), /quota or rate limit/);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://api.groq.com/openai/v1/chat/completions');
    assert.equal(calls[0].init.cache, 'no-store');
    assert.equal(calls[0].init.redirect, 'error');
  } finally { globalThis.fetch = originalFetch; clearBridgeSession(); }
});

test('live SSE reader rejects partial answer followed by provider error', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('data: '+JSON.stringify({choices:[{delta:{content:'partial'}}]})+'\n\ndata: '+JSON.stringify({error:{message:'failed'}})+'\n\ndata: [DONE]\n', {status:200});
  try {
    await assert.rejects(() => executeLocalChat([{role:'user',content:'synthetic'}], {provider:'openai',mode:'paid',endpoint:'https://example.com/v1',model:'test',apiKey:'fake-test',cloudConsent:true}), /generation error/);
  } finally { globalThis.fetch = originalFetch; clearBridgeSession(); }
});


test('paid model discovery accepts a blank model and reports quota errors directly', async () => {
  clearBridgeSession();
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url) => { calls.push(url); return new Response('{"data":[{"id":"model-example"}]}', {status:200}); };
  const config = {provider:'openai',mode:'paid',preset:'openai',endpoint:'https://api.openai.com/v1',model:'',apiKey:'fake-test'};
  try {
    const result = await testConfiguredConnection(config);
    assert.equal(result.online, true);
    assert.deepEqual(result.models, ['model-example']);
    assert.equal(calls[0], 'https://api.openai.com/v1/models');
    globalThis.fetch = async () => new Response('{"error":"private-case-text"}', {status:429});
    const limited = await testConfiguredConnection(config);
    assert.equal(limited.online, false);
    assert.match(limited.error, /quota or rate limit/);
    assert.doesNotMatch(limited.error, /private-case-text|not reachable/);
    const invalidFree = await testConfiguredConnection({...config,mode:'free',preset:'groq'});
    assert.equal(invalidFree.online, false);
    assert.match(invalidFree.error, /listed free/);
  } finally { globalThis.fetch = originalFetch; clearBridgeSession(); }
});

test('public provider errors never echo submitted content and disabled calls make no request', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response('{"error":{"message":"sensitive-case-details secret-key"}}', {status:400}); };
  const cfg = {provider:'openai',mode:'paid',endpoint:'https://example.com/v1',model:'model',apiKey:'fake',cloudConsent:true};
  try {
    await assert.rejects(() => executeLocalChat([{role:'user',content:'synthetic'}], {...cfg,enabled:false}), /off/);
    assert.equal(calls, 0);
    await assert.rejects(() => executeLocalChat([{role:'user',content:'synthetic'}], cfg), error => /HTTP 400/.test(error.message) && !/sensitive-case-details|secret-key/.test(error.message));
  } finally { globalThis.fetch = originalFetch; clearBridgeSession(); }
});


test('provider-specific reasoning payloads preserve a useful completion budget', async () => {
  clearBridgeSession();
  const originalFetch = globalThis.fetch;
  const bodies = [];
  globalThis.fetch = async (_, init) => { bodies.push(JSON.parse(init.body)); return new Response(JSON.stringify({choices:[{message:{content:'{"summary":"synthetic"}'},finish_reason:'stop'}]}), {status:200}); };
  try {
    const base = {provider:'openai',mode:'paid',apiKey:'fake',cloudConsent:true};
    await executeLocalChat([{role:'user',content:'Return JSON'}], {...base,mode:'free',preset:'groq',endpoint:'https://api.groq.com/openai/v1',model:'openai/gpt-oss-20b'});
    assert.equal(bodies[0].max_completion_tokens, 1536);
    assert.equal(bodies[0].reasoning_effort, 'low');
    assert.equal(bodies[0].include_reasoning, false);
    assert.deepEqual(bodies[0].response_format, {type:'json_object'});
    assert.equal('max_tokens' in bodies[0], false);
    for (const model of ['o3-mini', 'gpt-5-mini', 'gpt-6']) {
      await executeLocalChat([{role:'user',content:'Return JSON'}], {...base,preset:'openai',endpoint:'https://api.openai.com/v1',model,numPredict:1600});
      const body = bodies.at(-1);
      assert.equal(body.max_completion_tokens, 1600);
      assert.equal('temperature' in body, false);
      assert.equal('max_tokens' in body, false);
    }
    await executeLocalChat([{role:'user',content:'Return JSON'}], {...base,preset:'custom',endpoint:'https://other.example/v1',model:'gpt-5-compatible',numPredict:500});
    assert.equal(bodies.at(-1).max_tokens, 500);
    assert.equal(bodies.at(-1).temperature, 0.2);
    await executeLocalChat([{role:'user',content:'Return JSON'}], {...base,mode:'free',preset:'groq',endpoint:'https://api.groq.com/openai/v1',model:'qwen/qwen3.8-27b'});
    assert.equal(bodies.at(-1).max_tokens, 1536);
    assert.equal('reasoning_effort' in bodies.at(-1), false);
  } finally { globalThis.fetch = originalFetch; clearBridgeSession(); }
});

test('free Groq accepts every model from the console limits list', () => {
  const groq = PROVIDER_PRESETS.find((item) => item.id === 'groq');
  assert.deepEqual(groq.models, [
    'openai/gpt-oss-20b',
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b'
  ]);
  for (const model of groq.models) {
    assert.equal(validateCloudConfig({ mode: 'free', preset: 'groq', endpoint: groq.endpoint, model, cloudConsent: true }), groq.endpoint);
  }
  assert.throws(() => validateCloudConfig({ mode: 'free', preset: 'groq', endpoint: groq.endpoint, model: 'meta-llama/llama-prompt-guard-2-22m', cloudConsent: true }), /listed free/);
});

test('free Google AI lists the five text models and does not switch on quota', async () => {
  const google = PROVIDER_PRESETS.find((item) => item.id === 'google');
  assert.deepEqual(google.models, ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemma-4-31b-it', 'gemma-4-26b-a4b-it']);
  for (const model of google.models) {
    assert.equal(validateCloudConfig({ mode: 'free', preset: 'google', endpoint: google.endpoint, model, cloudConsent: true }), google.endpoint);
  }
  assert.throws(() => validateCloudConfig({ mode: 'free', preset: 'google', endpoint: google.endpoint, model: 'gemini-2.5-pro', cloudConsent: true }), /listed free/);
  const gemini = googleRequestBody({ model: 'gemini-3.8-flash', numPredict: 1536 }, [{ role: 'system', content: 'Reply with JSON.' }, { role: 'user', content: 'Seal Failed' }]);
  assert.equal(gemini.generationConfig.responseMimeType, 'application/json');
  assert.equal('role' in gemini.systemInstruction, false);
  const gemma = googleRequestBody({ model: 'gemma-4-31b-it' }, [{ role: 'system', content: 'Reply with JSON.' }, { role: 'user', content: 'Seal Failed' }]);
  assert.equal(gemma.systemInstruction.role, 'system');
  const urls = [];
  const bodies = [];
  const headers = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    urls.push(String(url));
    bodies.push(JSON.parse(init.body));
    headers.push(init.headers);
    if (urls.length === 1) return new Response('{"error":{"status":"RESOURCE_EXHAUSTED"}}', { status: 429 });
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ thought: true, text: 'hidden' }, { text: '{"summary":"Seal Failed"}' }] }, finishReason: 'STOP' }] }), { status: 200 });
  };
  try {
    await assert.rejects(() => executeLocalChat([
      { role: 'system', content: 'Reply with JSON.' },
      { role: 'user', content: 'Seal Failed' }
    ], { provider: 'openai', mode: 'free', preset: 'google', endpoint: google.endpoint, model: 'gemini-3.8-flash', apiKey: 'temp', cloudConsent: true }), /quota or rate limit/);
    assert.equal(urls.length, 1);
    assert.equal(headers[0]['x-goog-api-key'], 'temp');
    assert.equal('authorization' in headers[0] || 'Authorization' in headers[0], false);
    const answer = await executeLocalChat([
      { role: 'system', content: 'Reply with JSON.' },
      { role: 'user', content: 'Seal Failed' }
    ], { provider: 'openai', mode: 'free', preset: 'google', endpoint: google.endpoint, model: 'gemma-4-26b-a4b-it', apiKey: 'temp', cloudConsent: true });
    assert.equal(answer, '{"summary":"Seal Failed"}');
    assert.equal(urls[1], 'https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent');
    assert.equal(bodies[1].systemInstruction.role, 'system');
    assert.equal(urls.length, 2);
  } finally { globalThis.fetch = original; clearBridgeSession(); }
});

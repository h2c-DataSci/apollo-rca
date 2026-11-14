import test from 'node:test';
import assert from 'node:assert/strict';
import { getBridgeConfig, saveBridgeConfig, clearBridgeSession, validateCloudConfig, executeLocalChat, collectStreamedAnswer, modelsUrl, chatUrl, apiEndpoint, testConfiguredConnection } from './local-ai-bridge.js';

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
  } finally { globalThis.fetch = originalFetch; clearBridgeSession(); }
});

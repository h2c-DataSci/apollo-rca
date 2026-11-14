import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {
  DEFAULT_BRIDGE_CONFIG,
  RECOMMENDED_LOCAL_MODELS,
  getBridgeConfig,
  saveBridgeConfig,
  testLocalDaemonConnection,
  executeLocalChat,
  pickInstalledQwen,
  stripModelThinking,
  collectStreamedAnswer
} from './local-ai-bridge.js';

test('local-ai-bridge: refuses a non-local endpoint before any request', async () => {
  const result = await testLocalDaemonConnection('https://example.com/pull');
  assert.equal(result.online, false);
  assert.match(result.error, /localhost|127\.0\.0\.1/i);
  await assert.rejects(() => executeLocalChat([{ role: 'user', content: 'case text' }], { endpoint: 'https://example.com' }));
});

test('ollama fetches refuse redirects', async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push(init);
    const body = String(url).includes('/api/tags')
      ? JSON.stringify({ models: [{ name: 'qwen3:2b' }] })
      : JSON.stringify({ message: { content: 'Cause is unknown.' }, done: true });
    return new Response(body, { status: 200 });
  };
  try {
    const status = await testLocalDaemonConnection('http://127.0.0.1:11434');
    assert.equal(status.online, true);
    const answer = await executeLocalChat([{ role: 'user', content: 'synthetic' }], { provider: 'ollama', endpoint: 'http://127.0.0.1:11434', model: 'qwen3:2b' });
    assert.match(answer, /unknown/);
  } finally { globalThis.fetch = original; }
  assert.equal(calls.length, 2);
  for (const init of calls) assert.equal(init.redirect, 'error');
});

test('local-ai-bridge: default config and recommended models are well-formed', () => {
  assert.equal(DEFAULT_BRIDGE_CONFIG.endpoint, 'http://127.0.0.1:11434');
  assert.equal(DEFAULT_BRIDGE_CONFIG.model, 'qwen3:2b');
  assert.equal(DEFAULT_BRIDGE_CONFIG.provider, 'ollama');
  assert.equal(DEFAULT_BRIDGE_CONFIG.numPredict, 384);
  assert.ok(Array.isArray(RECOMMENDED_LOCAL_MODELS));
  assert.ok(RECOMMENDED_LOCAL_MODELS.some(m => m.id === 'gemma2:2b'));
  assert.ok(RECOMMENDED_LOCAL_MODELS.some(m => m.id === 'qwen2.5:1.5b'));
});

test('local-ai-bridge: testLocalDaemonConnection detects mock Ollama endpoint', async () => {
  const server = http.createServer((req, res) => {
    if (req.url === '/api/tags') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        models: [
          { name: 'gemma2:2b', size: 1600000000 },
          { name: 'qwen2.5:1.5b', size: 1200000000 }
        ]
      }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  await new Promise(r => server.listen(18888, '127.0.0.1', r));

  try {
    const result = await testLocalDaemonConnection('http://127.0.0.1:18888');
    assert.equal(result.online, true);
    assert.equal(result.type, 'ollama');
    assert.deepEqual(result.models, ['gemma2:2b', 'qwen2.5:1.5b']);
  } finally {
    server.close();
  }
});

test('local-ai-bridge: executeLocalChat dispatches to mock Ollama /api/chat', async () => {
  let receivedBody = null;
  const server = http.createServer((req, res) => {
    if (req.url === '/api/chat' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        receivedBody = JSON.parse(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: {
            role: 'assistant',
            content: '{"summary":"Pump seal leaked","proposedText":"Seal Leaked"}'
          }
        }));
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  await new Promise(r => server.listen(18889, '127.0.0.1', r));

  try {
    const reply = await executeLocalChat([
      { role: 'system', content: 'You are an RCA Coach.' },
      { role: 'user', content: 'Review: Seal leaked' }
    ], {
      endpoint: 'http://127.0.0.1:18889',
      model: 'gemma2:2b'
    });

    assert.ok(reply.includes('Seal Leaked'));
    assert.equal(receivedBody.model, 'gemma2:2b');
    assert.equal(receivedBody.options.num_predict, 384);
  } finally {
    server.close();
  }
});

test('local-ai-bridge: executeLocalChat falls back to OpenAI-compatible /v1/chat/completions', async () => {
  let openAiCalled = false;
  const server = http.createServer((req, res) => {
    if (req.url === '/api/chat') {
      res.writeHead(404);
      res.end();
    } else if (req.url === '/v1/chat/completions') {
      openAiCalled = true;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        choices: [
          { message: { content: '{"summary":"OpenAI fallback success"}' } }
        ]
      }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  await new Promise(r => server.listen(18890, '127.0.0.1', r));

  try {
    const reply = await executeLocalChat([
      { role: 'user', content: 'Hello' }
    ], {
      endpoint: 'http://127.0.0.1:18890',
      model: 'custom-local-model'
    });

    assert.ok(openAiCalled);
    assert.ok(reply.includes('OpenAI fallback success'));
  } finally {
    server.close();
  }
});

test('local-ai-bridge: graceful offline failure when daemon is not running', async () => {
  // Port 19999 has no server running
  const status = await testLocalDaemonConnection('http://127.0.0.1:19999');
  assert.equal(status.online, false);
  assert.ok(/not reachable|Could not connect/i.test(status.message + status.error));
});

test('pickInstalledQwen prefers the exact Qwen3 2B tag', () => {
  assert.equal(pickInstalledQwen(['gemma2:2b', 'qwen3:2b', 'qwen3:8b']), 'qwen3:2b');
  assert.equal(pickInstalledQwen(['qwen3:2b-instruct-q4_K_M']), 'qwen3:2b-instruct-q4_K_M');
  assert.equal(pickInstalledQwen(['llama3.2:1b']), '');
});

test('stripModelThinking hides a Qwen thinking trace', () => {
  assert.equal(stripModelThinking('<think>hidden chain</think>{"summary":"Oil Released"}'), '{"summary":"Oil Released"}');
  assert.throws(() => stripModelThinking('<think>only reasoning</think>'), /internal reasoning/);
});

test('local-ai-bridge: missing Ollama model does not fall through or download', async () => {
  let v1 = false;
  const server = http.createServer((req, res) => {
    if (req.url === '/v1/chat/completions') v1 = true;
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: "model 'qwen3:2b' not found" }));
  });
  await new Promise((r) => server.listen(18891, '127.0.0.1', r));
  try {
    await assert.rejects(
      () => executeLocalChat([{ role: 'user', content: 'Oil Released at Unit 3 lube-oil skid' }], { endpoint: 'http://127.0.0.1:18891', model: 'qwen3:2b', provider: 'ollama' }),
      /not installed/
    );
    assert.equal(v1, false);
  } finally {
    server.close();
  }
});

test('local-ai-bridge: Apollo example strips thinking and keeps the JSON', async () => {
  let body = null;
  const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      body = JSON.parse(raw);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: { content: '<think>do not show</think>{"summary":"Oil Released","proposedText":"Oil Released"}', thinking: 'hidden' } }));
    });
  });
  await new Promise((r) => server.listen(18892, '127.0.0.1', r));
  try {
    const reply = await executeLocalChat([
      { role: 'system', content: 'You are an RCA Coach.' },
      { role: 'user', content: 'Review primary effect: Oil Released' }
    ], { endpoint: 'http://127.0.0.1:18892', model: 'qwen3:2b', provider: 'ollama' });
    assert.equal(reply, '{"summary":"Oil Released","proposedText":"Oil Released"}');
    assert.equal(body.model, 'qwen3:2b');
    assert.equal(body.think, false);
    assert.equal(body.stream, true);
    assert.match(body.messages[1].content, /Oil Released/);
    assert.ok(!reply.includes('do not show'));
  } finally {
    server.close();
  }
});

test('bring-your-own API requires a key and does not call another host', async () => {
  await assert.rejects(() => executeLocalChat([{ role: 'user', content: 'Oil Released' }], { provider: 'openai', endpoint: 'http://example.com/v1', model: 'any', apiKey: 'sk-user' }), /https/);
  let seen = '';
  const server = http.createServer((req, res) => {
    seen = req.headers.authorization || '';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ choices: [{ message: { content: '{"summary":"Oil Released"}' } }] }));
  });
  await new Promise((r) => server.listen(18893, '127.0.0.1', r));
  try {
    const reply = await executeLocalChat([{ role: 'user', content: 'Review: Oil Released' }], {
      provider: 'openai', endpoint: 'http://127.0.0.1:18893/v1', model: 'my-model', apiKey: 'sk-local-test'
    });
    assert.equal(reply, '{"summary":"Oil Released"}');
    assert.equal(seen, 'Bearer sk-local-test');
  } finally {
    server.close();
  }
});

test('Ollama NDJSON stream keeps the answer and drops thinking as chunks arrive', async () => {
  const pieces = [];
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/x-ndjson' });
    res.write(JSON.stringify({ message: { role: 'assistant', thinking: 'hidden chain', content: '' }, done: false }) + '\n');
    res.write(JSON.stringify({ message: { role: 'assistant', content: '<think>nope</think>{"summary":' }, done: false }) + '\n');
    setTimeout(() => {
      res.end(JSON.stringify({ message: { role: 'assistant', content: '"Oil Released"}' }, done: true, done_reason: 'stop' }) + '\n');
    }, 40);
  });
  await new Promise((r) => server.listen(18894, '127.0.0.1', r));
  try {
    const pending = executeLocalChat([{ role: 'user', content: 'Review: Oil Released' }], {
      endpoint: 'http://127.0.0.1:18894', model: 'qwen3:2b', provider: 'ollama', onChunk: (piece) => pieces.push(piece)
    });
    await new Promise((r) => setTimeout(r, 15));
    assert.match(pieces.join(''), /summary/);
    assert.equal(pieces.join('').includes('hidden'), false);
    assert.equal(pieces.join('').includes('nope'), false);
    assert.equal(await pending, '{"summary":"Oil Released"}');
  } finally {
    server.close();
  }
});

test('collectStreamedAnswer reads OpenAI SSE and ignores the done marker', () => {
  const raw = [
    'data: {"choices":[{"delta":{"reasoning_content":"secret","content":""}}]}',
    'data: {"choices":[{"delta":{"content":"{\\"summary\\":\\"Oil Released\\"}"}}]}',
    'data: [DONE]',
    ''
  ].join('\n');
  assert.equal(collectStreamedAnswer(raw), '{"summary":"Oil Released"}');
});



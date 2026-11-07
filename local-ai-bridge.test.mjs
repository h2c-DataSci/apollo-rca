import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {
  DEFAULT_BRIDGE_CONFIG,
  RECOMMENDED_LOCAL_MODELS,
  getBridgeConfig,
  saveBridgeConfig,
  testLocalDaemonConnection,
  executeLocalChat
} from './local-ai-bridge.js';

test('local-ai-bridge: refuses a non-local endpoint before any request', async () => {
  const result = await testLocalDaemonConnection('https://example.com/pull');
  assert.equal(result.online, false);
  assert.match(result.error, /localhost|127\.0\.0\.1/i);
  await assert.rejects(() => executeLocalChat([{ role: 'user', content: 'case text' }], { endpoint: 'https://example.com' }));
});

test('local-ai-bridge: default config and recommended models are well-formed', () => {
  assert.equal(DEFAULT_BRIDGE_CONFIG.endpoint, 'http://127.0.0.1:11434');
  assert.equal(DEFAULT_BRIDGE_CONFIG.model, 'gemma2:2b');
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
  assert.ok(status.message.includes('Could not connect'));
});

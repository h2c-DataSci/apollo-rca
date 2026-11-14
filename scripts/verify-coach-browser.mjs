import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
// Use an already installed Playwright bundle: no browser/package downloads.
const packageRoot = process.argv[2];
const output = process.argv[3];
if (!packageRoot || !output || !/^[cC]:[\\/]/.test(output) || !/^[cC]:[\\/]/.test(process.env.TEMP || '')) throw Error('Supply existing C: Playwright package root and C: output directory; TEMP must be C:.');
const { chromium } = await import(pathToFileURL(resolve(packageRoot, 'playwright/index.mjs')));
const root = resolve('.');
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const relative = decodeURIComponent(url.pathname.replace(/^\/apollo-rca/, '') || '/index.html');
  const file = resolve(root, '.' + (relative === '/' ? '/index.html' : relative));
  if (!file.startsWith(root + '\\') && file !== root) { res.writeHead(403).end(); return; }
  try { const data = await readFile(file === root ? resolve(root, 'index.html') : file); res.setHeader('Content-Type', ({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.webmanifest':'application/manifest+json'})[extname(file)] || 'application/octet-stream'); res.end(data); }
  catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
let browser;
try {
  browser = await chromium.launch({ headless: true, channel: process.env.COACH_TEST_BROWSER || 'msedge', timeout: 60000 });
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => { errors.push(error.message); console.error('PAGE ERROR:',error.message); });
  const address = `http://127.0.0.1:${server.address().port}/apollo-rca/`;
  let apiCalls = 0;
  await page.route('**/*', async route => {
    const url = route.request().url();
    if (url.startsWith(address)) return route.continue();
    if (url === 'https://api.groq.com/openai/v1/models') { apiCalls++; return route.fulfill({json:{data:[{id:'openai/gpt-oss-20b'}]}}); }
    if (url === 'https://api.groq.com/openai/v1/chat/completions') { apiCalls++; return route.fulfill({json:{choices:[{message:{content:JSON.stringify({summary:'Synthetic coach review',issues:[],proposedText:'Pump leaked',rationale:'Mocked analysis only'})},finish_reason:'stop'}]}}); }
    if (url === 'https://api.openai.com/v1/models') { apiCalls++; return route.fulfill({json:{data:[{id:'example-paid-model'}]}}); }
    if (url === 'http://127.0.0.1:11434/api/tags') { apiCalls++; return route.fulfill({json:{models:[{name:'installed-local:2b'}]}}); }
    return route.abort();
  });
  await page.goto(address);
  await page.getByRole('heading', { name: 'H2C Root Cause Analyst', exact: true }).waitFor();
  await page.locator('.h2c-session-notice').waitFor();
  await page.getByRole('button', { name: 'Load sample case', exact: true }).click();
  await page.getByRole('button', { name: 'RCA Coach', exact: true }).click();
  const panel = page.locator('.h2c-local-bridge-card'); await panel.waitFor();
  await panel.locator('.h2c-bridge-test-btn').click();
  await page.getByText('Connected', {exact:true}).waitFor();
  assert.equal(await panel.locator('.h2c-bridge-model').inputValue(), 'installed-local:2b');
  await panel.locator('.h2c-ai-mode').selectOption('free');
  assert.equal(await panel.locator('.h2c-ai-preset').inputValue(), 'groq');
  assert.equal(await panel.locator('.h2c-bridge-endpoint').inputValue(), 'https://api.groq.com/openai/v1');
  const before = apiCalls;
  await panel.locator('.h2c-bridge-test-btn').click();
  await panel.getByText('Paste your key and authorize this provider first. No request was sent.', {exact:true}).waitFor();
  assert.equal(apiCalls, before);
  await panel.locator('.h2c-bridge-key').fill('synthetic-not-a-key');
  await panel.locator('.h2c-ai-allow').check();
  await panel.locator('.h2c-bridge-test-btn').click();
  await panel.getByText('Connected', {exact:true}).waitFor();
  assert.equal(await page.evaluate(() => Object.keys(localStorage).length), 0);
  await page.getByRole('button', {name:'Enable AI Assistant',exact:true}).click();
  await page.getByRole('button', {name:'Enable assistant',exact:true}).click();
  await page.getByText('AI Ready',{exact:true}).waitFor();
  await page.getByRole('button', {name:'Review wording',exact:true}).click();
  await page.getByText('Synthetic coach review', {exact:true}).waitFor();
  await panel.locator('.h2c-ai-model-choice').selectOption('openai/gpt-oss-120b');
  assert.equal(await panel.locator('.h2c-bridge-model').inputValue(), 'openai/gpt-oss-120b');
  await panel.locator('.h2c-ai-preset').selectOption('openrouter');
  assert.equal(await panel.locator('.h2c-bridge-key').inputValue(), '');
  assert.equal(await panel.locator('.h2c-ai-allow').isChecked(), false);
  await panel.locator('.h2c-ai-mode').selectOption('paid');
  assert.equal(await panel.locator('.h2c-bridge-model').inputValue(), '');
  await panel.locator('.h2c-bridge-key').fill('synthetic-paid-not-a-key');
  await panel.locator('.h2c-ai-allow').check();
  await panel.locator('.h2c-bridge-test-btn').click();
  await panel.getByText('Connected', {exact:true}).waitFor();
  assert.equal(await panel.locator('#h2c-bridge-models option').first().getAttribute('value'), 'example-paid-model');
  await panel.locator('.h2c-ai-forget').click();
  assert.equal(await panel.locator('.h2c-bridge-key').inputValue(), '');
  await page.getByRole('button', {name:'Load sample case',exact:true}).click();
  const stored = await page.evaluate(async () => { const {sessionStore} = await import('/apollo-rca/session-store.js'); return sessionStore.getItem('realitychart-intake-v1'); });
  assert.ok(stored?.includes('effects'));
  assert.equal(await page.evaluate(() => Object.keys(localStorage).length), 0);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button',{name:'New analysis',exact:true}).click();
  await page.getByRole('button',{name:'Undo',exact:true}).click();
  const restored = await page.evaluate(async () => { const {sessionStore} = await import('/apollo-rca/session-store.js'); return sessionStore.getItem('realitychart-intake-v1'); });
  assert.equal(restored, stored);
  await page.getByRole('button', { name: 'RCA Coach', exact: true }).click();
  await panel.waitFor();
  await panel.locator('.h2c-ai-mode').selectOption('free');
  await mkdir(output, {recursive:true});
  await page.getByRole('button', {name:'Generate chart & RCA report',exact:true}).click();
  const downloadReady = page.waitForEvent('download');
  await page.getByRole('button', {name:'Download .ZIP Package',exact:true}).click();
  const download = await downloadReady;
  await download.saveAs(resolve(output,'synthetic-report.zip'));
  assert.equal(await download.failure(), null);
  assert.equal(await page.evaluate(() => Object.keys(localStorage).length), 0);
  await panel.scrollIntoViewIfNeeded();
  await page.screenshot({path:resolve(output,'coach-desktop.png'),fullPage:false});
  await page.setViewportSize({width:390,height:844});
  await panel.scrollIntoViewIfNeeded();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Mobile page must not overflow horizontally');
  const panelBox = await panel.boundingBox(); assert.ok(panelBox.x >= 0 && panelBox.x + panelBox.width <= 391);
  await page.screenshot({path:resolve(output,'coach-mobile.png'),fullPage:false});
  page.once('dialog', dialog => dialog.accept());
  await page.reload();
  const reset = await page.evaluate(async () => { const {getBridgeConfig} = await import('/apollo-rca/local-ai-bridge.js?v=24'); return getBridgeConfig().apiKey; });
  assert.equal(reset,'');
  assert.equal(await page.evaluate(() => Object.keys(localStorage).length), 0);
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({passed:true,mockedApiRequests:apiCalls,pageErrors:errors,screenshots:output}));
} finally { await browser?.close(); await new Promise(r=>server.close(r)); }

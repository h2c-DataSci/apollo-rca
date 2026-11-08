import test from 'node:test'; import assert from 'node:assert/strict';
import * as R from './rca-rules.js'; import { parseTaskOutput, extractJSON, AIParseError } from './ai-parser.js';
import { AIService, PROMPTS, TASK_NAMES } from './ai-service.js';
import { readFileSync } from 'node:fs';

test('primary effect: good', () => assert.equal(R.reviewPrimaryEffect('Oil Released').status, 'ok'));
test('primary effect: blame/length/cause', () => { const r = R.reviewPrimaryEffect('Operator error caused by negligence of the night crew'); const c = r.issues.map((i) => i.code); assert.ok(c.includes('BLAME') && c.includes('LENGTH') && c.includes('IMPLIED_CAUSE')); });
test('person wording flagged', () => assert.ok(R.reviewPrimaryEffect('Valve closed by John Cruz').issues.some((i) => i.code === 'PERSON')));
test('cause review: assumption + evidence levels', () => {
  assert.equal(R.reviewCause('Probably seal failed', []).assumptionRisk, 'medium');
  assert.equal(R.reviewCause('Seal temperature exceeded limit', []).evidenceSupport, 'not-enough-information');
  assert.equal(R.reviewCause('Seal temperature exceeded limit', ['Seal temperature trend exceeded limit at 14:32']).evidenceSupport, 'supported');
  assert.equal(R.reviewCause('Pump bearing worn', ['Seal temperature rose']).evidenceSupport, 'unsupported');
});
test('action alignment', () => { assert.equal(R.alignAction('Seal cooling flow low', 'Restore seal cooling flow monitoring'), 'strong'); assert.equal(R.alignAction('Seal cooling flow low', 'Train staff'), 'weak'); assert.equal(R.alignAction('', 'x'), 'indeterminate'); });
test('timeline rules never invent times', () => { const e = R.timelineFromNarrative('At 14:32 the seal temperature rose. Oil leaked afterwards.'); assert.equal(e[0].dateTimeText, '14:32'); assert.equal(e[1].dateTimeText, ''); assert.equal(e[1].certainty, 'unknown'); assert.ok(e.every((x) => x.needsValidation)); });
test('parseTimeHHMM', () => { assert.equal(R.parseTimeHHMM('2:40 PM'), '14:40'); assert.equal(R.parseTimeHHMM('nope'), ''); });

test('parser: valid, fenced, invalid', () => {
  assert.deepEqual(parseTaskOutput('rewritePrimaryEffect', 'x ```json\n{"rewrites":["Oil Released","<b>Oil Leaked</b>"],"rationale":"r"}\n```').rewrites, ['Oil Released', 'Oil Leaked']);
  assert.throws(() => parseTaskOutput('rewritePrimaryEffect', 'no json'), AIParseError);
  assert.throws(() => parseTaskOutput('rewritePrimaryEffect', '{"rewrites":[]}'), AIParseError);
  assert.throws(() => parseTaskOutput('extractTimelineCandidates', '{"events":[{"x":1}]}'), AIParseError);
  assert.throws(() => extractJSON('{bad json}'), AIParseError);
});
test('parser: enums coerced, limits applied, events always need validation', () => {
  const v = parseTaskOutput('reviewCauseStatement', JSON.stringify({ evidenceSupport: 'definitely', assumptionRisk: 'HIGH', questions: ['a','b','c','d','e','f','g'] }));
  assert.equal(v.evidenceSupport, 'not-enough-information'); assert.equal(v.assumptionRisk, 'high'); assert.equal(v.questions.length, 5);
  assert.equal(parseTaskOutput('extractTimelineCandidates', '{"events":[{"event":"x","needsValidation":false}]}').events[0].needsValidation, true);
});
test('all ten tasks have prompts and validators', () => { assert.equal(TASK_NAMES.length, 14); for (const t of TASK_NAMES) assert.ok(PROMPTS[t]({ text: 'x' }).includes('Schema')); });

const mock = (out, cap = { supported: true, backend: 'mock' }) => ({ capability: async () => cap, load: async (p) => p(50), generate: async () => out, unload: async () => {}, cancel() {} });
test('service: disabled by default, enable, run, standard mode unaffected', async () => {
  const s = new AIService(mock('{"questions":["What was the trend?"]}')); assert.equal(s.status, 'disabled');
  await assert.rejects(() => s.run('generateClarifyingQuestions', { text: 'x' }));
  await s.enable(); assert.equal(s.status, 'ready');
  assert.deepEqual((await s.run('generateClarifyingQuestions', { text: 'x' })).value.questions, ['What was the trend?']); assert.equal(s.status, 'ready');
  await s.disable(); assert.equal(s.status, 'disabled');
});
test('service: invalid output -> recoverable, still ready, nothing returned', async () => {
  const s = new AIService(mock('garbage')); await s.enable();
  await assert.rejects(() => s.run('rewritePrimaryEffect', { text: 'x' })); assert.equal(s.status, 'ready'); assert.match(s.error, /Nothing was changed/);
});
test('service: unsupported device falls back', async () => { const s = new AIService(mock('', { supported: false, reason: 'no' })); await s.enable(); assert.equal(s.status, 'unsupported'); });
test('service: load failure -> error state', async () => { const t = mock(''); t.load = async () => { throw new Error('net'); }; const s = new AIService(t); await s.enable(); assert.equal(s.status, 'error'); });

test('base path: no root-absolute asset URLs outside /apollo-rca/', () => {
  const h = readFileSync(new URL('./index.html', import.meta.url), 'utf8'); const bad = [...h.matchAll(/(?:src|href)="(\/[^"]*)"/g)].map((m) => m[1]).filter((u) => !u.startsWith('/apollo-rca/'));
  assert.deepEqual(bad, []);
});
test('no secrets / telemetry in client code', () => {
  for (const f of ['ai-config.js','ai-service.js','ai-worker.js','ai-transport.js','coach-ui.js']) { const s = readFileSync(new URL('./' + f, import.meta.url), 'utf8'); assert.ok(!/api[_-]?key|secret|token\s*[:=]|sk-[A-Za-z0-9]/i.test(s), f); assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon/.test(s), f + ' makes network calls'); }
});
import { exportCase, validateImport } from './case-io.js';
test('export/import round trip, hypotheses keep status, evidence IDs survive', () => {
  const st = { effects: [{ id: 'pe-1' }], timeline: [{ id: 't1' }], evidence: [{ id: 'e1', text: 'x' }] };
  const out = JSON.stringify(exportCase(st, [{ task: 'suggestHypothesisBranches', text: 'h', status: 'hypothesis' }]));
  const r = validateImport(out); assert.ok(r.ok); assert.equal(r.state.evidence[0].id, 'e1'); assert.equal(r.notes[0].status, 'hypothesis');
});
test('import rejects malformed, wrong format, duplicate IDs, and downgrades AI notes', () => {
  assert.equal(validateImport('{bad').ok, false); assert.equal(validateImport('{"format":"x"}').ok, false);
  const base = (o) => JSON.stringify({ format: 'h2c-rca-case-v1', state: { effects: [{}], evidence: o.ev }, aiNotes: o.n });
  assert.equal(validateImport(base({ ev: [{ id: 'a', text: 't' }, { id: 'a', text: 't' }] })).ok, false);
  assert.equal(validateImport(base({ ev: [{ id: 1 }] })).ok, false);
  assert.equal(validateImport(base({ ev: [], n: [{ task: 't', text: 'x', status: 'VALIDATED' }] })).notes[0].status, 'ai-assisted');
});
test('base path: router basepath is /apollo-rca and no URL-rewrite hack remains', () => {
  const j = readFileSync(new URL('./index-v12.js', import.meta.url), 'utf8'); assert.ok(j.includes('basepath:`/apollo-rca`')); assert.ok(!j.includes('basepath:``,serializationAdapters'));
  assert.ok(!readFileSync(new URL('./index.html', import.meta.url), 'utf8').includes('replaceState'));
});
test('no root-absolute asset URLs in built JS', () => { const j = readFileSync(new URL('./index-v12.js', import.meta.url), 'utf8'); assert.ok(!/[`"']\/assets\//.test(j)); });
test('privacy: no third-party hosts referenced in index.html or app code (except documented model/library hosts)', () => {
  const h = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
  const allowed = /^(?:https?:\/\/)(?:127\.0\.0\.1:11434|localhost:11434|cdn\.jsdelivr\.net|huggingface\.co|\*\.huggingface\.co|cdn-lfs\.huggingface\.co)(?:[/?#]|$)/;
  const found = [...h.matchAll(/https?:\/\/(?!www\.w3\.org)[^"'\s<);]+/g)].map((m) => m[0]).filter((u) => !u.startsWith('https://h2c-datasci.github.io') && !allowed.test(u));
  assert.deepEqual(found, []);
});
test('privacy: no third-party hosts, manifest or Grok references in the bundle head config', () => { const j = readFileSync(new URL('./index-v12.js', import.meta.url), 'utf8'); assert.ok(!j.includes('fonts.googleapis.com') && !j.includes('.grok.me')); });
test('no /assets/ root-absolute URLs anywhere in index.html (router manifest preloads)', () => assert.ok(!readFileSync(new URL('./index.html', import.meta.url), 'utf8').includes('"/assets/')));
test('vite preload helper resolves under /apollo-rca/ (no /assets/ 404s)', () => { const j = readFileSync(new URL('./index-v12.js', import.meta.url), 'utf8'); assert.ok(j.includes('return`/apollo-rca/`+e') && !j.includes('"assets/routes')); });
test('one-click New analysis: shared clear path with confirm + undo backup, visible without AI', () => {
  const s = readFileSync(new URL('./coach-ui.js', import.meta.url), 'utf8');
  assert.ok(s.includes('id: \'h2c-new\'') && s.includes('Clear analysis and start new?') && s.includes('BACKUP_KEY') && s.includes('undoClear'));
  assert.equal((s.match(/removeItem\(APP_KEY\)/g) || []).length, 1, 'single clear implementation');
});
test('chart colors: STOP is red with white text, unknown is yellow with black text', () => {
  const routes = readFileSync(new URL('./routes-v13.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('./styles-v13.css', import.meta.url), 'utf8');
  const help = readFileSync(new URL('./help-diagrams.js', import.meta.url), 'utf8');
  const shell = readFileSync(new URL('./h2c-shell.js', import.meta.url), 'utf8');
  assert.match(routes, /un=`#d32f2f`/);
  assert.match(routes, /hex:`#111827`/);
  assert.match(routes, /hex:`#dc2626`/);
  assert.match(routes, /hex:`#16a34a`/);
  assert.match(routes, /fill:`#fbc02d`,stroke:`#fbc02d`,className:`fill-unknown`/);
  assert.match(routes, /fill:`#000000`,className:`fill-unknown-ink`,fontSize:18,fontWeight:700,children:`\?`/);
  assert.match(routes, /Red — STOP/);
  assert.match(routes, /Yellow — \? unknown/);
  assert.doesNotMatch(routes, /Grey — STOP|Grey — \?/);
  assert.match(css, /\.fill-stop\{fill:#d32f2f\}/);
  assert.match(css, /\.bg-unknown\{background-color:#fbc02d\}/);
  assert.match(css, /\.fill-unknown-ink\{fill:#000\}/);
  assert.match(help, /stop: '#d32f2f'/);
  assert.match(help, /unknown: '#fbc02d'/);
  assert.match(shell, /'#d32f2f'/);
  assert.match(shell, /'#fbc02d'/);
  assert.match(shell, /'#ffffff'/);
  assert.match(shell, /'#000000'/);
});

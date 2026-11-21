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
  for (const f of ['ai-config.js','ai-service.js','ai-worker.js','ai-transport.js']) { const s = readFileSync(new URL('./' + f, import.meta.url), 'utf8'); assert.ok(!/api[_-]?key|secret|token\s*[:=]|sk-[A-Za-z0-9]/i.test(s), f); assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon/.test(s), f + ' makes network calls'); }
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
  const j = readFileSync(new URL('./index-v13.js', import.meta.url), 'utf8'); assert.ok(j.includes('basepath:`/apollo-rca`')); assert.ok(!j.includes('basepath:``,serializationAdapters'));
  assert.ok(!readFileSync(new URL('./index.html', import.meta.url), 'utf8').includes('replaceState'));
});
test('no root-absolute asset URLs in built JS', () => { const j = readFileSync(new URL('./index-v13.js', import.meta.url), 'utf8'); assert.ok(!/[`"']\/assets\//.test(j)); });
test('csp keeps Ollama on localhost and 127.0.0.1 and drops the invalid IPv6 source', () => {
  const h = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
  assert.match(h, /connect-src[^;]*http:\/\/127\.0\.0\.1:\*/);
  assert.match(h, /connect-src[^;]*http:\/\/localhost:\*/);
  assert.doesNotMatch(h, /http:\/\/\[::1\]:\*/);
  assert.doesNotMatch(h.match(/script-src[^;]*/)[0], /cdn\.jsdelivr\.net/);
  assert.doesNotMatch(h.match(/connect-src[^;]*/)[0], /cdn\.jsdelivr\.net/);
});

test('privacy: no third-party hosts referenced in index.html or app code (except documented model/library hosts)', () => {
  const h = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
  const allowed = /^(?:https?:\/\/)(?:127\.0\.0\.1(?::\*|:11434)?|localhost(?::\*|:11434)?|huggingface\.co|\*\.huggingface\.co|cdn-lfs\.huggingface\.co|www\.youtube-nocookie\.com)(?:[/?#]|$)/;
  const found = [...h.matchAll(/https?:\/\/(?!www\.w3\.org)[^"'\s<);]+/g)].map((m) => m[0]).filter((u) => !u.startsWith('https://h2c-datasci.github.io') && !allowed.test(u));
  assert.deepEqual(found, []);
});
test('privacy: no third-party hosts, manifest or Grok references in the bundle head config', () => { const j = readFileSync(new URL('./index-v13.js', import.meta.url), 'utf8'); assert.ok(!j.includes('fonts.googleapis.com') && !j.includes('.grok.me')); });
test('no /assets/ root-absolute URLs anywhere in index.html (router manifest preloads)', () => assert.ok(!readFileSync(new URL('./index.html', import.meta.url), 'utf8').includes('"/assets/')));
test('vite preload helper resolves under /apollo-rca/ (no /assets/ 404s)', () => { const j = readFileSync(new URL('./index-v13.js', import.meta.url), 'utf8'); assert.ok(j.includes('return`/apollo-rca/`+e') && !j.includes('"assets/routes')); });
test('one-click New analysis: shared clear path with confirm + undo backup, visible without AI', () => {
  const s = readFileSync(new URL('./h2c-shell.js', import.meta.url), 'utf8');
  assert.ok(s.includes('Clear analysis and start new?') && s.includes("const BACKUP = 'h2c-last-cleared-v1'") && s.includes("u.textContent = 'Undo'"));
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
  assert.match(routes, /Red octagon — STOP/);
  assert.match(routes, /Yellow — \? Need More Info/);
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
test('service worker keeps only this app caches and fails a broken shell install', () => {
  const sw = readFileSync(new URL('./sw.js', import.meta.url), 'utf8');
  assert.match(sw, /const OWN_PREFIX = 'apollo-rca-'/);
  assert.match(sw, /key\.startsWith\(OWN_PREFIX\) && !keep\.has\(key\)/);
  assert.ok(!sw.includes('key !== CACHE'), 'activate must not delete other origin caches');
  assert.match(sw, /await Promise\.all\(SHELL\.map/);
  assert.ok(!sw.includes('.catch(() => {})'), 'a failed shell asset must reject install');
  assert.match(sw, /RUNTIME_MAX_ENTRIES = 40/);
  assert.match(sw, /RUNTIME_MAX_AGE_MS = 7 \* 24 \* 60 \* 60 \* 1000/);
  assert.match(sw, /RUNTIME_MAX_BYTES = 1500000/);
});
test('workflow hub does not reparent the React step list', () => {
  const shell = readFileSync(new URL('./h2c-shell.js', import.meta.url), 'utf8');
  assert.ok(!shell.includes('hub.append(existingOl)'), 'moving the step list breaks coach insertBefore');
  assert.match(shell, /existingOl\.before\(hub\)/);
  assert.match(shell, /hub\.contains\(existingOl\)/);
  assert.match(shell, /coachSection\.before\(bridge\)/);
});
test('shell sanitizer drops nested forbidden tags and normalized javascript URLs', () => {
  const shell = readFileSync(new URL('./h2c-shell.js', import.meta.url), 'utf8');
  const start = shell.indexOf('function normalizedUrl');
  const end = shell.indexOf('function setSafeHtml');
  const api = new Function(`${shell.slice(start, end)}; return { normalizedUrl, blockedUrl, unsafeStyle };`)();
  assert.equal(api.blockedUrl(' javascript:alert(1)'), true);
  assert.equal(api.blockedUrl('java\nscript:alert(1)'), true);
  assert.equal(api.blockedUrl('JaVaScRiPt:alert(1)'), true);
  assert.equal(api.blockedUrl('java%73cript:alert(1)'), true);
  assert.equal(api.blockedUrl('&#106;avascript:alert(1)'), true);
  assert.equal(api.blockedUrl('https://www.haroldhenrycabanilla.com'), false);
  assert.equal(api.blockedUrl('https://docs.google.com/forms/d/e/1FAIpQLSedUpS-6ERmkio3noR_o1nS1UO0nf3sO48BH9t3AbLXvKv19w/viewform'), false);
  assert.equal(api.unsafeStyle('background:url(https://evil.example/x)'), true);
  assert.equal(api.unsafeStyle('width:expression(alert(1))'), true);
  assert.equal(api.unsafeStyle('padding: 3px 8px; font-size: 11px;'), false);
  assert.match(shell, /for \(const child of \[\.\.\.node\.children\]\) visit\(child\)/);
  assert.match(shell, /FORBIDDEN_TAGS/);
  assert.match(shell, /ALLOWED_TAGS/);
  assert.match(shell, /ALLOWED_ATTRS/);
  const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
  assert.match(html, /<meta name="referrer" content="no-referrer"/);
});
test('Feedback link sits next to About the developer and opens the form safely', () => {
  const help = readFileSync(new URL('./h2c-help.js', import.meta.url), 'utf8');
  assert.match(help, /About the developer:/);
  assert.match(help, /href: SITE/);
  assert.match(help, /www\.haroldhenrycabanilla\.com/);
  assert.match(help, /textContent: 'Feedback'/);
  assert.match(help, /https:\/\/docs\.google\.com\/forms\/d\/e\/1FAIpQLSedUpS-6ERmkio3noR_o1nS1UO0nf3sO48BH9t3AbLXvKv19w\/viewform/);
  assert.match(help, /target: '_blank', rel: 'noopener noreferrer', textContent: 'Feedback'/);
  assert.match(help, /All 15 Apollo RCA principles \(P01–P15\)/);
});

test('v68 live-audit bug fixes: safe import, secret strip, no raw alert, session safety, Coach feedback, case preservation, blame integrity', async () => {
  const routes = readFileSync(new URL('./routes-v13.js', import.meta.url), 'utf8');
  const { parseProjectFile, MAX_IMPORT_BYTES } = await import('./case-import.js');
  assert.equal(MAX_IMPORT_BYTES, 5 * 1024 * 1024);

  // Malformed analysis falls back to null instead of crashing, and secret keys are stripped + reported
  const malformedWithKey = {
    intake: { effects: [{ id: 'pe-1', what: 'Pump Leaked' }], apiKey: 'sk-test-1234567890abcdef' },
    analysis: { trees: [{}] }
  };
  const parsed = parseProjectFile(malformedWithKey);
  assert.equal(parsed.analysis, null);
  assert.ok(parsed.strippedSecrets.includes('apiKey'));
  assert.equal('apiKey' in parsed.intake, false);

  // No raw browser alert() in routes-v13.js; uses inline h2cShowNotice and 5MB cap
  assert.doesNotMatch(routes, /\balert\(/);
  assert.match(routes, /h2cShowNotice/);
  assert.match(routes, /5\*1024\*1024/);

  // Session readiness does not trigger full remount via sessionStore.notify()
  assert.match(routes, /h2c-session-ready/);

  // Review wording with AI off gives clear status message
  assert.match(routes, /AI Coach is off \(no connected model or API key\)/);

  // softTitle preserves user capitalization instead of forcing Title Case
  const softStart = routes.indexOf('function softTitle(');
  const softEnd = routes.indexOf('var personWords=', softStart);
  const softFn = new Function(`${routes.slice(softStart, softEnd)}; return softTitle;`)();
  assert.equal(softFn('PLC failed to trip on high temp'), 'PLC failed to trip on high temp');

  // Blame wording upgrades integrity summary from PASS to warn
  assert.match(routes, /Blame or person-focused wording detected/);
  assert.match(routes, /blameWords\.test\(s\|\|``\)\|\|personWords\.test\(s\|\|``\)/);

  // Xn() New analysis reset handler must be block-scoped (let j=), never overwriting top-level function j(e)
  assert.match(routes, /;let j=\(\)=>\{sessionStore\.removeItem\(qn\)/);
  assert.doesNotMatch(routes, /;j=\(\)=>\{sessionStore\.removeItem\(qn\)/);
});

test('v69 live-audit re-test fixes: sample solution metadata, null-safe PDF/CSV, P05 blame, PE-2 knownIds, no PASS concat, consistent reload copy', async () => {
  const routes = readFileSync(new URL('./routes-v13.js', import.meta.url), 'utf8');
  const shell = readFileSync(new URL('./h2c-shell.js', import.meta.url), 'utf8');
  const { getSampleCase } = await import('./sample-case.js');

  // High #1: Every sample solution has effectCode, targetId, targetKind + st/U are null-safe
  const sample = getSampleCase();
  assert.ok(sample.analysis.solutions.length >= 16);
  for (const sol of sample.analysis.solutions) {
    assert.ok(typeof sol.effectCode === 'string' && /^PE-\d+$/.test(sol.effectCode), `${sol.id} missing effectCode`);
    assert.ok(typeof sol.targetId === 'string' && sol.targetId.length > 0, `${sol.id} missing targetId`);
    assert.ok(sol.targetKind === 'action' || sol.targetKind === 'condition', `${sol.id} missing targetKind`);
  }
  assert.match(routes, /function st\(e\)\{return`"\$\{String\(e\?\?``\)\.replace/);
  assert.match(routes, /function U\(e\)\{return String\(e\?\?``\)\.replace/);

  // Medium #3: PE-2 knownIds & P05 blame on "operator was careless"
  assert.match(routes, /careless\\w\*\|negligen\\w\*/);
  assert.match(routes, /allCaseCauses:/);
  assert.match(routes, /`PE-\$\{i\+1\}`/);

  // Low #4: Mt() returns empty on zero violations; PE roots use softTitle
  assert.match(routes, /:t\.length\?e:``\}/);
  assert.match(routes, /a\.title=softTitle\(e\.what\),a\.code=n/);

  // Low #5: Consistent reload copy in h2c-shell.js
  assert.match(shell, /Reloading keeps your draft; closing the tab drops it/);
  assert.doesNotMatch(shell, /before closing or reloading/);
});

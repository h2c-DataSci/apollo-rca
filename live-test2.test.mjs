// Regression guards for the second Nov 17 live test and RC Coach/provider work.
import { readFileSync } from 'node:fs';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { isProjectState, parseProjectFile, hasSecretKeys } from './case-import.js';
import { coachIsReady, coachReadyHint, caseSnapshot, reviewStepEntries } from './coach-steps.js';
import { PROVIDER_PRESETS, LOCAL_PRESETS, presetModelIds } from './provider-presets.js';
import {
  redactConfig, buildChatRequest, parseExtraHeaders, saveBridgeConfig, getBridgeConfig,
  clearBridgeSession, persistRememberedKey, loadRememberedKey, clearRememberedKey, REMEMBER_KEY,
  validateCloudConfig
} from './local-ai-bridge.js';

const routes = readFileSync(new URL('./routes-v13.js', import.meta.url), 'utf8');
const shell = readFileSync(new URL('./h2c-shell.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('./styles-v13.css', import.meta.url), 'utf8');
const helpKb = readFileSync(new URL('./help-kb.js', import.meta.url), 'utf8');
const helpDiagrams = readFileSync(new URL('./help-diagrams.js', import.meta.url), 'utf8');
const videos = readFileSync(new URL('./h2c-videos.js', import.meta.url), 'utf8');
const sw = readFileSync(new URL('./sw.js', import.meta.url), 'utf8');
const steps = readFileSync(new URL('./coach-steps.js', import.meta.url), 'utf8');
const fixture = JSON.parse(readFileSync(new URL('./test/fixtures/Cause Chart_Project_State.json', import.meta.url), 'utf8'));

describe('live-test 2: dates, casing, timelines, placeholders', () => {
  it('uses the real local date instead of a hardcoded report date', () => {
    assert.match(routes, /function localISODate\(/);
    assert.match(routes, /reportDate:localISODate\(\)/);
    assert.doesNotMatch(routes, /reportDate:`2026-10-31`/);
    assert.match(routes, /due:ge\(localISODate\(\),30\)/);
    assert.match(routes, /due:ge\(localISODate\(\),14\)/);
    assert.match(routes, /\$\{e\}T00:00:00/);
  });

  it('preserves investigator casing on node titles', () => {
    assert.match(routes, /\/\^\[a-z\]\/\.test\(e\)\?e\.charAt\(0\)\.toUpperCase\(\)\+e\.slice\(1\):e\)/);
    assert.doesNotMatch(routes, /e\.slice\(1\)\.toLowerCase\(\)/);
  });

  it('counts per-PE own timelines in readiness', () => {
    assert.match(routes, /function allTimelineEvents\(/);
    assert.match(routes, /function caseChecklist\(e\)\{let effects=.*r=allTimelineEvents\(e\)/s);
    assert.match(routes, /Own timeline`/);
    assert.doesNotMatch(routes, /Own timeline and evidence/);
    assert.match(routes, /t\.ok\?`Ready`:t\.block\?`Needs work`:`Optional`/);
    assert.match(routes, /t\.ok\?`text-goto`:t\.block\?`text-stop`:`text-muted`/);
  });

  it('excludes placeholder Action Needed nodes from GOTO matching', () => {
    assert.match(routes, /function le\(e,t,n\)\{if\(e\.kind===`action`&&!e\.placeholder&&!\/\^\(Action Needed\|Condition Needed\)\$\/i/);
  });
});

describe('live-test 2: import, integrity, download wording', () => {
  it('opens a Cause Chart_Project_State.json fixture as a full case', () => {
    assert.equal(isProjectState(fixture), true);
    const parsed = parseProjectFile(fixture);
    assert.ok((parsed.intake.effects || []).some((row) => (row.what || '').trim()));
    assert.ok(parsed.analysis && parsed.analysis.trees.length >= 1);
    assert.deepEqual(hasSecretKeys(fixture), []);
  });

  it('rejects evidence-like JSON and empty objects with a friendly error', () => {
    assert.equal(isProjectState([{ text: 'raw notes' }]), false);
    assert.equal(isProjectState({ hello: 'world' }), false);
    assert.throws(() => parseProjectFile({ hello: 'world' }), /not a saved case/);
  });

  it('routes expose Open case (JSON), detect project JSON in the evidence dropzone, and confirm before overwrite', () => {
    assert.match(routes, /function isProjectState\(/);
    assert.match(routes, /function parseProjectFile\(/);
    assert.match(routes, /Open case \(JSON\)/);
    assert.match(routes, /h2cOfferProjectImport/);
    assert.match(routes, /Replace the current case with this JSON\?/);
    assert.match(routes, /This JSON is not a saved case/);
  });

  it('names the offending node on a P05 integrity BLOCK and keeps download off', () => {
    assert.match(routes, /function personCauseRefs\(/);
    assert.match(routes, /function reportIntegrity\(/);
    assert.match(routes, /See \$\{a\.join/);
    assert.match(routes, /resolve the integrity BLOCK/);
    assert.match(routes, /let i=reportIntegrity\(e,t\)/);
  });

  it('does not say fill generate or fill select in download status', () => {
    assert.match(routes, /\/\^\(generate\|build\|select\|resolve\)\\b\/i/);
  });
});

describe('live-test 2: chart chrome, legend, duplicates, performance hooks', () => {
  it('groups zoom controls, uses a tall chart frame, and keeps STOP red #d32f2f as an octagon', () => {
    assert.match(routes, /h2c-zoom-group/);
    assert.match(routes, /h2c-chart-frame/);
    assert.match(css, /\.h2c-chart-frame\{/);
    assert.match(css, /min-height:700px/);
    assert.match(routes, /LEGEND_H=80/);
    assert.match(routes, /STOP \(red octagon\)/);
    assert.match(routes, /Red octagon — STOP/);
    assert.match(routes, /#d32f2f/);
    assert.match(routes, /r===`#d32f2f`/);
    assert.match(routes, /Need More Info/);
    assert.match(routes, /font-size`,`16`/);
  });

  it('labels the second PDF button and distinguishes Undo actions', () => {
    assert.match(routes, /Download report \(PDF\) — same as above/);
    assert.match(routes, /Undo last change/);
    assert.match(routes, /Undo chart change/);
    assert.match(routes, /Removing a node can be undone/);
  });

  it('restores session readiness after paint and debounces intake persistence', () => {
    assert.match(routes, /h2cSessionReady/);
    assert.match(routes, /if\(globalThis\.h2cSessionReady\)return;globalThis\.h2cSessionReady=!0/);
    assert.match(routes, /setTimeout\(\(\)=>\{try\{sessionStore\.setItem\(qn/);
    assert.match(shell, /h2cSessionReady/);
    assert.match(shell, /Restoring session/);
    assert.match(shell, /setTimeout\(\(\) => t\.remove\(\), 5000\)/);
    assert.match(shell, /dataset\.h2cTouched/);
  });
});

describe('live-test 2: help, videos, version label', () => {
  it('keeps Help and the legend consistent on ? Need More Info, and does not clip the chain caption', () => {
    assert.match(helpKb, /\? Need More Info/);
    assert.match(helpKb, /id:'coachsetup'/);
    assert.match(helpDiagrams, /\? Need More Info/);
    assert.match(helpDiagrams, /txt\(g, 240, 222,/);
    assert.match(helpDiagrams, /txt\(g, 240, 240,/);
  });

  it('labels the videos FAB and shows the app build', () => {
    assert.match(videos, /Videos \(7\)/);
    assert.match(shell, /App build v61/);
    assert.match(sw, /apollo-rca-shell-v61/);
    assert.match(sw, /coach-steps\.js\?v=2/);
    assert.match(sw, /rca-principles\.js/);
  });
});

describe('RC Coach and providers', () => {
  it('enables the coach for a key or a keyless loopback endpoint', () => {
    assert.equal(coachIsReady({ enabled: true, apiKey: 'sk-test', endpoint: '' }), true);
    assert.equal(coachIsReady({ enabled: true, apiKey: '', endpoint: 'http://127.0.0.1:11434' }), true);
    assert.equal(coachIsReady({ enabled: true, apiKey: '', endpoint: 'https://api.example.com' }), false);
    assert.match(coachReadyHint(), /Add a provider key/);
  });

  it('counts own-timeline rows and strips secrets from coach snapshots', () => {
    const intake = {
      effects: [{ id: 'pe-1', what: 'Fan Seized', timeline: [{ id: 't1', time: '09:00', description: 'Noise rose' }] }],
      timeline: [],
      apiKey: 'sk-secret',
      evidence: []
    };
    const notes = reviewStepEntries('timeline', intake, null);
    assert.equal(notes.length, 0);
    const snap = caseSnapshot({ ...intake, extraHeaders: { Authorization: 'Bearer x' } }, null);
    assert.equal(snap.includes('sk-secret'), false);
    assert.equal(snap.includes('Bearer x'), false);
    assert.equal(snap.includes('Fan Seized'), true);
  });

  it('lists documented presets plus Other / custom and local runtimes', () => {
    const ids = PROVIDER_PRESETS.map((p) => p.id);
    for (const id of ['groq', 'google', 'openrouter', 'huggingface', 'mistral', 'openai', 'deepseek', 'anthropic', 'custom']) {
      assert.ok(ids.includes(id), id);
    }
    assert.equal(PROVIDER_PRESETS.find((p) => p.id === 'custom').label.includes('custom provider'), true);
    assert.deepEqual(LOCAL_PRESETS.map((p) => p.id), ['ollama', 'lmstudio']);
    assert.ok(presetModelIds({ models: ['a', { id: 'b', label: 'B' }] }).includes('b'));
  });

  it('builds OpenAI, Anthropic and Gemini-style custom requests and redacts keys', () => {
    const openai = buildChatRequest({ apiStyle: 'openai', endpoint: 'https://api.example.com/v1', model: 'demo', apiKey: 'sk-live', numPredict: 16 }, [{ role: 'user', content: 'hi' }]);
    assert.equal(openai.body.model, 'demo');
    assert.equal(openai.headers.Authorization, 'Bearer sk-live');
    const anthropic = buildChatRequest({ apiStyle: 'anthropic', endpoint: 'https://api.anthropic.com', model: 'claude', apiKey: 'sk-ant', numPredict: 16 }, [{ role: 'user', content: 'hi' }]);
    assert.equal(anthropic.headers['x-api-key'], 'sk-ant');
    const gemini = buildChatRequest({ apiStyle: 'gemini', endpoint: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-flash', apiKey: 'gm', numPredict: 16 }, [{ role: 'user', content: 'hi' }]);
    assert.ok(gemini.url.includes('gemini-flash') || gemini.body);
    const redacted = redactConfig({ apiKey: 'sk-live', extraHeaders: { Authorization: 'Bearer sk-live', 'X-Trace': 'ok' }, model: 'demo' });
    assert.equal('apiKey' in redacted && redacted.apiKey, false);
    assert.equal(redacted.extraHeaders.Authorization, undefined);
    assert.equal(redacted.extraHeaders['X-Trace'], 'ok');
  });
});

describe('remember-key stays opt-in and memory-only by default', () => {
  const memory = new Map();
  const store = {
    getItem: (key) => { if (!memory.has(key)) throw new Error('blocked'); return memory.get(key); },
    setItem: (key, value) => { throw new Error('blocked set ' + key); },
    removeItem: (key) => { throw new Error('blocked remove ' + key); }
  };

  beforeEach(() => {
    clearBridgeSession();
    memory.clear();
  });
  afterEach(() => {
    clearBridgeSession();
  });

  it('saving a key does not touch localStorage unless rememberKey is true', () => {
    const previous = globalThis.localStorage;
    globalThis.localStorage = store;
    try {
      saveBridgeConfig({ apiKey: 'sk-session', rememberKey: false, endpoint: 'https://api.example.com', enabled: true });
      assert.equal(getBridgeConfig().apiKey, 'sk-session');
      assert.equal(loadRememberedKey(), null);
    } finally {
      globalThis.localStorage = previous;
    }
  });

  it('parseExtraHeaders rejects header names with newlines', () => {
    const headers = parseExtraHeaders('X-Good: yes\nBad Name\n: no');
    assert.equal(headers['X-Good'], 'yes');
    assert.ok(!Object.keys(headers).some((key) => key.includes('\n')));
  });
});

describe('live-test 2 follow-up: P05 jump, evidence debounce, visual refresh', () => {
  it('P05 See references are clickable and include a node id when known', () => {
    assert.match(routes, /function IntegrityStatus\(/);
    assert.match(routes, /h2c-integrity-ref/);
    assert.match(routes, /function focusIntegrityRef\(/);
    assert.match(routes, /data-node/);
    assert.match(css, /\.h2c-integrity-ref/);
  });
  it('evidence text and cause fields debounce parent updates while focused', () => {
    assert.match(routes, /function EvField\(/);
    assert.match(routes, /onCommit:e=>a\(t\.id,\{text:e\}\)/);
    assert.match(routes, /onCommit:e=>a\(t\.id,\{cause:e\}\)/);
  });
  it('visual refresh keeps brand gold, focus rings, and mandatory STOP red', () => {
    assert.match(css, /v60: visual refresh/);
    assert.match(css, /\.border-gold\{border-color:#c9a227\}/);
    assert.match(css, /outline:3px solid #0a5c45/);
    assert.match(css, /#d32f2f/);
    assert.match(css, /\.h2c-chart-stage\{flex:1 1 auto/);
    assert.match(shell, /App build v61/);
    assert.match(sw, /apollo-rca-shell-v61/);
  });
  it('Ask-coach buttons attach once to headings and Chart matches the Chart heading', () => {
    assert.match(shell, /heading.nextElementSibling && heading.nextElementSibling.classList.contains\('h2c-ask-coach'\)/);
    assert.match(steps, /realitychart\|\^chart\$\|h2c chart/);
  });
});

describe('bold design pass 2', () => {
  it('hero header groups primary CTAs and a tools row', () => {
    assert.match(routes, /h2c-hero-title/);
    assert.match(routes, /h2c-hero-primary/);
    assert.match(routes, /h2c-hero-tools/);
    assert.match(routes, /h2c-cta-new/);
    assert.match(routes, /Open-source, AI-aided Apollo RealityCharting/);
    assert.match(css, /v61: bold design pass 2/);
    assert.match(shell, /App build v61/);
    assert.match(sw, /apollo-rca-shell-v61/);
  });
  it('step badges never use ellipsis and mark current vs done', () => {
    assert.match(shell, /is-current/);
    assert.match(shell, /is-done/);
    assert.doesNotMatch(shell, /\.h2c-step-pill[^{]*{[^}]*text-overflow:\s*ellipsis/);
    assert.match(shell, /Before the chart/);
  });
  it('fits the chart to width with a readable min scale and defaults to one primary effect', () => {
    assert.match(routes, /fit>=\.85\?Math\.min\(1\.2,fit\):Math\.max\(\.85/);
    assert.match(routes, /useState\)\(\(\)=>e\.length>1&&e\[0\]&&e\[0\]\.code\?e\[0\]\.code:`all`\)/);
    assert.match(routes, /fontSize:wrapTitle\(a\.title\)\.length>1\?15:17/);
    assert.match(css, /\.h2c-chart-frame\{min-height:700px/);
  });
});

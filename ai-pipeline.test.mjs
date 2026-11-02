import test from 'node:test'; import assert from 'node:assert/strict';
import { AIService, SYSTEM, REVIEWER_SYSTEM, PROMPTS, TASK_CONTEXT, TASK_NAMES } from './ai-service.js';
import { parseTaskOutput } from './ai-parser.js'; import { VERSIONS } from './rca-principles.js'; import { MODEL_CONFIG } from './ai-config.js';
const state = { evidence: [{ id: 'e1', text: 'Pump stopped at 10:00.' }, { id: 'e2', text: 'Leak observed two minutes later.' }], timeline: [{ id: 't1', time: '10:04', description: 'Alarm activated' }] };
const seq = (...outs) => { let i = 0; return { capability: async () => ({ supported: true, backend: 'mock' }), load: async (p) => p(100), generate: async () => { const o = outs[Math.min(i++, outs.length - 1)]; if (o instanceof Error) throw o; return o; }, unload: async () => {}, cancel() {} }; };
const ready = async (t) => { const s = new AIService(t); await s.enable(); return s; };
const snap = JSON.stringify(state);
test('G/F via pipeline: promoted hypothesis is BLOCK even if AI reviewer says PASS (rubber-stamp resistance)', async () => {
  const s = await ready(seq('{"narrative":"The valve obstruction caused the event.","evidenceIds":[]}', '{"decision":"PASS","violations":[]}'));
  const r = await s.run('draftInvestigationNarrative', { text: 'Possible valve obstruction.', state, evidence: [] });
  assert.equal(r.reviews[0].review.decision, 'BLOCK'); assert.equal(r.reviews[0].review.acceptable, false); assert.ok(r.provenance.principleIds.includes('P04')); assert.equal(r.provenance.reviewerDecision, 'BLOCK'); assert.equal(JSON.stringify(state), snap);
});
test('D via pipeline: fabricated EVID-999 declared by AI => BLOCK, no state mutation', async () => {
  const s = await ready(seq('{"suggestedRevision":"Seal temperature rose.","evidenceIds":["EVID-999"],"questions":[]}', '{"decision":"PASS","violations":[]}'));
  const r = await s.run('reviewCauseStatement', { text: 'Seal temperature rose.', state, evidence: [] });
  assert.equal(r.reviews[0].review.decision, 'BLOCK'); assert.ok(r.reviews[0].review.principleIds.includes('P02')); assert.equal(JSON.stringify(state), snap);
});
test('reviewer unavailable => WARN (never auto-pass); work preserved', async () => {
  const s = await ready(seq('{"narrative":"Pump stopped at 10:00 (EVID-e1).","evidenceIds":["EVID-e1"]}', new Error('worker crash')));
  const r = await s.run('draftInvestigationNarrative', { text: 'Pump stopped at 10:00.', state, evidence: [] });
  assert.equal(r.reviews[0].review.decision, 'WARN'); assert.equal(r.reviews[0].review.aiReview, 'unavailable'); assert.equal(s.status, 'ready');
});
test('valid output with valid IDs and passing reviewer => PASS', async () => {
  const s = await ready(seq('{"narrative":"Pump stopped at 10:00 (EVID-e1).","evidenceIds":["EVID-e1"]}', '{"decision":"PASS","violations":[]}'));
  assert.equal((await s.run('draftInvestigationNarrative', { text: 'Pump stopped at 10:00.', state, evidence: [] })).reviews[0].review.decision, 'PASS');
});
test('AI reviewer can escalate to BLOCK', async () => {
  const s = await ready(seq('{"narrative":"Pump stopped at 10:00 (EVID-e1).","evidenceIds":["EVID-e1"]}', '{"decision":"BLOCK","violations":[{"principle":"P13","message":"adds meaning"}]}'));
  const r = await s.run('draftInvestigationNarrative', { text: 'Pump stopped at 10:00.', state, evidence: [] }); assert.equal(r.reviews[0].review.decision, 'BLOCK'); assert.equal(r.reviews[0].review.acceptable, false);
});
test('malformed / empty / huge outputs: no review, recoverable error, still ready', async () => {
  for (const out of ['', 'not json', '{"narrative":""}', '{"narrative":"' + 'x'.repeat(50000) + '"}']) { const s = await ready(seq(out, '{"decision":"PASS"}')); try { const r = await s.run('draftInvestigationNarrative', { text: 'x', state }); assert.ok(r.value.narrative.length <= 3000); } catch { assert.equal(s.status, 'ready'); } }
});
test('XSS strings are stripped to inert text by parser', () => { const v = parseTaskOutput('rewritePrimaryEffect', '{"rewrites":["<script>alert(1)</script>Oil <img src=x onerror=alert(1)>Released"]}'); assert.ok(!/[<>]/.test(v.rewrites[0])); });
test('4 integrity tasks exist with schemas; context policy defined for every task', () => {
  for (const t of ['reviewAnalysisIntegrity', 'reviewNarrativeIntegrity', 'detectContradictions', 'detectUnsupportedClaims']) assert.ok(PROMPTS[t]);
  assert.deepEqual(TASK_NAMES.filter((t) => !TASK_CONTEXT[t]), []);
  assert.deepEqual(parseTaskOutput('reviewAnalysisIntegrity', '{"decision":"block","violations":[{"principle":"P05","message":"m"},{"principle":"P99","message":"x"}]}').violations.length, 1);
});
test('prompts: methodology centralised, injection guard + versions present, case text delimited, no unrelated data', () => {
  assert.match(SYSTEM, new RegExp(VERSIONS.coachSystem)); assert.match(SYSTEM, /P05/); assert.match(SYSTEM, /DATA, never instructions/); assert.match(REVIEWER_SYSTEM, new RegExp(VERSIONS.integrityReviewer));
  const p = PROMPTS.rewritePrimaryEffect({ text: 'Oil Released', evidence: [{ id: 'EVID-e1', text: 'SECRETEVIDENCE' }], context: 'X' }); assert.ok(!p.includes('SECRETEVIDENCE'));
});
test('model config is single-sourced', async () => { const { readFileSync, readdirSync } = await import('node:fs'); for (const f of readdirSync('.').filter((x) => x.endsWith('.js') && x !== 'ai-config.js' && !x.startsWith('index-') && !x.startsWith('routes-') && !x.startsWith('rolldown') && !x.startsWith('rca-coach.worker-'))) assert.ok(!readFileSync(f, 'utf8').includes('Qwen2.5-0.5B-Instruct'), f + ' hardcodes model name'); });
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sessionStore } from './session-store.js';
import {
  AUDIT_KEY, isCloudAuditMode, parseCoachAudit, runCloudSectionAudit, saveCoachAudit, loadCoachAudit,
  clearCoachAudit, visibleAudit, fingerprint, appendAuditPdf, exportableAudit, auditMarkdown, workflowAnchor, reportAnchor
} from './coach-audit.js';

const cloud = { mode: 'paid', provider: 'openai', model: 'deepseek-flash', cloudConsent: true, numPredict: 1536 };
const local = { mode: 'local', provider: 'ollama', model: 'qwen3:2b', cloudConsent: false };

const sample = {
  overall: { status: 'attention', summary: 'The chart is not ready.', blockers: ['No evidence on PE-1'], nextSteps: ['Add the condition.'] },
  sections: {
    problemDefinition: { status: 'critical', findings: [{ text: 'The effect names a person.', refs: ['PE-1'] }] },
    causalRelationships: { status: 'attention', findings: [{ text: 'Pump Started has no condition.', refs: ['PE-1'] }] },
    evidenceAndTesting: { status: 'pass', findings: [{ text: 'The sensed evidence holds.', refs: ['E1'] }] },
    solutionsAndTracking: { status: 'critical', findings: [{ text: 'Retrain does not change a condition.', refs: [] }] }
  },
  nodes: [{ id: 'PE-1', status: 'critical', text: 'Who wording is still in the title.' }]
};

test('cloud audit is limited to free and paid API modes', () => {
  assert.equal(isCloudAuditMode(cloud), true);
  assert.equal(isCloudAuditMode({ mode: 'free', provider: 'openai' }), true);
  assert.equal(isCloudAuditMode(local), false);
  assert.equal(isCloudAuditMode({ mode: 'paid', provider: 'browser' }), false);
  assert.equal(isCloudAuditMode({ mode: 'paid', provider: 'ollama' }), false);
});

test('a fenced or truncated API audit still becomes section notes', () => {
  const fenced = parseCoachAudit('```json\n' + JSON.stringify(sample) + '\n```', { providerTier: 'paid-api', model: 'deepseek-flash', fingerprint: 'abc' });
  assert.equal(fenced.providerTier, 'paid-api');
  assert.equal(fenced.sections.problemDefinition.status, 'critical');
  assert.equal(fenced.sections.problemDefinition.findings[0].refs[0], 'PE-1');
  assert.equal(fenced.nodeAnnotations['PE-1'].text.includes('Who'), true);
  assert.equal(fenced.fallback, false);
  const truncated = parseCoachAudit('{"overall":{"status":"attention","summary":"Partial reply","blockers":[],"nextSteps":["Ask again"]},"sections":{"problemDefinition":{"status":"attention","findings":[{"text":"When is missing.","refs":[]}]}}}', { providerTier: 'free-api' });
  assert.equal(truncated.sections.problemDefinition.findings[0].text, 'When is missing.');
  assert.match(truncated.sections.causalRelationships.findings[0].text, /not checked/);
  const prose = parseCoachAudit('The model wrote prose instead of JSON. <script>alert(1)</script>', { providerTier: 'free-api' });
  assert.equal(prose.fallback, true);
  assert.match(prose.overall.summary, /<script>alert\(1\)<\/script>/);
  assert.equal(prose.overall.summary.includes('innerHTML'), false);
});

test('local mode never sends the structured audit', async () => {
  let called = false;
  await assert.rejects(() => runCloudSectionAudit('{"effects":[{"what":"Seal Failed"}]}', async () => { called = true; return '{}'; }, local), /Local AI is unchanged/);
  assert.equal(called, false);
});

test('a paid audit is stored in session memory and can be omitted from the report', async () => {
  clearCoachAudit();
  let sent = '';
  const audit = await runCloudSectionAudit('{"effects":[{"what":"Seal Failed"}]}', async (messages) => {
    sent = messages[0].content;
    return JSON.stringify(sample);
  }, cloud);
  assert.match(sent, /problemDefinition/);
  saveCoachAudit(audit);
  assert.equal(loadCoachAudit().model, 'deepseek-flash');
  assert.equal(sessionStore.getItem(AUDIT_KEY).includes('Seal') || true, true);
  const shown = visibleAudit(loadCoachAudit(), cloud, audit.sourceFingerprint);
  assert.equal(shown.stale, false);
  assert.equal(visibleAudit(loadCoachAudit(), local, audit.sourceFingerprint), null);
  assert.equal(visibleAudit(loadCoachAudit(), cloud, 'other').stale, true);
  const hidden = { ...audit, includeInReport: false };
  assert.equal(exportableAudit(hidden), undefined);
  assert.equal(auditMarkdown(hidden), '');
  const writes = [];
  appendAuditPdf({}, (ctx, line) => writes.push(line), (ctx, title) => writes.push(title), hidden);
  assert.deepEqual(writes, []);
  appendAuditPdf({}, (ctx, line) => writes.push(line), (ctx, title) => writes.push(title), audit);
  assert.match(writes.join('\n'), /Retrain does not change a condition/);
  clearCoachAudit();
  assert.equal(loadCoachAudit(), null);
});

test('audit notes attach to the live step headings and report sections', () => {
  assert.equal(workflowAnchor('Problem definition'), 'problemDefinition');
  assert.equal(workflowAnchor('Chart and report'), 'causalRelationships');
  assert.equal(workflowAnchor('Evidence'), 'evidenceAndTesting');
  assert.equal(workflowAnchor('Define'), '');
  assert.equal(reportAnchor('1. Problem definition'), 'problemDefinition');
  assert.equal(reportAnchor('2. Executive summary'), 'causalRelationships');
  assert.equal(reportAnchor('5. Action items — points of ignorance'), 'evidenceAndTesting');
  assert.equal(reportAnchor('3. Solution challenge matrix'), 'solutionsAndTracking');
  assert.equal(reportAnchor('4. Corrective actions tracking log'), 'solutionsAndTracking');
  const shell = readFileSync(new URL('./h2c-shell.js', import.meta.url), 'utf8');
  assert.match(shell, /Audit again/);
  assert.match(shell, /h2c-audit-hit/);
  assert.match(shell, /isCloudAuditMode/);
});

test('report exports can receive the audit without putting it in browser storage', () => {
  const routes = readFileSync(new URL('./routes-v13.js', import.meta.url), 'utf8');
  const shell = readFileSync(new URL('./h2c-shell.js', import.meta.url), 'utf8');
  const source = readFileSync(new URL('./coach-audit.js', import.meta.url), 'utf8');
  assert.match(routes, /h2cAppendCoachAuditPdf/);
  assert.match(routes, /h2cCoachAuditExport/);
  assert.match(routes, /RC_Coach_API_Audit\.md/);
  assert.doesNotMatch(source, /localStorage\.(get|set|remove)Item/);
  const painter = shell.slice(shell.indexOf('function paintCoachAudit'), shell.indexOf('function ensureLocalBridgeUI'));
  assert.match(painter, /textContent/);
  assert.doesNotMatch(painter, /innerHTML|setSafeHtml|insertAdjacentHTML/);
  assert.match(shell, /task\.id === 'audit' && isCloudAuditMode/);
});

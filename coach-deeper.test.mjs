import test from 'node:test';
import assert from 'node:assert/strict';
import { caseBrief, parseDeeper, runDeeperReview, readSolutionMatrix, currentCaseBrief, readReportText, briefForReview, presentFinding } from './coach-deeper.js';
import { sessionStore } from './session-store.js';

test('case brief drops images and stays bounded', () => {
  const brief = caseBrief({ effects: [{ what: 'Oil Released', image: 'data:image/png;base64,AAAA', evidence: [{ id: 'E1', text: 'Pool on skid' }] }] }, 80);
  assert.equal(brief.includes('AAAA'), false);
  assert.ok(brief.length <= 80);
  assert.match(brief, /Oil Released/);
});

test('a longer review parses findings and refuses a partial answer', () => {
  const review = parseDeeper('<think>hidden</think>{"summary":"One set has no condition.","findings":[{"kind":"pairing","text":"Pump Started has no condition.","evidenceIds":["E1"]}],"nextStep":"Ask what was different."}');
  assert.equal(review.summary, 'One set has no condition.');
  assert.equal(review.findings[0].evidenceIds[0], 'E1');
  assert.equal(review.summary.includes('hidden'), false);
  assert.throws(() => parseDeeper('{"findings":[{"text":"half"}]}'), /no summary/);
});

test('longer review sends the case once and does not switch provider', async () => {
  let body;
  const review = await runDeeperReview('solutions', '{"effects":[{"what":"Oil Released"}]}', async (messages, cfg) => {
    body = { messages, cfg };
    return '{"summary":"The action only says retrain.","findings":[{"kind":"solution","text":"Retrain does not change a condition.","evidenceIds":[]}],"nextStep":"Name the condition the action would change."}';
  });
  assert.match(body.messages[1].content, /Oil Released/);
  assert.match(body.messages[0].content, /one action plus at least one condition/);
  assert.equal(body.cfg.provider, 'ollama');
  assert.match(review.findings[0].text, /Retrain/);
});

test('screen solutions receives the filled solution challenge matrix', () => {
  sessionStore.setItem('realitychart-intake-v1', JSON.stringify({ effects: [{ what: 'Seal Failed' }] }));
  const checked = (yes) => ({ checked: yes, querySelector: () => null });
  const label = (name, yes) => ({ textContent: name, querySelector: () => checked(yes) });
  const card = {
    querySelector: (sel) => sel === 'p' ? { textContent: 'CA-01 · Seal Worn' } : null,
    querySelectorAll: (sel) => sel === 'span' ? [{ textContent: 'Passes' }] : sel === 'label' ? [
      label('Prevents recurrence', true),
      label('Within our control', true),
      label('Meets goals and ROI', true),
      label('Does not cause other problems', true)
    ] : []
  };
  const area = { value: 'Replace the worn seal with a cooled design', closest: () => card };
  const section = { querySelectorAll: (sel) => sel === 'textarea' ? [area] : [] };
  const heading = { textContent: '3. Solution challenge matrix', closest: () => section };
  const doc = { querySelectorAll: (sel) => sel === 'h3' ? [heading] : [] };
  const rows = readSolutionMatrix(doc);
  assert.equal(rows[0].action, 'Replace the worn seal with a cooled design');
  assert.equal(rows[0].checks.every((item) => item.yes), true);
  const brief = currentCaseBrief(doc);
  assert.match(brief, /Replace the worn seal/);
  assert.match(brief, /Prevents recurrence: yes/);
  assert.match(brief, /Seal Failed/);
  sessionStore.removeItem('realitychart-intake-v1');
});

test('full report audit includes every numbered section and entered actions', async () => {
  sessionStore.setItem('realitychart-intake-v1', JSON.stringify({ effects: [{ what: 'Seal Failed' }] }));
  const section = (title, text, fields = []) => ({
    querySelector: (sel) => /h2|h3|h1/.test(sel) ? { textContent: title } : null,
    querySelectorAll: (sel) => sel === 'textarea, input' ? fields : [],
    textContent: `${title}\n${text}`
  });
  const sections = [
    section('1. Problem definition', 'Seal leaked at startup'),
    section('2. Executive summary', 'Leak followed vibration'),
    section('3. Solution challenge matrix', 'CA-01', [{ type: 'textarea', value: 'Fit a cooled seal', closest: () => null }]),
    section('4. Corrective actions tracking log', 'CA-01 owner Pat'),
    section('5. Action items — points of ignorance', 'Need the seal teardown')
  ];
  const article = { querySelectorAll: (sel) => sel === 'header, section' ? sections : [], contains: () => false };
  const doc = { querySelector: (sel) => sel === 'article.print-sheet' ? article : null, getElementById: (id) => id === 'realitychart' ? { textContent: 'Seal Failed STOP' } : null };
  const text = readReportText(doc);
  for (const title of ['1. Problem definition', '2. Executive summary', '3. Solution challenge matrix', '4. Corrective actions tracking log', '5. Action items']) {
    assert.match(text, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(text, /Fit a cooled seal/);
  assert.match(text, /Cause chart/);
  const brief = briefForReview('audit', doc);
  assert.match(brief, /Formal report/);
  assert.match(brief, /Seal Failed/);
  let sent = '';
  const review = await runDeeperReview('audit', brief, async (messages, cfg) => {
    sent = messages[1].content;
    assert.ok(cfg.numPredict >= 768);
    const findings = ['1. Problem definition', '2. Executive summary', '3. Solution challenge matrix', '4. Corrective actions tracking log', '5. Action items'].map((part) => ({ kind: 'section', text: `${part} was checked.`, evidenceIds: [] }));
    return JSON.stringify({ summary: 'All five report parts were checked.', findings, nextStep: 'Confirm the seal teardown evidence.' });
  });
  assert.match(sent, /Audit every numbered part/);
  assert.match(sent, /Fit a cooled seal/);
  assert.equal(review.findings.length, 5);
  assert.match(review.findings[2].text, /Solution challenge matrix/);
  sessionStore.removeItem('realitychart-intake-v1');
});

test('a dense audit finding becomes a title and labeled points', () => {
  const shown = presentFinding('1. Problem definition – Holds: includes PE-1 and PE-2 details. Missing: evidence references are empty. No contradiction with causal rules.');
  assert.equal(shown.title, '1. Problem definition');
  assert.deepEqual(shown.points.map((point) => point.label), ['Holds', 'Missing', 'No contradiction']);
  assert.match(shown.points[1].text, /evidence references/);
  const sentences = presentFinding('The action only retrains people. It does not change a condition.');
  assert.equal(sentences.points.length, 2);
  assert.equal(sentences.points[0].label, '');
});



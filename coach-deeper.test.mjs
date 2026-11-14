import test from 'node:test';
import assert from 'node:assert/strict';
import { caseBrief, parseDeeper, runDeeperReview, readSolutionMatrix, currentCaseBrief } from './coach-deeper.js';
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


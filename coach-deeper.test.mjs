import test from 'node:test';
import assert from 'node:assert/strict';
import { caseBrief, parseDeeper, runDeeperReview } from './coach-deeper.js';

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

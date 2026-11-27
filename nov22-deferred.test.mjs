import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { insertCauseAbove, insertCauseAboveRows, visibleTree, toggleCollapsed, countDescendants, sortTimeline, linkTimelineEvidence, ensureNodesForRows } from './chart-sync.js';

const tree = () => ({ id: 'pe', kind: 'primary', title: 'Oil Released', children: [
  { id: 'a1', kind: 'action', title: 'Seal Failed', children: [
    { id: 'a2', kind: 'action', title: 'Seal Overheated', children: [] },
    { id: 'c2', kind: 'condition', title: 'Cooling Lost', children: [] }] },
  { id: 'c1', kind: 'condition', title: 'Oil Present', children: [] }] });

test('Add cause above inserts between node and parent', () => {
  const out = insertCauseAbove(tree(), 'a1', { title: 'Gasket Leaked', id: 'n1' });
  assert.equal(out.inserted, true);
  assert.equal(out.root.children[0].id, 'n1');
  assert.equal(out.root.children[0].kind, 'action');
  assert.equal(out.root.children[0].children[0].id, 'a1');
  assert.equal(out.root.children[0].children[0].children.length, 2);
  assert.equal(out.root.children[1].id, 'c1');
});

test('Add cause above refuses the primary effect', () => {
  const t = tree();
  assert.equal(insertCauseAbove(t, 'pe').inserted, false);
  assert.equal(insertCauseAbove(t, 'missing').inserted, false);
});

test('Add cause above rows re-link and shift layers', () => {
  const intake = { evidence: [
    { id: 'e1', cause: 'Seal Failed', layer: 1, kind: 'action', explains: '', pe: 'pe' },
    { id: 'e2', cause: 'Seal Overheated', layer: 2, kind: 'action', explains: 'Seal Failed', pe: 'pe' },
    { id: 'e3', cause: 'Oil Present', layer: 1, kind: 'condition', explains: '', pe: 'pe' }], effects: [] };
  const next = insertCauseAboveRows(intake, 'Seal Failed', { title: 'Gasket Leaked', pe: 'pe', nodeId: 'n1' });
  const by = Object.fromEntries(next.evidence.map((r) => [r.cause, r]));
  assert.equal(by['Gasket Leaked'].explains, '');
  assert.equal(by['Gasket Leaked'].layer, 1);
  assert.equal(by['Gasket Leaked'].nodeId, 'n1');
  assert.equal(by['Seal Failed'].explains, 'Gasket Leaked');
  assert.equal(by['Seal Failed'].layer, 2);
  assert.equal(by['Seal Overheated'].layer, 3);
  assert.equal(by['Oil Present'].layer, 1);
});

test('Inserted tree plus rows do not duplicate nodes', () => {
  const out = insertCauseAbove(tree(), 'a1', { title: 'Gasket Leaked', id: 'n1' });
  const intake = insertCauseAboveRows({ evidence: [{ id: 'e1', cause: 'Seal Failed', layer: 1, kind: 'action', explains: '', pe: 'pe' }], effects: [] }, 'Seal Failed', { title: 'Gasket Leaked', pe: 'pe', nodeId: 'n1' });
  const anal = ensureNodesForRows({ trees: [{ id: 'pe', root: out.root }] }, intake);
  let n = 0; const walk = (x) => { if (x.title === 'Gasket Leaked') n++; (x.children || []).forEach(walk); };
  walk(anal.trees[0].root);
  assert.equal(n, 1);
});

test('Collapse hides a branch without deleting it', () => {
  const t = tree();
  const ids = toggleCollapsed([], 'a1');
  assert.deepEqual(ids, ['a1']);
  const v = visibleTree(t, ids);
  assert.equal(v.children[0].children.length, 0);
  assert.equal(v.children[0].collapsedCount, 2);
  assert.match(v.children[0].title, /\+2 hidden/);
  assert.equal(t.children[0].children.length, 2);
  assert.deepEqual(toggleCollapsed(ids, 'a1'), []);
  const f = visibleTree({ ...t, children: [{ ...t.children[0], h2cFold: true }, t.children[1]] });
  assert.equal(f.children[0].children.length, 0);
  assert.equal(countDescendants(t), 4);
});

test('Timeline sort puts unknown times last in typed order', () => {
  const rows = [
    { time: 'unknown', description: 'Zeta' },
    { time: '14:30', description: 'B' },
    { time: '?', description: 'Alpha' },
    { time: '09:05', description: 'A' },
    { time: '', description: 'Mid' }];
  assert.deepEqual(sortTimeline(rows).map((r) => r.description), ['A', 'B', 'Zeta', 'Alpha', 'Mid']);
});

test('Timeline event links to and unlinks from an evidence row', () => {
  const tl = [{ id: 't1', time: '14:00', description: 'Alarm' }, { id: 't2', time: '14:05', description: 'Trip' }];
  const linked = linkTimelineEvidence(tl, 1, 'e9');
  assert.equal(linked[1].evidenceId, 'e9');
  assert.equal(linked[0].evidenceId, undefined);
  assert.equal(linkTimelineEvidence(linked, 1, null)[1].evidenceId, undefined);
});

test('UI wiring is present in the bundle', () => {
  const src = readFileSync(new URL('./routes-v13.js', import.meta.url), 'utf8');
  assert.match(src, /children:`Add cause above`/);
  assert.match(src, /`Collapse branch`/);
  assert.match(src, /visibleTree\(e\.root\)/);
  assert.match(src, /Sort by time \(unknown last\)/);
  assert.match(src, /Linked evidence row/);
  assert.match(src, /function ee\(e\)\{return sortTimeline/);
});

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { getSampleCase } from './sample-case.js';
import {
  collectNodes,
  allEvidenceRows,
  syncChartToIntake,
  applyIntakeToChart,
  ensureNodesForRows,
  removeEvidenceRow,
  addEvidenceForNode,
  patchPrimaryEffect
} from './chart-sync.js';

const routes = readFileSync(new URL('./routes-v13.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./styles-v13.css', import.meta.url), 'utf8');
const sw = readFileSync(new URL('./sw.js', import.meta.url), 'utf8');

function walkTerms(node, out = []) {
  if (!node) return out;
  if (node.terminator) out.push({ title: node.title, terminator: node.terminator });
  for (const child of node.children || []) walkTerms(child, out);
  return out;
}

describe('chart-sync helpers', () => {
  it('copies a chart title edit onto the matching evidence row (chart → table)', () => {
    const sample = getSampleCase();
    const intake = syncChartToIntake(sample.intake, sample.analysis);
    const analysis = sample.analysis;
    const node = collectNodes(analysis).find((n) => n.node.title === 'Truck Kept Moving After Alarm');
    assert.ok(node);
    node.node.title = 'Truck Kept Rolling After Alarm';
    const next = syncChartToIntake(intake, analysis);
    const rows = allEvidenceRows(next).filter((r) => r.nodeId === node.node.id || r.cause.includes('Kept Rolling'));
    assert.ok(rows.length);
    assert.ok(rows.every((r) => r.cause === 'Truck Kept Rolling After Alarm'));
  });

  it('copies an evidence-table cause edit onto the chart node (table → chart)', () => {
    const sample = getSampleCase();
    const intake = syncChartToIntake(sample.intake, sample.analysis);
    const analysis = sample.analysis;
    const row = intake.evidence.find((r) => r.cause === 'Hot Turbo Surface');
    assert.ok(row && row.nodeId);
    row.cause = 'Hot Turbo Face';
    const next = applyIntakeToChart(analysis, intake);
    const node = collectNodes(next).find((n) => n.node.id === row.nodeId || n.node.title === 'Hot Turbo Face');
    assert.ok(node);
    assert.equal(node.node.title, 'Hot Turbo Face');
  });

  it('adds and removes an evidence row for a cause without leaving an orphan', () => {
    const { intake, analysis } = getSampleCase();
    const node = collectNodes(analysis).find((n) => n.node.title === 'Oxygen Present');
    const before = allEvidenceRows(intake).length;
    const added = addEvidenceForNode(intake, node.node, node.treeId);
    const newRow = allEvidenceRows(added).find((r) => r.nodeId === node.node.id && !intake.evidence.some((x) => x.id === r.id));
    assert.ok(newRow);
    assert.equal(allEvidenceRows(added).length, before + 1);
    const removed = removeEvidenceRow(added, newRow.id);
    assert.equal(allEvidenceRows(removed).length, before);
    assert.ok(!allEvidenceRows(removed).some((r) => r.id === newRow.id));
  });

  it('creates a chart node from a new evidence-table cause and keeps STOP and ? terminators', () => {
    const sample = getSampleCase();
    const intake = {
      ...sample.intake,
      evidence: [
        ...sample.intake.evidence,
        {
          id: 'ev-new-sync',
          text: 'Workshop photos show a missing heat shield bolt hole plug.',
          source: 'Workshop photos',
          tier: 'Inferred',
          cause: 'Shield Bolt Missing',
          kind: 'condition',
          layer: 2,
          explains: 'Hot Turbo Surface',
          pe: 'pe-1'
        }
      ]
    };
    let anal = ensureNodesForRows(applyIntakeToChart(sample.analysis, intake), intake);
    const created = collectNodes(anal).find((n) => n.node.title === 'Shield Bolt Missing');
    assert.ok(created);
    assert.equal(created.node.kind, 'condition');
    assert.equal(created.parent?.title, 'Hot Turbo Surface');
    const terms = walkTerms(anal.trees[0].root);
    assert.ok(terms.some((t) => t.terminator.type === 'stop' && t.title === 'Oxygen Present'));
    assert.ok(terms.some((t) => t.terminator.type === 'question' && t.title === 'Rebuild Pack List Unknown'));
  });

  it('Refresh-style two-way sync updates a PE title both ways and does not drop sample structure', () => {
    const sample = getSampleCase();
    sample.analysis.trees[0].root.title = 'Haul Truck Fire (updated)';
    let intake = syncChartToIntake(sample.intake, sample.analysis);
    assert.equal(intake.effects[0].what, 'Haul Truck Fire (updated)');
    intake = patchPrimaryEffect(intake, intake.effects[0].id, { where: 'West pit workshop pad', what: 'Haul Truck Fire (updated)' });
    let anal = ensureNodesForRows(applyIntakeToChart(sample.analysis, intake), intake);
    intake = syncChartToIntake(intake, anal);
    assert.equal(anal.trees[0].root.title, 'Haul Truck Fire (updated)');
    assert.equal(intake.effects[0].where, 'West pit workshop pad');
    const titles = collectNodes(anal).map((n) => n.node.title);
    assert.ok(titles.includes('Oxygen Present'));
    assert.ok(titles.includes('Truck Kept Moving After Alarm'));
    const terms = walkTerms(anal.trees[0].root);
    assert.equal(terms.filter((t) => t.terminator.type === 'stop').length, 1);
    assert.equal(terms.filter((t) => t.terminator.type === 'question').length, 1);
  });
});

describe('chart-sync wiring', () => {
  it('wires evidence-chip clicks, inspector highlight, and add/remove into the chart', () => {
    assert.match(routes, /from"\.\/chart-sync\.js"/);
    assert.match(routes, /all\.slice\(0,3\)\.map\(e=>\(\{id:e\.id,source:e\.source/);
    assert.match(routes, /"data-evidence":/);
    assert.match(routes, /selectedEvidenceId/);
    assert.match(routes, /onAddEvidence/);
    assert.match(routes, /onRemoveEvidence/);
    assert.match(routes, /data-evidence-row/);
    assert.match(routes, /h2c-ev-selected/);
    assert.match(routes, /"aria-label":`Kind`/);
    assert.match(routes, /"aria-label":`Layer`/);
  });

  it('keeps two-way edits for live entries and the sample, including Refresh and a Synced toast', () => {
    assert.match(routes, /let refreshSync=/);
    assert.match(routes, /setSyncToast\(`Synced`\)/);
    assert.match(routes, /h2c-sync-toast/);
    assert.match(routes, /h2c-refresh-btn/);
    assert.match(routes, /children:`Refresh`/);
    assert.match(styles, /\.h2c-sync-toast/);
    assert.match(routes, /flow&&P\.kind!==`primary`&&t\(mapRows\(/);
    assert.doesNotMatch(routes, /flow&&!sampleMatch\(e\)&&P\.kind!==`primary`&&t\(mapRows\(/);
    assert.match(routes, /if\(sampleMatch\(e\)\)\{let a=ensureNodesForRows/);
    assert.match(routes, /mergeAnalysis\(n,fe\(e\),e\)/);
    assert.match(routes, /loadPreparedSample\(\)\{let c=getSampleCase\(\),intake=syncChartToIntake/);
  });

  it('opens PE, STOP, Need More Info, and GOTO elements in the inspector', () => {
    assert.match(routes, /"data-term":`stop`/);
    assert.match(routes, /"data-term":`question`/);
    assert.match(routes, /"data-term":`goto`/);
    assert.match(routes, /children:`Where`/);
    assert.match(routes, /children:`Safety issue`/);
    assert.match(routes, /patchPrimaryEffect/);
  });

  it('pins the new sync module in the offline shell cache', () => {
    assert.match(sw, /const CACHE = 'apollo-rca-shell-v63'/);
    assert.match(sw, /'\.\/chart-sync\.js'/);
  });
});

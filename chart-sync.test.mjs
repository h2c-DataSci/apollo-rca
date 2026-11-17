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
  patchPrimaryEffect,
  refreshFromIntake,
  reselectNode
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

  it('Refresh keeps a newer Problem definition What value instead of reverting to a stale chart title', () => {
    const sample = getSampleCase();
    const intake = syncChartToIntake(sample.intake, sample.analysis);
    intake.effects[0].what = 'Pump Failed';
    // Stored analysis still has the older title, as after a form edit that is shown live via applyIntakeToChart.
    assert.equal(sample.analysis.trees[0].root.title, 'Haul Truck Fire');
    const { intake: next, analysis: anal } = refreshFromIntake(intake, sample.analysis);
    assert.equal(next.effects[0].what, 'Pump Failed');
    assert.equal(anal.trees[0].root.title, 'Pump Failed');
    assert.notEqual(next.effects[0].what, 'Haul Truck Fire');
  });

  it('reselectNode keeps an existing id and remaps by title when ids change', () => {
    const sample = getSampleCase();
    const node = collectNodes(sample.analysis).find((n) => n.node.title === 'Oxygen Present');
    assert.equal(reselectNode(sample.analysis, node.node.id, 'Oxygen Present'), node.node.id);
    assert.equal(reselectNode(sample.analysis, 'missing-id', 'Oxygen Present'), node.node.id);
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
    assert.match(sw, /importScripts\('\.\/app-build\.js'\)/);
    assert.match(sw, /const CACHE = self\.H2C_SHELL_CACHE/);
    assert.match(sw, /'\.\/chart-sync\.js'/);
  });
});

describe('live v63 bug fixes', () => {
  const shell = readFileSync(new URL('./h2c-shell.js', import.meta.url), 'utf8');
  const build = readFileSync(new URL('./app-build.js', import.meta.url), 'utf8');

  it('makes STOP and Need More Info glyphs selectable with a hit area and inspector focus', () => {
    assert.match(routes, /onSelect:sel/);
    assert.match(routes, /"data-term-node":o/);
    assert.match(routes, /pointerEvents:`all`/);
    assert.match(routes, /id:`h2c-leaf-terminator`/);
    assert.match(routes, /placeholder:`What evidence is needed\?`/);
    assert.match(routes, /src===`term`&&requestAnimationFrame/);
    assert.doesNotMatch(routes, /onSelect:\(\)=>s\?\.\(e\.node\.id\)/);
  });

  it('Refresh uses refreshFromIntake so form PE fields are not overwritten', () => {
    assert.match(routes, /refreshFromIntake\(e,n\)/);
    assert.match(readFileSync(new URL('./chart-sync.js', import.meta.url), 'utf8'), /preferIntake/);
  });

  it('derives the footer build label from the same constant as the service-worker cache', () => {
    assert.match(build, /var H2C_APP_BUILD = 'v64'/);
    assert.match(build, /var H2C_SHELL_CACHE = 'apollo-rca-shell-' \+ H2C_APP_BUILD/);
    assert.match(sw, /importScripts\('\.\/app-build\.js'\)/);
    assert.match(sw, /const CACHE = self\.H2C_SHELL_CACHE/);
    assert.match(shell, /import '\.\/app-build\.js'/);
    assert.match(shell, /App build ' \+ \(globalThis\.H2C_APP_BUILD/);
    assert.doesNotMatch(shell, /App build v6[123]/);
  });

  it('Add cause set immediately creates nodes, selects the first new one, and scrolls it into view', () => {
    assert.match(routes, /ensureNodesForRows\(applyIntakeToChart\(n,next\),next\)/);
    assert.match(routes, /scrollIntoView\(\{block:`nearest`/);
    assert.match(routes, /collectNodes\(anal\)\.map\(e=>e\.node\.id\)\.find\(e=>!before\.has\(e\)\)/);
  });

  it('explains required placeholders and offers Replace with cause instead of a no-op remove', () => {
    assert.match(routes, /This is a required placeholder/);
    assert.match(routes, /children:`Replace with cause`/);
    assert.match(routes, /P\.placeholder\)return/);
    assert.match(routes, /replacePlaceholder=/);
  });

  it('keeps the selected node after a cause-type change', () => {
    assert.match(routes, /keep=P\.id,keepTitle=P\.title/);
    assert.match(routes, /reselectNode/);
    assert.match(routes, /queueMicrotask\(\(\)=>c\(keep\)\)/);
  });

  it('binds form fields to input and change events, not only keystrokes', () => {
    assert.match(routes, /\.\.\.valueEvents\(e=>r\(t\.id,\{what:e\.target\.value\}\)\)/);
    assert.match(routes, /valueEvents/);
  });
});

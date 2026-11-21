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
  reselectNode,
  valueEvents,
  isPlaceholderNode,
  isRequiredPlaceholder,
  removeCauseNode
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
    assert.match(build, /var H2C_APP_BUILD = 'v69'/);
    assert.match(build, /var H2C_SHELL_CACHE = 'apollo-rca-shell-' \+ H2C_APP_BUILD/);
    assert.match(sw, /importScripts\('\.\/app-build\.js'\)/);
    assert.match(sw, /const CACHE = self\.H2C_SHELL_CACHE/);
    assert.match(shell, /import '\.\/app-build\.js'/);
    assert.match(shell, /App build ' \+ \(globalThis\.H2C_APP_BUILD/);
    assert.doesNotMatch(shell, /App build v6[1-5]/);
  });

  it('Add cause set immediately creates nodes, selects the first new one, and scrolls it into view', () => {
    assert.match(routes, /ensureNodesForRows\(applyIntakeToChart\(n,next\),next\)/);
    assert.match(routes, /scrollIntoView\(\{block:`nearest`/);
    assert.match(routes, /collectNodes\(anal\)\.map\(e=>e\.node\.id\)\.find\(e=>!before\.has\(e\)\)/);
  });

  it('explains required placeholders and offers Replace with cause instead of a no-op remove', () => {
    assert.match(routes, /This is a required placeholder/);
    assert.match(routes, /children:`Replace with cause`/);
    assert.match(routes, /isPlaceholderNode\(P\)/);
    assert.match(routes, /isRequiredPlaceholder\(L\(P\.id\),P\)/);
    assert.match(routes, /removeCauseNode\(r\.root,P\.id\)/);
    assert.match(routes, /replacePlaceholder=/);
  });

  it('keeps the selected node after a cause-type change', () => {
    assert.match(routes, /keep=P\.id,keepTitle=P\.title/);
    assert.match(routes, /reselectNode/);
    assert.match(routes, /queueMicrotask\(\(\)=>c\(keep\)\)/);
  });

  it('binds typable Problem definition fields to EvField and keeps valueEvents on pickers', () => {
    assert.match(routes, /EvField,\{className:H,value:t\.what/);
    assert.match(routes, /EvField,\{className:H,value:t\.where/);
    assert.match(routes, /t\(e=>\(\{\.\.\.e,effects:e\.effects\.map/);
    assert.match(routes, /valueEvents\(e=>r\(t\.id,\{whenDate:e\.target\.value\}\)/);
    assert.match(readFileSync(new URL('./chart-sync.js', import.meta.url), 'utf8'), /el\.h2cValFn = fn/);
  });
});

describe('live v64 retest fixes', () => {
  it('valueEvents always calls the latest handler, not a stale first-render closure', () => {
    let latest = 0;
    const el = {
      addEventListener(type, fn) { this['on' + type] = fn; }
    };
    const first = valueEvents(() => { latest = 1; });
    first.ref(el);
    const second = valueEvents(() => { latest = 2; });
    second.ref(el);
    el.onchange({});
    assert.equal(latest, 2);
    second.onChange({});
    assert.equal(latest, 2);
    assert.equal(typeof el.oninput, 'undefined');
  });

  it('editing a Problem definition field on a loaded sample keeps all events, causes, and evidence', () => {
    const sample = getSampleCase();
    const intake = sample.intake;
    const peId = intake.effects[0].id;
    const stale = {
      effects: [{ id: peId, what: '', where: '', whenDate: '', whenTime: '', phase: 'Steady operation', safety: '', loss: '', frequency: '', frequencyNote: '', timeline: [], evidence: [] }],
      evidence: [],
      timeline: []
    };
    const typed = { where: 'W' };
    const wrong = { ...stale, effects: stale.effects.map((effect) => effect.id === peId ? { ...effect, ...typed } : effect) };
    assert.equal(wrong.effects.length, 1);
    assert.equal((wrong.evidence || []).length, 0);

    const right = patchPrimaryEffect(intake, peId, typed);
    assert.ok(right.effects.length >= 3);
    assert.equal(right.effects.length, intake.effects.length);
    assert.equal(allEvidenceRows(right).length, allEvidenceRows(intake).length);
    assert.equal(right.timeline.length, intake.timeline.length);
    assert.equal(right.effects[0].where, 'W');
    assert.equal(right.effects[0].what, intake.effects[0].what);
    assert.equal(right.effects[1].what, intake.effects[1].what);

    const anal = applyIntakeToChart(sample.analysis, right);
    const before = collectNodes(sample.analysis).map((n) => n.node.title);
    const after = collectNodes(anal).map((n) => n.node.title);
    assert.equal(after.length, before.length);
    assert.ok(after.includes('Oxygen Present'));
    assert.ok(after.includes('Hydraulic Hose Ruptured'));
    assert.ok(after.includes('Oil Present'));
    const terms = walkTerms(anal.trees[0].root);
    assert.ok(terms.some((t) => t.terminator.type === 'stop' && t.title === 'Oxygen Present'));
  });

  it('removing a placeholder does not duplicate causes or re-parent other branches', () => {
    const sample = getSampleCase();
    const intake = {
      ...sample.intake,
      evidence: [
        ...sample.intake.evidence,
        { id: 'ev-na1', text: '', source: '', tier: 'Inferred', cause: 'New Action 1', kind: 'action', layer: 2, explains: 'Oil Present', pe: 'pe-1' },
        { id: 'ev-se1', text: '', source: '', tier: 'Inferred', cause: 'State Exists 1', kind: 'condition', layer: 2, explains: 'Oil Present', pe: 'pe-1' }
      ]
    };
    const anal = ensureNodesForRows(applyIntakeToChart(sample.analysis, intake), intake);
    const nodes = () => collectNodes(anal);
    let oil = collectNodes(anal).find((n) => n.node.title === 'Oil Present');
    const se = collectNodes(anal).find((n) => n.node.title === 'State Exists 1');
    const na = collectNodes(anal).find((n) => n.node.title === 'New Action 1');
    assert.ok(oil && se && na);
    assert.equal(se.parent.title, 'Oil Present');
    assert.equal(na.parent.title, 'Oil Present');
    assert.equal(isPlaceholderNode(se.node), true);
    assert.equal(isPlaceholderNode(na.node), true);
    assert.equal(isRequiredPlaceholder(anal.trees[0].root, se.node), true);
    assert.equal(isRequiredPlaceholder(anal.trees[0].root, na.node), true);

    const hoseBefore = collectNodes(anal).find((n) => n.node.title === 'Hydraulic Hose Ruptured');
    const hoseParent = hoseBefore.parent.title;
    const hoseKids = (hoseBefore.node.children || []).map((c) => c.title).sort();
    const oilCount = collectNodes(anal).filter((n) => n.node.title === 'Oil Present').length;
    const oilTerm = oil.node.terminator ? oil.node.terminator.type : null;

    const blocked = removeCauseNode(anal.trees[0].root, se.node.id);
    assert.equal(blocked.removed, false);
    assert.equal(blocked.requiredPlaceholder, true);
    const afterBlocked = collectNodes({ trees: [{ root: blocked.root, id: 'pe-1' }] });
    assert.equal(afterBlocked.filter((n) => n.node.title === 'Oil Present').length, oilCount);
    assert.ok(afterBlocked.some((n) => n.node.title === 'State Exists 1'));
    const hoseAfter = afterBlocked.find((n) => n.node.title === 'Hydraulic Hose Ruptured');
    assert.equal(hoseAfter.parent.title, hoseParent);
    assert.deepEqual((hoseAfter.node.children || []).map((c) => c.title).sort(), hoseKids);
    const oilAfter = afterBlocked.find((n) => n.node.title === 'Oil Present');
    assert.equal(oilAfter.node.terminator ? oilAfter.node.terminator.type : null, oilTerm);
    assert.ok(!afterBlocked.some((n) => n.node.title === 'Oil Present' && n.node.terminator && n.node.terminator.type === 'goto'));

    // Removing a real extra sibling under another branch must not retitle or re-parent Oil Present / Hydraulic Hose.
    const truck = collectNodes(anal).find((n) => n.node.title === 'Truck Kept Moving After Alarm');
    anal.trees[0].root = structuredClone(anal.trees[0].root);
    const truckNode = collectNodes(anal).find((n) => n.node.title === 'Truck Kept Moving After Alarm');
    truckNode.node.children = [
      ...truckNode.node.children,
      { id: 'extra-cond', kind: 'condition', title: 'Spare Condition', verified: true, evidence: [], children: [], necessity: true, sufficiency: true }
    ];
    // Need to actually mutate the tree root's child
    const walkSet = (node) => {
      if (node.id === truckNode.node.id) {
        if (!node.children.some((c) => c.id === 'extra-cond')) {
          node.children = [...node.children, { id: 'extra-cond', kind: 'condition', title: 'Spare Condition', verified: true, evidence: [], children: [], necessity: true, sufficiency: true }];
        }
      }
      (node.children || []).forEach(walkSet);
    };
    walkSet(anal.trees[0].root);
    const removed = removeCauseNode(anal.trees[0].root, 'extra-cond');
    assert.equal(removed.removed, true);
    assert.equal(removed.selectedId, truckNode.node.id);
    const afterRm = collectNodes({ trees: [{ root: removed.root, id: 'pe-1' }] });
    assert.equal(afterRm.filter((n) => n.node.title === 'Oil Present').length, oilCount);
    const hoseFinal = afterRm.find((n) => n.node.title === 'Hydraulic Hose Ruptured');
    assert.equal(hoseFinal.parent.title, hoseParent);
    assert.deepEqual((hoseFinal.node.children || []).map((c) => c.title).sort(), hoseKids);
    const oilFinal = afterRm.find((n) => n.node.title === 'Oil Present');
    assert.equal(oilFinal.node.terminator ? oilFinal.node.terminator.type : null, oilTerm);
    assert.ok(afterRm.some((n) => n.node.title === 'State Exists 1'));
    assert.ok(!afterRm.some((n) => n.node.id === 'extra-cond'));
  });

  it('places STOP labels below evidence chips and fits the first view without a 0.85 min scale clip', () => {
    assert.match(routes, /function termHang\(e\)/);
    assert.match(routes, /termY=e\.y\+hang\.termY/);
    assert.match(routes, /hang\.kind===`stop`/);
    assert.match(routes, /minRead=e\.width<640\?\.5:\.82/);
    assert.match(routes, /\(e\.width-48\)/);
  });
});

describe('live v65 retest fixes', () => {
  it('gives the first sample view the full available width and a readable no-clip openView', () => {
    const styles = readFileSync(new URL('./styles-v13.css', import.meta.url), 'utf8');
    assert.match(routes, /h2c-chart-landing/);
    assert.match(routes, /h2c-chart-with-inspector/);
    assert.match(styles, /\.h2c-chart-landing/);
    assert.match(styles, /margin-left:calc\(50% - 50vw\)/);
    assert.match(styles, /min-width:100rem/);
    assert.match(routes, /minRead=e\.width<640\?\.5:\.82/);
    assert.match(routes, /if\(fit>=minRead\)return E\(\)/);
    assert.match(routes, /byW>=floor/);
    assert.doesNotMatch(routes, /minK=e\.width<640\?\.42:\.7/);
  });

  it('enlarges node hit areas so a first click at Fit scale still registers', () => {
    assert.match(routes, /"data-node-hit":a\.id/);
    assert.match(routes, /x:o-22,y:s-22,width:272,height:116/);
    assert.match(routes, /pointerEvents:`all`/);
  });

  it('keeps Need More Info attached to its parent mid-line, not dropped toward the next row', () => {
    assert.match(routes, /termHang\(e\)/);
    assert.match(routes, /e\.terminator\.type===`stop`\?\{dx,dy:r\+28/);
    assert.match(routes, /termY:36,kind:e\.terminator\.type/);
    assert.match(routes, /hang\.kind===`stop`&&termY>o\+8/);
  });

  it('debounces cause TitleField commits so the chart updates while typing without caret loss', () => {
    assert.match(routes, /function TitleField/);
    assert.match(routes, /setTimeout\(\(\)=>commit\(v,!1\),400\)/);
    assert.match(routes, /c\.current\|\|r\(e\)/);
    assert.match(routes, /EvField,\{className:Pe,value:t\.text/);
    assert.match(routes, /EvField,\{className:`mt-1 \$\{H\}`,value:t\.cause/);
    assert.match(routes, /setTimeout\(\(\)=>t\(e\),450\)/);
  });
});

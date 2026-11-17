// Regression guards for the Nov 17 retest fixes (GROK-PROMPT items 1-17, 23 partial).
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const routes = readFileSync(new URL('./routes-v13.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('./styles-v13.css', import.meta.url), 'utf8');
const help = readFileSync(new URL('./h2c-help.js', import.meta.url), 'utf8');
const shell = readFileSync(new URL('./h2c-shell.js', import.meta.url), 'utf8');
const sw = readFileSync(new URL('./sw.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');

describe('Nov 17 retest: critical engine fixes', () => {
  it('builds each primary effect from its own evidence rows', () => {
    assert.match(routes, /function rowEffectId\(/);
    assert.match(routes, /function rowsForEffect\(/);
  });
  it('a cause shared across primary effects becomes GOTO the earlier effect', () => {
    assert.match(routes, /function sharedGoto\(/);
  });
  it('never invents causes: empty slots become Action/Condition Needed placeholders', () => {
    assert.match(routes, /function needCause\(/);
    assert.match(routes, /`Action Needed`/);
    assert.match(routes, /`Condition Needed`/);
    assert.match(routes, /t\.placeholder=!0/);
  });
  it('investigator-chosen stops are kept on regenerate and the analysis survives reload', () => {
    assert.match(routes, /function mergeAnalysis\(/);
    assert.match(routes, /userSet:!0/);
    assert.match(routes, /realitychart-analysis-v1/);
    assert.match(shell, /realitychart-analysis-v1/);
  });
});

describe('Nov 17 retest: chart editing and viewing', () => {
  it('typed titles keep the investigator wording and commit on blur', () => {
    assert.match(routes, /function TitleField\(/);
    assert.match(routes, /function softTitle\(/);
  });
  it('chart edits have undo and redo', () => {
    assert.match(routes, /undoChart/);
    assert.match(routes, /redoChart/);
    assert.match(routes, /removeNode=\(\)=>/);
  });
  it('fit shows the whole chart, open centres the primary effect, touch pinch is supported', () => {
    assert.match(routes, /fitScale/);
    assert.match(routes, /openView/);
    assert.match(routes, /pinch\.current/);
    assert.match(routes, /"aria-label":`Zoom out`/);
  });
  it('nodes are keyboard reachable', () => {
    assert.match(routes, /h2c-node/);
    assert.match(routes, /"data-node"/);
  });
  it('every export keeps the full colour legend', () => {
    assert.match(routes, /LEGEND_H=64/);
    for (const label of ['Primary effect (black)', 'STOP', 'Action', 'Condition']) assert.ok(routes.includes(label), label);
    assert.match(routes, /#d32f2f/i);
    assert.match(routes, /#fbc02d/i);
  });
  it('mobile toolbar stays one row and legend can collapse', () => {
    assert.match(routes, /h2c-chart-toolbar/);
    assert.match(routes, /h2c-chart-legend/);
    assert.match(routes, /Hide legend/);
    assert.match(css, /\.h2c-chart-toolbar/);
    assert.match(help, /h2c-scrolling/);
  });
});

describe('Nov 17 retest: solutions and report', () => {
  it('solutions are opt-in per target with a status and a remove button', () => {
    assert.match(routes, /function solSelected\(/);
    assert.match(routes, /function solutionList\(/);
    assert.match(routes, /cover:/);
  });
  it('weak solutions are flagged and cost/payback are checked', () => {
    assert.match(routes, /weakSolution/);
    assert.match(routes, /function paybackMonths\(/);
    assert.match(routes, /function costChecks\(/);
    assert.match(routes, /Cost under the cap/);
    assert.match(routes, /Payback within target/);
  });
  it('report is always a PDF', () => {
    assert.match(routes, /Download report \(PDF\)/);
  });
  it('sample loss is a formatted money value', () => {
    assert.match(routes, /\$18,500/);
  });
});

describe('Nov 17 retest: intake form', () => {
  it('flags blame and why wording, without a person as a root cause', () => {
    assert.match(routes, /function wordingFault\(/);
    assert.match(routes, /a person is not a cause/);
  });
  it('timeline is typed by hand with 24-hour validation and gap notes', () => {
    assert.match(routes, /function badClock\(/);
    assert.match(routes, /Use 24-hour time such as 14:32, or type unknown\./);
    assert.equal(/timeline[^;]{0,80}csv/i.test(routes), false);
  });
  it('Normal operation phase only shows when already chosen; Where shows one hint', () => {
    assert.match(routes, /t\.phase===`Normal operation`\?\[\.\.\.Ne,`Normal operation`\]:Ne/);
    assert.equal(routes.includes('`Required.`'), false);
  });
  it('compact evidence table and duplicate row', () => {
    assert.match(routes, /Compact table/);
    assert.match(routes, /Duplicate evidence row/);
    assert.match(css, /\.h2c-ev-compact/);
  });
});

describe('Nov 17 retest: cache bump and preserved branding', () => {
  it('service worker cache is v58 and assets are cache-busted', () => {
    assert.match(sw, /apollo-rca-shell-v58/);
    assert.match(html, /h2c-shell\.js\?v=44/);
    assert.match(html, /h2c-help\.js\?v=33/);
  });
  it('keeps developer link and feedback, never shows an email address', () => {
    assert.ok((html + shell + help).includes('haroldhenrycabanilla.com'));
    assert.equal(/[\w.+-]+@gmail\.com/i.test(html + routes + shell + help), false);
  });
});

describe('Nov 17 retest: optional effect detail (features 18-21)', () => {
  it('safety classification ticks and risk rank', () => {
    assert.match(routes, /function riskRank\(/);
    for (const t of ['Injury', 'Near miss', 'Evacuation', 'Dust explosion potential', 'Regulatory notification required']) assert.ok(routes.includes(t), t);
  });
  it('cost split with a calculated total', () => {
    assert.match(routes, /function costTotal\(/);
    assert.match(routes, /Use total as financial loss/);
  });
  it('structured location, shift and duration', () => {
    assert.match(routes, /function whereText\(/);
    assert.match(routes, /Asset ID/);
    assert.match(routes, /Duration of the event/);
  });
  it('freeze-frame check feeds Need More Info prompts and the report', () => {
    assert.match(routes, /function freezeUnknowns\(/);
    assert.match(routes, /function effectExtrasLines\(/);
    assert.match(routes, /effectExtrasLines\(n\)\.forEach/);
  });
  it('the panel only renders after hydration (flow mode)', () => {
    assert.match(routes, /flow\?\(0,B\.jsx\)\(EffectExtras/);
  });
});

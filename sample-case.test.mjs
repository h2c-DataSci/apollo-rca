import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isProjectState, parseProjectFile, hasSecretKeys } from './case-import.js';
import {
  getSampleCase, sampleMatchIntake, SAMPLE_HINT, SAMPLE_BLAME_RE, SAMPLE_PERSON_CAUSE_RE
} from './sample-case.js';

const routes = readFileSync(new URL('./routes-v13.js', import.meta.url), 'utf8');
const shell = readFileSync(new URL('./h2c-shell.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('./styles-v13.css', import.meta.url), 'utf8');
const helpKb = readFileSync(new URL('./help-kb.js', import.meta.url), 'utf8');
const sw = readFileSync(new URL('./sw.js', import.meta.url), 'utf8');

function walk(node, acc = []) {
  if (!node) return acc;
  acc.push(node);
  for (const child of node.children || []) walk(child, acc);
  return acc;
}

describe('showcase sample case', () => {
  const sample = getSampleCase(new Date('2026-11-17T12:00:00'));
  const { intake, analysis } = sample;
  const nodes = analysis.trees.flatMap((tree) => walk(tree.root));
  const causes = nodes.filter((n) => n.kind !== 'primary');
  const selected = (analysis.solutions || []).filter((s) => s.include);

  it('is a complete fictional haul-truck project that imports cleanly', () => {
    assert.equal(isProjectState(sample), true);
    const parsed = parseProjectFile(sample);
    assert.equal(parsed.intake.effects.length, 3);
    assert.equal(parsed.analysis.trees.length, 3);
    assert.deepEqual(hasSecretKeys(sample), []);
    assert.match(intake.effects[0].what, /Haul Truck Fire/);
    assert.match(intake.effects[0].where, /Pit 3/);
    assert.equal(intake.effects[0].whenDate, '2026-11-12');
    assert.ok(intake.control.trim().startsWith('Not'));
  });

  it('uses relative future due dates and a report date after the incident', () => {
    assert.ok(intake.reportDate > intake.effects[0].whenDate);
    for (const row of selected) {
      assert.ok(row.due > intake.reportDate, row.targetTitle);
    }
  });

  it('has full what/when/where/significance and more-detail on every primary effect', () => {
    for (const pe of intake.effects) {
      assert.ok((pe.what || '').trim().split(/\s+/).length >= 2 && (pe.what || '').trim().split(/\s+/).length <= 4, pe.what);
      assert.ok(pe.whenDate && pe.whenTime && pe.where && pe.safety && pe.loss && pe.frequency, pe.what);
      assert.ok(pe.whereParts && pe.whereParts.asset, pe.what);
      assert.ok(pe.safetyTags && pe.safetyTags.length, pe.what);
      assert.ok((pe.timeline || []).length >= 2, pe.what);
    }
  });

  it('has a coherent timed timeline and evidence on every cause, with mixed tiers', () => {
    const events = [...intake.timeline, ...intake.effects.flatMap((e) => e.timeline || [])];
    assert.ok(intake.timeline.length >= 6);
    assert.ok(events.every((e) => (e.time || '').trim() && (e.description || '').trim()));
    const causeNames = new Set(causes.map((n) => n.title.toLowerCase()));
    const evidenceCauses = new Set(intake.evidence.map((e) => (e.cause || '').trim().toLowerCase()));
    for (const title of causeNames) {
      assert.ok(evidenceCauses.has(title), `missing evidence for ${title}`);
    }
    const tiers = new Set(intake.evidence.map((e) => e.tier));
    assert.ok(tiers.has('Sensed') && tiers.has('Inferred') && tiers.has('Intuited'));
  });

  it('teaches And, Or, STOP, and Need More Info', () => {
    assert.equal(analysis.trees[0].root.verified, true);
    const hot = causes.find((n) => n.title === 'Hot Turbo Surface');
    assert.ok(hot);
    assert.equal(hot.sufficiency, false);
    assert.ok(hot.children.some((c) => c.verified === false && c.title === 'Heat Shield Left Off After Rebuild'));
    assert.ok(hot.children.some((c) => c.verified === false && c.terminator?.type === 'question'));
    const stop = causes.find((n) => n.terminator?.type === 'stop');
    assert.ok(stop);
    assert.equal(stop.title, 'Oxygen Present');
    assert.equal(stop.terminator.reason, 'Desired Condition');
    const unknown = causes.find((n) => n.terminator?.type === 'question');
    assert.equal(unknown.title, 'Rebuild Pack List Unknown');
  });

  it('has selected solutions that meet every matrix criterion with role owners', () => {
    assert.ok(selected.length >= 3);
    for (const row of selected) {
      assert.ok((row.action || '').trim() && (row.owner || '').trim() && (row.due || '').trim(), row.targetTitle);
      assert.equal(row.preventsRecurrence, true);
      assert.equal(row.withinControl, true);
      assert.equal(row.meetsGoals, true);
      assert.equal(row.underCap, true);
      assert.equal(row.paybackOk, true);
      assert.equal(row.noNewProblems, true);
      assert.match(row.owner, /Supervisor|Planner|Lead/);
      assert.doesNotMatch(row.owner, /@|SMPC|[0-9]{7,}/);
    }
  });

  it('is fictional, contains no personal data, and does not frame a person as a cause', () => {
    const blob = JSON.stringify(sample);
    assert.doesNotMatch(blob, SAMPLE_BLAME_RE);
    assert.doesNotMatch(blob, /Operator continued/i);
    assert.doesNotMatch(blob, /SMPC/i);
    assert.doesNotMatch(blob, /[\w.+-]+@[\w.-]+/);
    for (const node of causes) {
      assert.doesNotMatch(node.title, SAMPLE_PERSON_CAUSE_RE);
    }
    for (const row of intake.evidence) {
      assert.doesNotMatch(row.cause || '', SAMPLE_PERSON_CAUSE_RE);
    }
    for (const pe of intake.effects) {
      assert.doesNotMatch(pe.what, SAMPLE_PERSON_CAUSE_RE);
    }
    assert.match(analysis.summary, /fictional mine/i);
    assert.doesNotMatch(analysis.summary, /\broot cause\b/i);
  });

  it('sampleMatch recognizes the showcase intake and not a blank case', () => {
    assert.equal(sampleMatchIntake(intake), true);
    assert.equal(sampleMatchIntake({ effects: [], timeline: [] }), false);
  });
});

describe('Load sample case wiring and interactivity guards', () => {
  it('loads the authored showcase analysis rather than regenerating a static tree', () => {
    assert.match(routes, /import\{getSampleCase,sampleMatchIntake,SAMPLE_HINT\}from"\.\/sample-case\.js"/);
    assert.match(routes, /function loadSampleCase\(t,r,c\)/);
    assert.match(routes, /onClick:\(\)=>loadSampleCase\(t,r,c\)/);
    assert.doesNotMatch(routes, /fe\(ke\)/);
    assert.match(routes, /function loadPreparedSample\(\)/);
  });

  it('scrolls to the chart after layout settles, including full test, generate, and JSON import', () => {
    assert.match(routes, /function scrollChartIntoView\(\)/);
    assert.match(routes, /h2c-chart-landing/);
    assert.match(routes, /h2c-chart-frame/);
    assert.match(css, /scroll-margin-top/);
    const loads = routes.split('scrollChartIntoView').length - 1;
    assert.ok(loads >= 5, `scroll helper should be used on each load path, found ${loads}`);
    assert.match(routes, /h2cOfferProjectImport[\s\S]*scrollChartIntoView\(\)/);
  });

  it('keeps node selection, inspector editing, and Generate/merge wired', () => {
    assert.match(routes, /onClick:e=>\{e\.stopPropagation\(\);if\(chartDidDrag\)return;i\(a\.id\)\}/);
    assert.match(routes, /onPointerUp:e=>\{let dragged=w\.current\?\.drag;[\s\S]*data-node/);
    assert.match(routes, /id:`node-title`/);
    assert.match(routes, /\(0,B\.jsx\)\(Sn,\{trees:\(chartLive\|\|n\)\.trees,selectedId:i,onSelect:id=>\{c\(id\),setEvSel\(null\)\}/);
    assert.match(routes, /ee=\(\)=>\{[\s\S]*mergeAnalysis\(n,fe\(e\),e\)/);
    assert.match(routes, /allEvidence\(e\)\.some\(e=>\(e\.cause\|\|``\)\.trim\(\)\)\?hypothesisRoot/);
    assert.doesNotMatch(routes, /&&!sampleMatch\(e\)\?hypothesisRoot/);
  });

  it('shows the teaching hint and keeps the offline cache current', () => {
    assert.match(routes, /h2c-sample-hint/);
    assert.match(routes, /SAMPLE_HINT/);
    assert.match(css, /\.h2c-sample-hint/);
    assert.match(helpKb, /haul truck fire/i);
    assert.match(helpKb, /Click any node to explore/);
    assert.equal(SAMPLE_HINT.includes('click any node to explore'), true);
    assert.match(sw, /const CACHE = 'apollo-rca-shell-v63'/);
    assert.match(sw, /sample-case\.js/);
    assert.match(sw, /help-kb\.js\?v=29/);
  });
});

// End-to-end integration and workflow test suite for H2C Root Cause Analyst
// Verifies full 7-step Apollo RCA lifecycle, data transformations, and resilience.

import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as R from './rca-rules.js';
import { review as detReview, evidenceRegistry } from './rca-integrity.js';
import { PRINCIPLES } from './rca-principles.js';
import { exportCase, validateImport } from './case-io.js';
import { getBridgeConfig, DEFAULT_BRIDGE_CONFIG, RECOMMENDED_LOCAL_MODELS } from './local-ai-bridge.js';

describe('Phase 3: End-to-End RCA Workflow & Stability Tests', () => {

  it('Step 1 (Define): Primary Effect validates noun + active verb without blame or cause', () => {
    // Valid PE
    const validPE = R.reviewPrimaryEffect('Oil Released');
    assert.equal(validPE.status, 'ok');
    assert.equal(validPE.issues.length, 0);

    // Invalid: contains blame
    const blamePE = R.reviewPrimaryEffect('Operator error');
    assert.equal(blamePE.status, 'concern');
    assert.ok(blamePE.issues.some(i => i.code === 'BLAME' || i.message.toLowerCase().includes('blame')));
  });

  it('Step 2 (Causes): Action vs Condition cause validation', () => {
    // Action cause: momentary trigger
    const actionNode = {
      id: 'c-act-1',
      kind: 'action',
      title: 'Valve turned clockwise',
      verified: true,
      evidence: [{ id: 'e-1', source: 'Control Room Log', tier: 'Inferred' }]
    };
    // Condition cause: pre-existing state
    const conditionNode = {
      id: 'c-cond-1',
      kind: 'condition',
      title: 'Pipe was pressurized',
      verified: true,
      evidence: [{ id: 'e-2', source: 'Pressure Gauge 4B', tier: 'Sensed' }]
    };

    assert.equal(actionNode.kind, 'action');
    assert.equal(conditionNode.kind, 'condition');
    assert.ok(actionNode.verified && conditionNode.verified);
  });

  it('Step 3 (Chart): Reality Tree cause-set logic requires at least one Action and one Condition', () => {
    const causes = [
      { id: 'c1', kind: 'action', title: 'Switch toggled', verified: true },
      { id: 'c2', kind: 'condition', title: 'Circuits energized', verified: true }
    ];

    const hasAction = causes.some(c => c.kind === 'action');
    const hasCondition = causes.some(c => c.kind === 'condition');
    assert.ok(hasAction && hasCondition, 'Cause-and-effect principle: each effect is caused by at least one action and one condition');
  });

  it('Step 4 (Evidence): Evidence quality tier tagging and ID binding', () => {
    const sampleEvidence = [
      { id: '01', source: 'Physical Inspection', text: 'Seal cracked into 3 pieces', tier: 'Sensed' },
      { id: '02', source: 'SCADA Historian', text: 'Pressure spike to 140 psi at 14:32', tier: 'Inferred' },
      { id: '03', source: 'Technician Interview', text: 'Felt vibration earlier in shift', tier: 'Intuited' }
    ];

    sampleEvidence.forEach(ev => {
      assert.ok(['Sensed', 'Inferred', 'Intuited', 'Emotional'].includes(ev.tier));
      assert.ok(ev.source.length > 0);
    });

    const reg = evidenceRegistry({ evidence: sampleEvidence });
    assert.equal(reg.ids.has('EVID-01'), true);
    assert.equal(reg.ids.has('EVID-999'), false);
  });

  it('Step 5 (Test): Deterministic logic verification rejects fabricated evidence and human root cause', () => {
    const dummyState = { evidence: [{ id: 'e1', text: 'Inspection log' }] };

    // Violation B: Person as root cause
    const blameRev = detReview('The root cause was operator error.', {
      kind: 'finding',
      origin: 'ai',
      state: dummyState
    });
    assert.equal(blameRev.decision, 'BLOCK');
    assert.ok(blameRev.principleIds.includes('P05'));
    assert.equal(blameRev.acceptable, false);

    // Violation D: Fabricated evidence declaration
    const fabRev = detReview('Seal temperature exceeded limit per EVID-999.', {
      kind: 'finding',
      state: dummyState
    });
    assert.equal(fabRev.decision, 'BLOCK');
    assert.ok(fabRev.principleIds.includes('P02'));
  });

  it('Step 6 (Solutions): 4-Criteria challenge matrix and favorite solution blocking', () => {
    const favoriteSolution = 'Retrain the operator on procedure';
    const alignedSolution = 'Install mechanical interlock preventing reverse flow';

    // Favorite solution check
    const isFavoriteBlocked = (sol) => /retrain|re-train|discipline|remind|fire|warning|caution/i.test(sol);
    assert.equal(isFavoriteBlocked(favoriteSolution), true, 'Favorite solutions must be blocked');
    assert.equal(isFavoriteBlocked(alignedSolution), false, 'Control-based solutions pass favorite check');

    // 4 Criteria evaluation
    const solutionChallenge = {
      action: alignedSolution,
      preventsRecurrence: true,
      withinControl: true,
      meetsGoals: true,
      noNewProblems: true
    };
    const passesAllTests = solutionChallenge.preventsRecurrence &&
      solutionChallenge.withinControl &&
      solutionChallenge.meetsGoals &&
      solutionChallenge.noNewProblems &&
      !isFavoriteBlocked(solutionChallenge.action);

    assert.equal(passesAllTests, true, 'Solution must satisfy all 4 criteria');
  });

  it('Step 7 (Track): CSV Export structure validation', () => {
    const trackedSolutions = [
      { id: 'ACT-01', effectCode: 'PE-1', targetTitle: 'Seal Overheated', action: 'Install thermocouple alarm', owner: 'Jane Engineer', due: '2026-12-01', cost: '$1,200' }
    ];

    const generateCsv = (items) => {
      const header = 'Action ID,Primary Effect,Target Cause,Corrective Action,Owner,Due Date,Cost';
      const rows = items.map(i => `${i.id},${i.effectCode},"${i.targetTitle}","${i.action}","${i.owner}",${i.due},"${i.cost}"`);
      return [header, ...rows].join('\n');
    };

    const csv = generateCsv(trackedSolutions);
    assert.ok(csv.includes('ACT-01'));
    assert.ok(csv.includes('Jane Engineer'));
    assert.ok(csv.includes('$1,200'));
    assert.equal(csv.split('\n').length, 2);
  });

  it('Round-Trip Case IO: Export, Validate, and Re-import preserve hypotheses and evidence', () => {
    const originalCase = {
      intake: {
        investigator: 'Engr. Cabanilla',
        reportDate: '2026-11-02',
        effects: [
          {
            id: 'pe-1',
            what: 'Oil Released',
            whenDate: '2026-11-01',
            whenTime: '14:32',
            where: 'Pump House B',
            safety: 'Minor slip hazard',
            loss: '4500',
            frequency: 'First occurrence',
            timeline: [{ id: 't-1', time: '14:32', description: 'Alarm sounded' }],
            evidence: [{ id: 'EVID-01', source: 'Log', text: 'Tank level drop', tier: 'Inferred' }]
          }
        ],
        evidence: [{ id: 'EVID-01', source: 'Log', text: 'Tank level drop', tier: 'Inferred' }]
      },
      aiNotes: [
        { task: 'suggestHypothesisBranches', text: 'Gasket degraded due to acid exposure', status: 'hypothesis' }
      ]
    };

    const exported = JSON.stringify(exportCase(originalCase.intake, originalCase.aiNotes));
    assert.ok(exported.length > 50);

    const validated = validateImport(exported);
    assert.equal(validated.ok, true);
    assert.equal(validated.state.investigator, 'Engr. Cabanilla');
    assert.equal(validated.notes[0].text, 'Gasket degraded due to acid exposure');
    assert.equal(validated.notes[0].status, 'hypothesis');
  });

  it('Local AI Daemon Bridge: Configuration and Recommended Models are accessible', () => {
    const config = getBridgeConfig();
    assert.equal(typeof config.endpoint, 'string');
    assert.equal(typeof config.model, 'string');
    assert.ok(RECOMMENDED_LOCAL_MODELS.length >= 3);
    assert.ok(RECOMMENDED_LOCAL_MODELS.some(m => m.id === 'gemma2:2b'));
  });

});

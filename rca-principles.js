// Single source of truth for methodology + versions (drift control). Prompts are generated from this registry.
export const VERSIONS = { principleSet: 'analysis-principles-v1.0', coachSystem: 'coach-system-v1.2', integrityReviewer: 'integrity-reviewer-v1.0', schemas: 'schemas-v1.1', app: '1.1.0' };
export const PRINCIPLES = [
  { id: 'P01', name: 'Evidence before conclusion', severity: 'hard', deterministicCheck: true, tasks: ['reviewCauseStatement', 'draftInvestigationNarrative', 'summarizeInvestigation'] },
  { id: 'P02', name: 'No invented evidence', severity: 'hard', deterministicCheck: true, tasks: ['*'] },
  { id: 'P03', name: 'Separate observation from inference', severity: 'warning', deterministicCheck: true, tasks: ['reviewCauseStatement'] },
  { id: 'P04', name: 'Hypotheses remain hypotheses', severity: 'hard', deterministicCheck: true, tasks: ['suggestHypothesisBranches', 'summarizeInvestigation', 'draftInvestigationNarrative'] },
  { id: 'P05', name: 'No person as root cause', severity: 'hard', deterministicCheck: true, tasks: ['*'] },
  { id: 'P06', name: 'No unsupported blame', severity: 'hard', deterministicCheck: true, tasks: ['*'] },
  { id: 'P07', name: 'Preserve uncertainty', severity: 'hard', deterministicCheck: true, tasks: ['rewritePrimaryEffect', 'summarizeInvestigation', 'draftInvestigationNarrative'] },
  { id: 'P08', name: 'Temporal sequence does not establish causation', severity: 'warning', deterministicCheck: true, tasks: ['reviewCauseStatement'] },
  { id: 'P09', name: 'Contradictions must be surfaced', severity: 'warning', deterministicCheck: true, tasks: ['summarizeInvestigation', 'draftInvestigationNarrative', 'detectContradictions'] },
  { id: 'P10', name: 'Corrective action must address cause', severity: 'warning', deterministicCheck: true, tasks: ['reviewCorrectiveActionAlignment'] },
  { id: 'P11', name: 'Do not confuse consequence with cause', severity: 'warning', deterministicCheck: true, tasks: ['reviewCauseStatement'] },
  { id: 'P12', name: 'Do not confuse missing control with proven cause', severity: 'warning', deterministicCheck: true, tasks: ['reviewCauseStatement'] },
  { id: 'P13', name: 'Source fidelity', severity: 'hard', deterministicCheck: true, tasks: ['rewritePrimaryEffect', 'summarizeInvestigation', 'draftInvestigationNarrative'] },
  { id: 'P14', name: 'Investigator authority', severity: 'hard', deterministicCheck: false, tasks: ['*'] },
  { id: 'P15', name: 'No autonomous final root-cause declaration', severity: 'hard', deterministicCheck: true, tasks: ['*'] },
];
export const principleById = (id) => PRINCIPLES.find((p) => p.id === id);
export function principlesPrompt() {
  return PRINCIPLES.map((p) => `${p.id} ${p.name} (${p.severity})`).join('; ');
}

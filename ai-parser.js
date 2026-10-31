// Structured-output parsing and validation. Model output is untrusted.
import { LIMITS } from './ai-config.js';
const clean = (v, max = 400) => String(v ?? '').replace(/<[^>]*>/g, '').replace(/[\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const list = (v, n, f) => (Array.isArray(v) ? v.slice(0, n).map(f).filter((x) => x !== '' && x != null) : []);
const oneOf = (v, set, d) => (set.includes(String(v).toLowerCase()) ? String(v).toLowerCase() : d);
export class AIParseError extends Error {}
export function extractJSON(text) {
  const s = String(text ?? ''); const a = s.indexOf('{'); const b = s.lastIndexOf('}');
  if (a < 0 || b <= a) throw new AIParseError('No JSON object in model output');
  try { return JSON.parse(s.slice(a, b + 1)); } catch { throw new AIParseError('Model output was not valid JSON'); }
}
const strs = (v, n, m = 300) => list(v, n, (x) => clean(x, m));
export const VALIDATORS = {
  reviewPrimaryEffect: (o) => ({ quality: oneOf(o.quality, ['good', 'needs-work', 'poor'], 'needs-work'), issues: strs(o.issues, LIMITS.issues), explanation: clean(o.explanation, 500), rewrites: strs(o.rewrites, LIMITS.rewrites, 120), questions: strs(o.questions, LIMITS.questions) }),
  rewritePrimaryEffect: (o) => { const r = strs(o.rewrites, LIMITS.rewrites, 120); if (!r.length) throw new AIParseError('No rewrites returned'); return { rewrites: r, rationale: clean(o.rationale, 400) }; },
  extractTimelineCandidates: (o) => { const e = list(o.events, LIMITS.events, (x) => (x && clean(x.event) ? { dateTimeText: clean(x.dateTimeText, 60), event: clean(x.event, 250), sourceText: clean(x.sourceText, 300), certainty: oneOf(x.certainty, ['explicit', 'inferred', 'unknown'], 'unknown'), needsValidation: true } : '')); if (!e.length) throw new AIParseError('No events returned'); return { events: e }; },
  reviewCauseStatement: (o) => ({ observable: !!o.observable, assumptionRisk: oneOf(o.assumptionRisk, ['low', 'medium', 'high'], 'medium'), blameRisk: oneOf(o.blameRisk, ['none', 'concern'], 'none'), ambiguity: clean(o.ambiguity, 300), evidenceSupport: oneOf(o.evidenceSupport, ['supported', 'partially-supported', 'unsupported', 'not-enough-information'], 'not-enough-information'), causalLinkConcern: clean(o.causalLinkConcern, 300), suggestedRevision: clean(o.suggestedRevision, 300), questions: strs(o.questions, LIMITS.questions) }),
  identifyEvidenceGaps: (o) => ({ supporting: strs(o.supporting, 6), gaps: strs(o.gaps, 6), contradictions: strs(o.contradictions, 6), evidenceToSeek: strs(o.evidenceToSeek, 6) }),
  generateClarifyingQuestions: (o) => { const q = strs(o.questions, LIMITS.questions); if (!q.length) throw new AIParseError('No questions returned'); return { questions: q }; },
  suggestHypothesisBranches: (o) => { const h = list(o.hypotheses, LIMITS.hypotheses, (x) => (x && clean(x.statement) ? { statement: clean(x.statement, 250), relevance: clean(x.relevance, 300), evidenceRequired: clean(x.evidenceRequired, 300), disconfirmedBy: clean(x.disconfirmedBy, 300) } : '')); if (!h.length) throw new AIParseError('No hypotheses returned'); return { hypotheses: h }; },
  reviewCorrectiveActionAlignment: (o) => ({ rating: oneOf(o.rating, ['strong', 'partial', 'weak', 'indeterminate'], 'indeterminate'), rationale: clean(o.rationale, 500), addresses: oneOf(o.addresses, ['cause', 'consequence', 'unclear'], 'unclear'), residualQuestion: clean(o.residualQuestion, 300) }),
  summarizeInvestigation: (o) => ({ establishedFacts: strs(o.establishedFacts, 8), causalAnalysis: strs(o.causalAnalysis, 8), unresolved: strs(o.unresolved, 8), correctiveActions: strs(o.correctiveActions, 8) }),
  draftInvestigationNarrative: (o) => { const n = clean(o.narrative, LIMITS.outputChars * 2); if (!n) throw new AIParseError('Empty narrative'); return { narrative: n }; },
};
export function parseTaskOutput(task, raw) {
  const v = VALIDATORS[task]; if (!v) throw new AIParseError('Unknown task ' + task);
  return v(extractJSON(raw));
}

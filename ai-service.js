// Layer B adapter: task prompts, schema-checked results, status machine. Transport is injectable (mocked in tests).
import { MODEL_CONFIG, LIMITS } from './ai-config.js';
import { parseTaskOutput, AIParseError } from './ai-parser.js';
export const SYSTEM = `You are an RCA Coach for Apollo-style root cause analysis, not an investigator.
Distinguish observation from inference and evidence from hypothesis. Use only the supplied investigation context. If evidence is absent, state that evidence is absent. Do not fill missing facts with plausible details. Do not invent dates, measurements, witnesses, documents, alarms, logs or events. Never identify a person as the root cause and never infer misconduct, intent or negligence. Be concise. Reply with ONE JSON object only, matching the requested schema, no prose.`;
const cut = (s) => String(s ?? '').slice(0, LIMITS.inputChars);
const J = (o) => JSON.stringify(o);
export const PROMPTS = {
  reviewPrimaryEffect: (i) => `Task: review this primary effect (should be 2-4 words, noun+verb, no who, no why).\nPrimary effect: "${cut(i.text)}"\nProblem context: "${cut(i.context)}"\nSchema: ${J({ quality: 'good|needs-work|poor', issues: ['..'], explanation: '..', rewrites: ['..'], questions: ['..'] })}`,
  rewritePrimaryEffect: (i) => `Task: rewrite conservatively (max 3 alternatives, preserve meaning, remove blame and implied cause, add no new facts).\nPrimary effect: "${cut(i.text)}"\nSchema: ${J({ rewrites: ['..'], rationale: '..' })}`,
  extractTimelineCandidates: (i) => `Task: extract candidate timeline events from the notes. Never fabricate a missing time; use "" if absent.\nNotes: """${cut(i.text)}"""\nSchema: ${J({ events: [{ dateTimeText: '', event: '', sourceText: '', certainty: 'explicit|inferred|unknown', needsValidation: true }] })}`,
  reviewCauseStatement: (i) => `Task: review the cause statement. Rate evidence support only from the supplied evidence; never claim "supported" without support in it.\nCause: "${cut(i.text)}"\nEvidence: ${J(i.evidence || [])}\nSchema: ${J({ observable: true, assumptionRisk: 'low|medium|high', blameRisk: 'none|concern', ambiguity: '', evidenceSupport: 'supported|partially-supported|unsupported|not-enough-information', causalLinkConcern: '', suggestedRevision: '', questions: [''] })}`,
  identifyEvidenceGaps: (i) => `Task: compare the cause with the supplied evidence. "evidenceToSeek" lists categories of evidence to look for, not claims they exist.\nCause: "${cut(i.text)}"\nEvidence: ${J(i.evidence || [])}\nSchema: ${J({ supporting: [''], gaps: [''], contradictions: [''], evidenceToSeek: [''] })}`,
  generateClarifyingQuestions: (i) => `Task: write up to 5 specific, neutral, non-accusatory, evidence-seeking questions. Do not answer them.\nContext: """${cut(i.text)}"""\nSchema: ${J({ questions: ['..'] })}`,
  suggestHypothesisBranches: (i) => `Task: suggest up to 4 possible causal branches. Each is a HYPOTHESIS, not validated.\nEffect/cause: "${cut(i.text)}"\nKnown evidence: ${J(i.evidence || [])}\nSchema: ${J({ hypotheses: [{ statement: '', relevance: '', evidenceRequired: '', disconfirmedBy: '' }] })}`,
  reviewCorrectiveActionAlignment: (i) => `Task: assess whether the corrective action addresses the cause. Do not estimate effectiveness without data.\nCause: "${cut(i.cause)}"\nAction: "${cut(i.action)}"\nSchema: ${J({ rating: 'strong|partial|weak|indeterminate', rationale: '', addresses: 'cause|consequence|unclear', residualQuestion: '' })}`,
  summarizeInvestigation: (i) => `Task: summarize ONLY the approved data below. Keep established facts, accepted causal analysis, unresolved questions and corrective actions separate. Do not merge hypotheses into facts.\nData: """${cut(i.text)}"""\nSchema: ${J({ establishedFacts: [''], causalAnalysis: [''], unresolved: [''], correctiveActions: [''] })}`,
  draftInvestigationNarrative: (i) => `Task: draft a professional narrative ONLY from the data below, in this order: context, primary effect, timeline, evidence, causal analysis, accepted causes, corrective actions, unresolved items/limitations. State where data is absent.\nData: """${cut(i.text)}"""\nSchema: ${J({ narrative: '..' })}`,
};
export const TASK_NAMES = Object.keys(PROMPTS);
export class AIService {
  constructor(transport) { this.t = transport; this.status = 'disabled'; this.progress = 0; this.listeners = new Set(); this.error = ''; this.backend = ''; }
  on(f) { this.listeners.add(f); return () => this.listeners.delete(f); }
  set(status, extra = {}) { this.status = status; Object.assign(this, extra); this.listeners.forEach((f) => f(this)); }
  async enable() {
    if (this.status === 'ready' || this.status === 'generating') return;
    const cap = await this.t.capability();
    if (!cap.supported) { this.set('unsupported', { error: cap.reason || 'Not supported' }); return; }
    this.set('loading', { progress: 0, error: '', backend: cap.backend });
    try { await this.t.load((p) => this.set('loading', { progress: p })); this.set('ready', { progress: 100 }); }
    catch (e) { this.set('error', { error: String(e && e.message || e) }); }
  }
  async run(task, input) {
    if (this.status !== 'ready') throw new Error('AI is not ready');
    if (!PROMPTS[task]) throw new Error('Unknown task');
    this.set('generating');
    try {
      const raw = await this.t.generate([{ role: 'system', content: SYSTEM }, { role: 'user', content: PROMPTS[task](input) }]);
      const value = parseTaskOutput(task, raw); this.set('ready'); return { task, value, ai: true };
    } catch (e) { this.set(this.status === 'generating' ? 'ready' : this.status, { error: e instanceof AIParseError ? 'AI returned output that could not be used. Nothing was changed. You can retry.' : String(e.message || e) }); throw e; }
  }
  cancel() { this.t.cancel && this.t.cancel(); }
  async disable() { try { await this.t.unload(); } catch {} this.set('disabled', { progress: 0, error: '' }); }
}

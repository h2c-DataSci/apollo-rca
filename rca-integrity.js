// Layer A+: deterministic methodology enforcement. Pure functions, no model, no DOM.
import { VERSIONS, principleById } from './rca-principles.js';
import { norm, tokens, supportLevel, alignAction } from './rca-rules.js';

const has = (t, re) => re.test(norm(t).toLowerCase());
export const RE = {
  hedge: /\b(possible|possibly|probable|probably|likely|might|may have|may be|could|suspected|suspect|appears?|appeared|seems?|unclear|unconfirmed|potential(?:ly)?|perhaps)\b/i,
  causal: /\b(caused|causes|causing|because|due to|resulted in|resulting from|led to|leads to|root cause (?:was|is)|was the cause|owing to|as a result of|responsible for)\b/i,
  rootDecl: /\b(the\s+)?(root|final|true|actual)\s+cause\s+(was|is|=|:)|\bwe conclude\b|\bconclusively\b|\bproven cause\b/i,
  person: /\b(operator|operators|technician|worker|supervisor|employee|crew|contractor|engineer|manager|he|she|mr\.?\s+\w+|ms\.?\s+\w+|[A-Z][a-z]+ [A-Z][a-z]+)\b.{0,40}\b(error|fault|negligen\w*|careless\w*|mistake|blame\w*|failed to|failure to|did not follow|violat\w+|guilty|responsible)\b|\bhuman error\b|\boperator error\b|\bpilot error\b|\b(guilty|negligent|careless|reckless|incompetent|lazy)\b/i,
  blame: /\b(failed to follow|failed to|negligen\w*|careless\w*|reckless\w*|misconduct|guilty|blame\w*|at fault|fault of|should have|violat\w+|irresponsible|incompetent|lazy)\b/i,
  consequence: /^(the\s+)?(injury|damage|downtime|cost|loss|spill|release|fire|explosion|fatality|shutdown)\b/i,
  missingControl: /\b(lack of|absence of|no|missing|without|did not have|not having)\b.{0,40}\b(control|barrier|procedure|alarm|interlock|training|guard|protection|check|inspection|monitoring)\b/i,
  temporalOnly: /\b(after|before|later|minutes? later|then|followed|preceded|shortly|prior to)\b/i,
  mechanism: /\b(because|due to|caused by|confirmed|inspection|analysis|test(?:ed)?|measured|metallurg\w+|calibrat\w+|root cause analysis|failure analysis|found that)\b/i,
  abstain: /\b(insufficient (evidence|information)|cannot (be )?determine\w*|not enough (evidence|information)|requires investigator validation|unable to determine)\b/i,
  evid: /\bEVID-[A-Za-z0-9_-]+/g,
};
export const evidenceRegistry = (state) => {
  const list = (state && Array.isArray(state.evidence) ? state.evidence : []).filter((e) => e && e.id != null);
  const ids = new Set(); const dup = [];
  for (const e of list) { const id = 'EVID-' + String(e.id); if (ids.has(id)) dup.push(id); ids.add(id); }
  return { ids, duplicates: dup, items: list.map((e) => ({ id: 'EVID-' + String(e.id), text: norm(e.text), source: norm(e.source), tier: e.tier })) };
};
export function validateEvidenceRefs(text, declaredIds, registry) {
  const refs = new Set([...(String(text).match(RE.evid) || []), ...(declaredIds || []).map(String)]);
  const bad = [...refs].filter((r) => !/^EVID-[A-Za-z0-9_-]+$/.test(r) || !registry.ids.has(r));
  return { refs: [...refs], invalid: bad };
}
const nums = (s) => (String(s).match(/\b\d{1,2}[:.]\d{2}\b|\b\d{4}-\d{2}-\d{2}\b|\b\d+(?:\.\d+)?\s?(?:%|psi|bar|kpa|mm|°c|c\b|kg|min|minutes|hours|hrs)\b|\b\d{3,}\b/gi) || []).map((x) => x.toLowerCase().replace(/\s+/g, ''));
export function findContradictions(candidate, timeline) {
  const out = []; const c = norm(candidate);
  for (const ev of timeline || []) {
    if (!ev || !ev.time || !ev.description) continue;
    const et = tokens(ev.description); const ct = new Set(tokens(c)); const shared = et.filter((w) => ct.has(w));
    if (shared.length < Math.max(1, Math.min(2, et.length))) continue;
    const times = nums(c).filter((x) => /:|\./.test(x)); const t0 = ev.time.replace('.', ':');
    if (times.length && !times.includes(t0.toLowerCase())) out.push({ event: ev.description, validated: ev.time, claimed: times[0] });
    else if (/\bafter\s+(the\s+)?(shutdown|trip|leak|release)/i.test(c) && !times.length) out.push({ event: ev.description, validated: ev.time, claimed: 'ordering claim' });
  }
  return out;
}
const F = (principle, level, message, extra = {}) => ({ principle, level, hard: principleById(principle)?.severity === 'hard', message, ...extra });
/** kind: note | cause | finding | summary | narrative | evidence | rewrite | hypothesis ; origin: user | ai */
export function review(text, ctx = {}) {
  const t = norm(text); const kind = ctx.kind || 'finding'; const origin = ctx.origin || 'ai'; const f = [];
  const reg = ctx.registry || evidenceRegistry(ctx.state || {}); const evidence = ctx.evidence || reg.items.map((e) => e.text);
  if (!t) return done([], ctx);
  if (RE.abstain.test(t)) return done([], ctx, true);
  const strict = origin === 'ai' || kind === 'finding' || kind === 'cause';
  if (kind === 'note') return done(RE.person.test(t) ? [F('P05', 'warn', 'Raw note names a person/role with fault wording. Notes are unrestricted, but this cannot become a finding as written.')] : [], ctx);
  const lvl = strict ? 'block' : 'warn';
  const rd = RE.rootDecl.test(t);
  if (rd && origin === 'ai') f.push(F('P15', 'block', 'AI output declares a root cause. Only the investigator may do that.'));
  if (RE.person.test(t)) { const rootish = /root cause|cause (was|is)|caused/i.test(t); f.push(F('P05', rootish ? 'block' : lvl, 'Person or role treated as the cause. Describe the action or condition instead.')); }
  if (RE.blame.test(t)) f.push(F('P06', lvl, 'Blame or culpability wording without validated evidence and governance process.', { suggestion: 'Rewrite neutrally as an observable action or condition and ask for evidence.' }));
  const v = validateEvidenceRefs(t, ctx.evidenceIds, reg);
  if (v.invalid.length) f.push(F('P02', 'block', `Unknown or malformed evidence reference: ${v.invalid.join(', ')}.`, { invalid: v.invalid }));
  if (reg.duplicates.length) f.push(F('P02', 'warn', `Duplicate evidence IDs in case: ${reg.duplicates.join(', ')}.`));
  const causal = RE.causal.test(t);
  const hedgedSrc = ctx.sourceText && RE.hedge.test(ctx.sourceText);
  if (causal && ['cause', 'finding', 'summary', 'narrative', 'hypothesis'].includes(kind) && kind !== 'hypothesis') {
    const lvlSup = evidence.length ? supportLevel(t, evidence) : 'not-enough-information';
    if (lvlSup === 'unsupported' || lvlSup === 'not-enough-information' || (kind === 'cause' || kind === 'finding') && lvlSup === 'partially-supported' && !v.refs.length) f.push(F('P01', kind === 'cause' || kind === 'finding' ? 'block' : 'warn', `Causal statement is not backed by supplied evidence (${lvlSup}). Treat it as a hypothesis and seek evidence.`, { asHypothesis: true }));
    if (evidence.length && ctx.evidence !== false) { const rel = evidence.filter((e) => tokens(e).some((w) => tokens(t).includes(w))); if (rel.length && !rel.some((e) => RE.mechanism.test(e)) && rel.some((e) => RE.temporalOnly.test(e))) f.push(F('P08', 'warn', 'Evidence only shows order in time. Sequence alone does not establish causation; seek mechanism evidence.')); }
  }
  if (ctx.sourceText) {
    const st = tokens(ctx.sourceText); const ct = tokens(t); const overlap = ct.filter((w) => st.includes(w)).length;
    if (hedgedSrc && !RE.hedge.test(t) && overlap >= 1) f.push(F('P07', 'block', 'Source was uncertain; the output states it as fact. Preserve the uncertainty.'));
    if (hedgedSrc && causal && !RE.hedge.test(t)) f.push(F('P04', 'block', 'A hypothesis was promoted to a causal finding.'));
    const ns = nums(t).filter((x) => !nums(ctx.sourceText).includes(x) && !nums((ctx.context || '')).includes(x));
    if (ns.length) f.push(F('P13', 'block', `Adds figures not in the source: ${ns.join(', ')}.`)); // also P02
  }
  if (kind === 'hypothesis' && !/hypothesis|possible|may|might|could/i.test(t)) f.push(F('P04', 'warn', 'Hypotheses must be labelled and worded as possibilities.'));
  if (RE.consequence.test(t) && ['cause', 'finding'].includes(kind)) f.push(F('P11', 'warn', 'This reads as a consequence (impact), not a cause.'));
  if (RE.missingControl.test(t) && causal) f.push(F('P12', 'warn', 'A missing control is not proven to be the cause. Show it would have prevented the event.'));
  if (kind === 'evidence' && RE.hedge.test(t)) f.push(F('P03', 'warn', 'Inference or uncertainty is recorded as evidence. Record the observation; keep the interpretation separate.'));
  if (['summary', 'narrative', 'finding'].includes(kind)) { const c = findContradictions(t, ctx.timeline || ctx.state?.timeline); for (const x of c) f.push(F('P09', kind === 'finding' ? 'block' : 'warn', `Contradicts validated timeline: "${x.event}" is recorded at ${x.validated}, text says ${x.claimed}. Not resolved automatically.`, { contradiction: x })); }
  if (ctx.cause && ctx.action) { const r = alignAction(ctx.cause, ctx.action); if (r === 'weak' || r === 'partial') f.push(F('P10', 'warn', `Corrective action alignment is ${r}: the action does not clearly address the stated cause.`, { rating: r })); }
  return done(f, ctx);
}
const rank = { PASS: 0, WARN: 1, BLOCK: 2 };
export const maxDecision = (a, b) => (rank[a] >= rank[b] ? a : b);
function done(f, ctx, abstained = false) {
  const decision = f.some((x) => x.level === 'block') ? 'BLOCK' : f.length ? 'WARN' : 'PASS';
  return { decision, findings: f, principleIds: [...new Set(f.map((x) => x.principle))], abstained, versions: { principleSet: VERSIONS.principleSet, reviewer: VERSIONS.integrityReviewer }, deterministic: true, acceptable: decision !== 'BLOCK' };
}
/** Second-pass AI verdict can only escalate; unavailable reviewer => at least WARN. */
export function mergeReview(det, ai) {
  if (!ai || ai.unavailable) return { ...det, decision: maxDecision(det.decision, 'WARN'), findings: [...det.findings, { principle: 'P14', level: 'warn', hard: true, message: 'Integrity review (AI second pass) unavailable. Manual validation required.' }], aiReview: 'unavailable', acceptable: det.decision !== 'BLOCK' };
  const d = maxDecision(det.decision, ai.decision);
  const extra = (ai.violations || []).map((v) => ({ principle: v.principle, level: ai.decision === 'BLOCK' ? 'block' : 'warn', hard: false, message: 'AI reviewer: ' + v.message, ai: true }));
  return { ...det, decision: d, findings: [...det.findings, ...extra], principleIds: [...new Set([...det.principleIds, ...extra.map((x) => x.principle)])], aiReview: ai.decision, acceptable: d !== 'BLOCK' };
}

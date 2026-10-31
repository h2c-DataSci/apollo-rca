// Layer A: deterministic RCA rule engine. No model, no DOM, fully testable.
const BLAME = ['operator error','human error','negligence','negligent','careless','carelessness','fault','blame','blamed','mistake','lazy','incompetent','failed to','failure to follow','should have','did not follow','violated','misconduct','irresponsible','reckless'];
const CAUSE_WORDS = ['because','due to','caused by','as a result of','owing to','resulting from','led to','therefore'];
const ASSUMPTION = ['probably','likely','maybe','perhaps','apparently','seems','seemed','presumably','assume','assumed','i think','must have','might have','possibly'];
const AMBIG = ['it','this','that','they','thing','stuff','something','issue','problem'];
const STOP = new Set('the a an of to in on at for and or with by from is was were be been are as it this that its into than then'.split(' '));
export const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
export const words = (s) => norm(s).split(' ').filter(Boolean);
export const tokens = (s) => norm(s).toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(' ').filter((w) => w.length > 2 && !STOP.has(w));
const hit = (text, list) => { const t = ' ' + norm(text).toLowerCase() + ' '; return list.filter((w) => t.includes(' ' + w + ' ') || t.includes(' ' + w + ',') || t.includes(' ' + w + '.')); };
const PERSON = /\b(?:mr|mrs|ms|engr|dr|sir|operator|technician|supervisor|worker|employee|contractor)\b\.?\s+[A-Z][a-z]+|\bby\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/;

export function reviewPrimaryEffect(text) {
  const t = norm(text); const issues = []; const n = words(t).length;
  if (!t) return { status: 'empty', wordCount: 0, issues: [{ code: 'EMPTY', severity: 'info', message: 'No primary effect entered.' }] };
  if (n > 4) issues.push({ code: 'LENGTH', severity: 'warn', message: `${n} words. Apollo primary effects are usually two to four words (noun + verb).` });
  if (n < 2) issues.push({ code: 'SHORT', severity: 'warn', message: 'Too short. Use a noun and a verb, for example "Oil Released".' });
  const b = hit(t, BLAME); if (b.length) issues.push({ code: 'BLAME', severity: 'warn', message: `Blame-oriented wording: ${b.join(', ')}.` });
  if (PERSON.test(t)) issues.push({ code: 'PERSON', severity: 'warn', message: 'Person-centered wording. A primary effect should not say who.' });
  const c = hit(t, CAUSE_WORDS); if (c.length) issues.push({ code: 'IMPLIED_CAUSE', severity: 'warn', message: `Implies a cause (${c.join(', ')}). A primary effect should not say why.` });
  if (/\band\b|,|;|\//.test(t)) issues.push({ code: 'MULTIPLE', severity: 'info', message: 'May combine more than one effect. Consider one primary effect each.' });
  if (n && AMBIG.includes(t.toLowerCase())) issues.push({ code: 'VAGUE', severity: 'warn', message: 'Vague wording.' });
  return { status: issues.some((i) => i.severity === 'warn') ? 'concern' : 'ok', wordCount: n, issues: issues.slice(0, 6) };
}

export function reviewCause(text, evidence = []) {
  const t = norm(text); const issues = [];
  if (!t) return { issues: [{ code: 'EMPTY', severity: 'info', message: 'No cause statement.' }], evidenceSupport: 'not-enough-information', blameRisk: 'none', assumptionRisk: 'low' };
  const b = hit(t, BLAME); const a = hit(t, ASSUMPTION); const amb = hit(t, AMBIG);
  if (b.length) issues.push({ code: 'BLAME', severity: 'warn', message: `Blame language: ${b.join(', ')}.` });
  if (PERSON.test(t)) issues.push({ code: 'PERSON', severity: 'warn', message: 'Names a person or role as the cause.' });
  if (a.length) issues.push({ code: 'ASSUMPTION', severity: 'warn', message: `Assumption wording: ${a.join(', ')}.` });
  if (amb.length) issues.push({ code: 'AMBIGUOUS', severity: 'info', message: `Ambiguous reference: ${amb.join(', ')}.` });
  if (hit(t, CAUSE_WORDS).length) issues.push({ code: 'CAUSAL_LEAP', severity: 'info', message: 'Contains an embedded cause. Split into separate cause-effect links.' });
  const ev = evidence.map(norm).filter(Boolean);
  const evidenceSupport = supportLevel(t, ev);
  return { issues: issues.slice(0, 6), evidenceSupport, blameRisk: b.length || PERSON.test(t) ? 'concern' : 'none', assumptionRisk: a.length > 1 ? 'high' : a.length ? 'medium' : 'low' };
}
export function supportLevel(statement, evidence) {
  if (!evidence.length) return 'not-enough-information';
  const st = new Set(tokens(statement)); if (!st.size) return 'not-enough-information';
  let best = 0; for (const e of evidence) { let o = 0; for (const w of tokens(e)) if (st.has(w)) o++; best = Math.max(best, o); }
  return best >= 3 ? 'supported' : best >= 1 ? 'partially-supported' : 'unsupported';
}
export function alignAction(cause, action) {
  const c = new Set(tokens(cause)); const a = tokens(action); if (!norm(cause) || !norm(action)) return 'indeterminate';
  const o = a.filter((w) => c.has(w)).length;
  return o >= 3 ? 'strong' : o >= 1 ? 'partial' : 'weak';
}
const TIME = /\b(\d{1,2}[:.]\d{2}\s?(?:am|pm|hrs|h)?|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2})\b/i;
export function timelineFromNarrative(text, max = 12) {
  const sents = norm(text).split(/(?<=[.!?])\s+/).filter((s) => s.length > 5).slice(0, max);
  return sents.map((s) => { const m = s.match(TIME); return { dateTimeText: m ? m[1].trim() : '', event: s.replace(/[.!?]+$/, ''), sourceText: s, certainty: m ? 'explicit' : 'unknown', needsValidation: true }; });
}
export function parseTimeHHMM(s) {
  const m = String(s).match(/(\d{1,2})[:.](\d{2})\s?(am|pm)?/i); if (!m) return '';
  let h = +m[1]; const ap = (m[3] || '').toLowerCase(); if (ap === 'pm' && h < 12) h += 12; if (ap === 'am' && h === 12) h = 0;
  return h > 23 || +m[2] > 59 ? '' : String(h).padStart(2, '0') + ':' + m[2];
}

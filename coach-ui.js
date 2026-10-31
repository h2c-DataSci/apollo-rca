// Layer C + UI: contextual RCA Coach. Overlay only; never mutates app data without an explicit Accept.
import { MODEL_CONFIG, AI_VERSION } from './ai-config.js';
import { AIService, TASK_NAMES } from './ai-service.js';
import { WorkerTransport } from './ai-transport.js';
import * as R from './rca-rules.js';
import { review as detReview, mergeReview, evidenceRegistry } from './rca-integrity.js';
import { VERSIONS } from './rca-principles.js';
import { exportCase, validateImport } from './case-io.js';

const APP_KEY = 'realitychart-intake-v1', NOTES_KEY = 'h2c-coach-notes-v1', PREF_KEY = 'h2c-coach-pref-v1';
const svc = new AIService(new WorkerTransport());
const $ = (t, a = {}, ...k) => { const e = document.createElement(t); for (const [x, v] of Object.entries(a)) x === 'class' ? (e.className = v) : x === 'text' ? (e.textContent = v) : e.setAttribute(x, v); k.flat(Infinity).forEach((c) => c && e.append(c)); return e; };
let lastField = null, undoStack = [], target = '';

// ---------- helpers
function setNative(el, v) { const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }
function fieldLabel(el) { const box = el.closest('div'); const l = box && box.parentElement && box.parentElement.querySelector('label, p, span'); return (el.getAttribute('aria-label') || (l && l.textContent) || el.placeholder || '').trim(); }
function appState() { try { return JSON.parse(localStorage.getItem(APP_KEY) || '{}'); } catch { return {}; } }
function flatten(o, p = '', out = []) { if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) flatten(v, p ? p + '.' + k : k, out); else if (typeof o === 'string' && o.trim()) out.push(`${p}: ${o.trim()}`); return out; }
const contextText = () => flatten(appState()).join('\n');
const evidenceList = () => flatten(appState()).filter((l) => /evidence|timeline|events?|note/i.test(l)).map((l) => l.replace(/^[^:]*:\s*/, ''));
const notes = () => { try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'); } catch { return []; } };
const saveNotes = (n) => localStorage.setItem(NOTES_KEY, JSON.stringify(n.slice(-200)));

// ---------- UI shell
const css = $('style', { text: `
.h2cc *{box-sizing:border-box}.h2cc-pill{position:fixed;right:16px;bottom:16px;z-index:9998;background:#0a5c45;color:#f1d16b;border:2px solid #c9a227;border-radius:999px;padding:10px 16px;font:600 14px system-ui;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.3)}
.h2cc-pill:focus-visible,.h2cc button:focus-visible,.h2cc textarea:focus-visible{outline:3px solid #c9a227;outline-offset:2px}
.h2cc-chip{position:fixed;z-index:9997;display:none;gap:6px}.h2cc-chip button{background:#0a5c45;color:#f1d16b;border:1px solid #c9a227;border-radius:6px;padding:4px 8px;font:600 12px system-ui;cursor:pointer}
.h2cc-drawer{position:fixed;top:0;right:0;height:100%;width:min(440px,100vw);z-index:9999;background:#fbf6e7;border-left:4px solid #c9a227;box-shadow:-6px 0 24px rgba(0,0,0,.3);overflow:auto;transform:translateX(100%);transition:transform .2s;font:14px system-ui;color:#1a2b24}
.h2cc-drawer.open{transform:none}.h2cc-head{background:linear-gradient(135deg,#043d2e,#0a5c45);color:#f1d16b;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;font:700 16px Georgia,serif}
.h2cc-body{padding:12px 14px;display:grid;gap:10px}.h2cc button.b{background:#0a5c45;color:#f1d16b;border:1px solid #c9a227;border-radius:6px;padding:6px 10px;font:600 13px system-ui;cursor:pointer}.h2cc button.b.alt{background:#fff;color:#0a5c45}.h2cc button.b.bad{background:#fff;color:#8a1c1c;border-color:#8a1c1c}.h2cc button:disabled{opacity:.45;cursor:not-allowed}
.h2cc textarea{width:100%;min-height:70px;border:1px solid #c9a227;border-radius:6px;padding:6px;font:13px system-ui;background:#fff}.h2cc .row{display:flex;flex-wrap:wrap;gap:6px}.h2cc .note{font-size:12px;color:#4a5a52}
.h2cc .card{background:#fff;border:1px solid #d9c98f;border-left:5px solid #c9a227;border-radius:6px;padding:8px;display:grid;gap:6px}.h2cc .card.rule{border-left-color:#0a5c45}.h2cc .badge{font:700 11px system-ui;background:#f1d16b;color:#043d2e;padding:2px 6px;border-radius:4px;justify-self:start}.h2cc .badge.r{background:#cfe8dc}.h2cc .warn{color:#8a5a00;font-weight:600}.h2cc .err{color:#8a1c1c;font-weight:600}
#h2c-new{margin-left:auto;background:linear-gradient(180deg,#f6dd7a,#c9a227);color:#043d2e;border:2px solid #fff3c4;border-radius:999px;padding:10px 18px;font:700 14px system-ui;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.3);white-space:nowrap}#h2c-new:hover{filter:brightness(1.08)}#h2c-new:focus-visible{outline:3px solid #fff;outline-offset:2px}.h2c-mast #h2c-new+.r{margin-left:16px}
.h2cc-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:18px;z-index:10000;background:#043d2e;color:#f1d16b;border:2px solid #c9a227;border-radius:8px;padding:10px 14px;display:flex;gap:12px;align-items:center;font:600 14px system-ui;box-shadow:0 4px 14px rgba(0,0,0,.4)}
@media(max-width:640px){#h2c-new{padding:8px 12px;font-size:13px}.h2cc-drawer{width:100vw;top:auto;bottom:0;height:80%;border-left:0;border-top:4px solid #c9a227;transform:translateY(100%)}}
`});
const pill = $('button', { class: 'h2cc-pill', 'aria-label': 'RCA Coach status. Open AI settings', text: 'AI Off' });
const chip = $('div', { class: 'h2cc-chip' });
const live = $('div', { 'aria-live': 'polite', role: 'status', style: 'position:absolute;left:-9999px' });
const drawer = $('aside', { class: 'h2cc-drawer', role: 'complementary', 'aria-label': 'H2C RCA Coach' });
const root = $('div', { class: 'h2cc no-print' }, css, pill, chip, live, drawer);
const results = $('div', { style: 'display:grid;gap:8px' });
const tgt = $('textarea', { 'aria-label': 'Text to review', placeholder: 'Click a field in the app, then "Ask RCA Coach" — or paste text here.', maxlength: '4000' });
const stat = $('div', { class: 'note' });
const enableBox = $('div', { class: 'card' });
const notesBox = $('div');

function labelFor(s) { return { disabled: 'AI Off', unsupported: 'AI Unsupported', loading: `AI Loading ${s.progress || 0}%`, ready: 'AI Ready', generating: 'AI Working', error: 'AI Error' }[s.status]; }
function renderStatus() {
  pill.textContent = labelFor(svc); live.textContent = labelFor(svc);
  stat.textContent = `Status: ${labelFor(svc)} · Model: ${MODEL_CONFIG.label} · Backend: ${svc.backend || 'not started'} · v${AI_VERSION}` + (svc.error ? ' — ' + svc.error : '');
  document.querySelectorAll('.h2cc [data-ai]').forEach((b) => (b.disabled = svc.status !== 'ready'));
  enableBox.replaceChildren();
  if (svc.status === 'disabled' || svc.status === 'error' || svc.status === 'unsupported') {
    if (svc.status !== 'disabled') enableBox.append($('div', { class: 'err', text: 'AI Assistant is unavailable. Your investigation has not been changed. You can continue in Standard Mode.' }));
    if (svc.status !== 'unsupported') enableBox.append($('div', { class: 'note', text: `Enabling AI downloads an open-source model (${MODEL_CONFIG.label}, ${MODEL_CONFIG.license}, about ${MODEL_CONFIG.approxDownloadMB} MB, cached in your browser) and runs it locally. Investigation content is not sent to any AI service. Only the AI library (jsDelivr CDN) and the model files (Hugging Face) are fetched; investigation text never leaves your browser.` }), $('button', { class: 'b', text: svc.status === 'error' ? 'Retry' : 'Enable AI Assistant', type: 'button' }));
    const b = enableBox.querySelector('button'); if (b) b.onclick = () => svc.enable();
  } else if (svc.status === 'loading') {
    enableBox.append($('div', { text: `Downloading / loading model… ${svc.progress || 0}%` }), $('div', { class: 'row' }, $('button', { class: 'b bad', type: 'button', text: 'Cancel', onclick: 'void 0' })));
    enableBox.querySelector('button').onclick = () => svc.disable();
  } else enableBox.append($('div', { text: 'AI is enabled and runs locally.' }), $('button', { class: 'b alt', type: 'button', text: 'Unload / Disable AI' })), (enableBox.querySelector('button').onclick = () => svc.disable());
}
svc.on(renderStatus);

function card(kind, title, ...kids) { return $('div', { class: 'card ' + (kind === 'rule' ? 'rule' : '') }, $('span', { class: 'badge ' + (kind === 'rule' ? 'r' : ''), text: kind === 'rule' ? 'Rule check (deterministic)' : 'AI suggestion — investigator validation required' }), title && $('strong', { text: title }), kids); }
function addResult(c) { results.prepend(c); }

// Accept / Modify / Reject card. BLOCK can never be accepted; every Accept re-reviews the CURRENT text (no bypass via DOM edits).
const ICON = { PASS: '✔ PASS', WARN: '⚠ WARN', BLOCK: '⛔ BLOCK' };
function reviewBox(rev) {
  if (!rev) return null; const r = rev.review || rev;
  return $('div', { class: 'note', role: 'group', 'aria-label': `Integrity review result ${r.decision}` }, $('strong', { class: r.decision === 'BLOCK' ? 'err' : r.decision === 'WARN' ? 'warn' : '', text: `${ICON[r.decision]} · Integrity review${r.principleIds.length ? ' · ' + r.principleIds.join(', ') : ''}${r.abstained ? ' · abstained (acceptable)' : ''}` }), ...r.findings.map((f) => $('div', { text: `${f.principle}${f.hard ? ' (hard)' : ''}: ${f.message}` })), r.decision === 'BLOCK' ? $('div', { class: 'err', text: 'Direct acceptance is disabled. Modify the text, regenerate, or reject.' }) : null);
}
function suggestion(task, label, text, mode, extra = {}) {
  const body = $('div', { text }); let ta = null; let rev = extra.review || null; const revHost = $('div');
  const draw = () => { revHost.replaceChildren(reviewBox(rev) || ''); acc.disabled = !!(rev && rev.review.decision === 'BLOCK'); acc.setAttribute('aria-disabled', String(acc.disabled)); live.textContent = rev ? `Integrity review ${rev.review.decision}` : ''; };
  const c = card('ai', `${task} · ${label}`, body, revHost);
  const mod = $('button', { class: 'b alt', type: 'button', text: 'Modify' }), acc = $('button', { class: 'b', type: 'button', text: 'Accept' }), rej = $('button', { class: 'b bad', type: 'button', text: 'Reject' }), rr = $('button', { class: 'b alt', type: 'button', text: 'Re-review', style: 'display:none' });
  const current = () => (ta ? ta.value : text);
  const rereview = () => { if (extra.ctx) { rev = { text: current(), review: detReview(current(), { ...extra.ctx, state: appState(), registry: evidenceRegistry(appState()) }) }; draw(); } };
  mod.onclick = () => { if (ta) return; ta = $('textarea', { 'aria-label': 'Edit suggestion before accepting' }); ta.value = text; body.replaceChildren(ta); rr.style.display = ''; ta.focus(); ta.addEventListener('input', () => { acc.disabled = true; }); };
  rr.onclick = rereview;
  rej.onclick = () => { logDecision(task, 'reject', current(), rev, extra); c.remove(); };
  acc.onclick = () => {
    const v = current(); if (extra.ctx) rereview(); // re-validate exactly what would be stored
    if (rev && rev.review.decision === 'BLOCK') { live.textContent = 'Blocked: cannot accept'; return; }
    if (rev && rev.review.decision === 'WARN' && !confirm('Integrity review raised warnings (' + rev.review.principleIds.join(', ') + '). Accept anyway as AI-assisted, unvalidated content?')) return;
    if (applyAccepted(task, mode, v, { ...extra, userAction: ta ? 'modify-accept' : 'accept', rev })) { c.querySelector('.badge').textContent = ta ? 'Accepted (AI-assisted, modified)' : 'Accepted (AI-assisted)'; body.textContent = v; [mod, acc, rej, rr].forEach((x) => x.remove()); c.append($('div', { class: 'note', text: mode === 'field' ? 'Applied to the field. Use Undo in this panel to revert.' : mode === 'timeline' ? 'Added as a timeline row. Verify against evidence.' : mode === 'hypothesis' ? 'Saved as a HYPOTHESIS note (not a finding).' : 'Saved to AI-assisted notes (not part of validated findings).' })); }
  };
  c.append($('div', { class: 'row' }, acc, mod, rr, rej)); draw(); return c;
}
function logDecision(task, action, text, rev, extra) { const n = notes(); n.push({ task, text: '', origin: 'ai-assisted', status: 'rejected', userAction: action, at: new Date().toISOString() }); /* rejections are logged for audit but never shown as findings */ saveNotes(n.slice(-200)); }
function applyAccepted(task, mode, v, extra) {
  if (extra.rev && extra.rev.review.decision === 'BLOCK') return false;
  const prov = (extra.rev && extra.provenance) ? extra.provenance : null;
  const record = (status) => { const n = notes(); n.push({ task, text: v, origin: 'ai-assisted', status, userAction: extra.userAction, at: new Date().toISOString(), sourceIds: extra.sourceIds || [], provenance: prov, reviewerDecision: extra.rev ? extra.rev.review.decision : 'n/a', principleIds: extra.rev ? extra.rev.review.principleIds : [] }); saveNotes(n); renderNotes(); };
  if (mode === 'field') {
    const el = extra.el && document.contains(extra.el) ? extra.el : lastField; if (!el) { alert('Click the field in the app that should receive this text, then Accept again.'); return false; }
    undoStack.push({ el, prev: el.value }); setNative(el, v); refreshUndo(); record('ai-assisted'); return true;
  }
  if (mode === 'timeline') {
    const add = [...document.querySelectorAll('main button')].find((b) => /^\s*Row\s*$/.test(b.textContent)); if (!add) { alert('Timeline "Row" button not found in this view.'); return false; }
    add.click();
    setTimeout(() => { const t = [...document.querySelectorAll('main input[placeholder="14:32"]')].pop(); if (!t) return; const e = t.parentElement.querySelector('input:not([placeholder="14:32"])'); const tm = R.parseTimeHHMM(extra.time || ''); if (tm) setNative(t, tm); if (e) setNative(e, v); const del = t.parentElement.querySelector('button'); undoStack.push({ del, el: null }); refreshUndo(); }, 60);
    record('ai-assisted'); return true;
  }
  record(mode === 'hypothesis' ? 'hypothesis' : 'ai-assisted'); return true;
}
const undoBtn = $('button', { class: 'b alt', type: 'button', text: 'Undo last AI insertion', disabled: '' });
function refreshUndo() { undoBtn.disabled = !undoStack.length; }
undoBtn.onclick = () => { const u = undoStack.pop(); if (u) { if (u.el) setNative(u.el, u.prev); else if (u.del && document.contains(u.del)) u.del.click(); } refreshUndo(); };
function renderNotes() { const n = notes().filter((x) => x.status !== 'rejected'); notesBox.replaceChildren($('strong', { text: `AI-assisted notes (${n.length}) — not validated findings` }), ...n.slice(-5).reverse().map((x) => $('div', { class: 'note', text: `[${x.task}${x.status === 'hypothesis' ? ' · HYPOTHESIS' : ''}] ${x.text}` })), $('div', { class: 'row' }, $('button', { class: 'b alt', type: 'button', text: 'Copy notes' }))); notesBox.querySelector('button').onclick = () => navigator.clipboard && navigator.clipboard.writeText(n.map((x) => `[${x.task}${x.status === 'hypothesis' ? ' · HYPOTHESIS' : ''}] ${x.text}`).join('\n\n')); }

// Layer A output (works without AI)
const evItems = () => evidenceRegistry(appState()).items;
function ruleCard() {
  const t = tgt.value; const label = lastField ? fieldLabel(lastField) : ''; const isPE = /^what$/i.test(label);
  const st = appState(); const rev = isPE ? null : detReview(t, { kind: 'cause', origin: 'user', state: st });
  const rr = isPE ? R.reviewPrimaryEffect(t) : null;
  const lines = [];
  if (rr) { rr.issues.forEach((i) => lines.push($('div', { class: i.severity === 'warn' ? 'warn' : '', text: (i.severity === 'warn' ? '⚠ ' : 'ℹ ') + i.message }))); if (!rr.issues.length) lines.push($('div', { text: '✓ No rule concerns found.' })); }
  if (rev) lines.push(reviewBox({ review: rev }), $('div', { class: 'note', text: `Evidence refs available: ${evItems().map((e) => e.id).join(', ') || 'none'}. Raw notes are unrestricted; this applies to analytical findings.` }));
  addResult(card('rule', isPE ? `Primary effect check · ${rr.wordCount} words` : 'Cause statement check (principles ' + VERSIONS.principleSet + ')', lines));
}

// AI tasks
const INTEGRITY_TASKS = ['reviewAnalysisIntegrity', 'reviewNarrativeIntegrity', 'detectContradictions', 'detectUnsupportedClaims'];
async function runTask(task) {
  const t = tgt.value.trim(); if (!t && !['summarizeInvestigation', 'draftInvestigationNarrative'].includes(task)) { alert('Enter or pick some text first.'); return; }
  const st = appState(); const ev = evItems().map((e) => ({ id: e.id, text: e.text })); const tl = (st.timeline || []).filter((x) => x && x.time).map((x) => ({ id: x.id, time: x.time, description: x.description }));
  const ctx = contextText(); const el = lastField;
  const input = { text: t, context: ctx, evidence: ev, timeline: tl, cause: t, action: t, state: st, candidate: t, source: t };
  if (task === 'summarizeInvestigation' || task === 'draftInvestigationNarrative') input.text = ctx;
  if (task === 'reviewCorrectiveActionAlignment') { input.cause = prompt('Accepted cause this action should address:', '') || ''; }
  try {
    if (INTEGRITY_TASKS.includes(task)) {
      const det = detReview(t, { kind: 'finding', origin: 'ai', state: st, timeline: tl });
      let air = { unavailable: true }; try { const out = await svc.run(task, input); air = out.value.decision ? out.value : air; if (task === 'detectContradictions') addResult(card('ai', 'Contradictions (not resolved)', $('div', { text: out.value.contradictions.map((x) => `${x.claim} ↔ ${x.conflictsWith}`).join('; ') || 'None found by AI' }))); if (task === 'detectUnsupportedClaims') addResult(card('ai', 'Unsupported claims', $('div', { text: out.value.claims.map((x) => `${x.claim}: ${x.issue}`).join('; ') || 'None found by AI' }))); } catch {}
      addResult(card('rule', ({ reviewAnalysisIntegrity: 'Integrity review', reviewNarrativeIntegrity: 'Narrative integrity review', detectContradictions: 'Contradiction check', detectUnsupportedClaims: 'Unsupported-claims check' })[task], reviewBox({ review: mergeReview(det, air) }))); return;
    }
    const out = await svc.run(task, input); const v = out.value; const revs = out.reviews || []; const R0 = (i) => revs[i];
    const S = (l, a, mode = 'note') => a && a.length && a.forEach((x) => addResult(suggestion(task, l, x, mode, { provenance: out.provenance })));
    if (task === 'reviewPrimaryEffect' || task === 'rewritePrimaryEffect') { (v.rewrites || []).forEach((x, i) => addResult(suggestion(task, 'rewrite', x, 'field', { el, review: R0(i), ctx: revs[i] && { kind: 'rewrite', origin: 'ai', sourceText: t }, provenance: out.provenance, sourceIds: [] }))); if (v.explanation || v.rationale) addResult(card('ai', task, $('div', { text: v.explanation || v.rationale }), $('div', { class: 'note', text: (v.issues || []).join(' · ') }))); S('question', v.questions); }
    else if (task === 'extractTimelineCandidates') v.events.forEach((x, i) => addResult(suggestion(task, `${x.dateTimeText || 'time unknown'} · ${x.certainty}`, x.event, 'timeline', { time: x.dateTimeText, review: R0(i), ctx: { kind: 'summary', origin: 'ai', sourceText: x.sourceText || t, context: t }, provenance: out.provenance })));
    else if (task === 'reviewCauseStatement') { addResult(card('ai', 'Cause Quality Check', $('div', { text: `Observable: ${v.observable ? 'yes' : 'concern'} · Evidence support: ${v.evidenceSupport} · Blame: ${v.blameRisk} · Assumption risk: ${v.assumptionRisk}` }), $('div', { class: 'note', text: [v.ambiguity, v.causalLinkConcern].filter(Boolean).join(' · ') }))); if (v.suggestedRevision) addResult(suggestion(task, 'suggested revision', v.suggestedRevision, 'field', { el, review: R0(0), ctx: { kind: 'cause', origin: 'ai', sourceText: t }, provenance: out.provenance, sourceIds: v.evidenceIds })); S('follow-up', v.questions); }
    else if (task === 'identifyEvidenceGaps') { S('gap', v.gaps); S('contradiction', v.contradictions); S('evidence to seek (category)', v.evidenceToSeek); }
    else if (task === 'generateClarifyingQuestions') S('question', v.questions);
    else if (task === 'suggestHypothesisBranches') v.hypotheses.forEach((h, i) => addResult(suggestion(task, 'Hypothesis — requires evidence and investigator validation', `${h.statement}\nWhy relevant: ${h.relevance}\nEvidence required: ${h.evidenceRequired}\nDisconfirmed by: ${h.disconfirmedBy}`, 'hypothesis', { review: R0(i), ctx: { kind: 'hypothesis', origin: 'ai' }, provenance: out.provenance, sourceIds: h.evidenceIds })));
    else if (task === 'reviewCorrectiveActionAlignment') addResult(suggestion(task, `alignment: ${v.rating} (addresses ${v.addresses})`, `${v.rationale} ${v.residualQuestion}`.trim(), 'note', { review: R0(0), ctx: { kind: 'rewrite', origin: 'ai', cause: input.cause, action: input.action }, provenance: out.provenance }));
    else if (task === 'summarizeInvestigation') { const all = [['established fact', v.establishedFacts], ['causal analysis', v.causalAnalysis], ['corrective action', v.correctiveActions]]; let k = 0; all.forEach(([l, a]) => a.forEach((x) => { const rv = R0(k++); addResult(suggestion(task, l, x, 'note', { review: rv, ctx: { kind: 'summary', origin: 'ai', sourceText: input.text, context: input.text }, provenance: out.provenance })); })); S('unresolved (kept separate)', v.unresolved); }
    else if (task === 'draftInvestigationNarrative') addResult(suggestion(task, 'AI-assisted draft narrative (editable)', v.narrative, 'note', { review: R0(0), ctx: { kind: 'narrative', origin: 'ai', sourceText: input.text, context: input.text }, provenance: out.provenance, sourceIds: v.evidenceIds }));
  } catch (e) { addResult(card('ai', 'AI Assistant is unavailable', $('div', { class: 'err', text: 'Your investigation has not been changed. You can continue in Standard Mode.' }), $('div', { class: 'note', text: svc.error || String(e.message || e) }))); }
}
const TASK_BTNS = [['reviewPrimaryEffect', 'Review wording'], ['rewritePrimaryEffect', 'Suggest rewrite'], ['extractTimelineCandidates', 'Extract timeline'], ['reviewCauseStatement', 'Ask RCA Coach'], ['identifyEvidenceGaps', 'Check evidence gap'], ['generateClarifyingQuestions', 'Clarifying questions'], ['suggestHypothesisBranches', 'Suggest hypotheses'], ['reviewCorrectiveActionAlignment', 'Review cause alignment'], ['summarizeInvestigation', 'Summarize'], ['draftInvestigationNarrative', 'Draft narrative'], ['reviewAnalysisIntegrity', 'Integrity review'], ['reviewNarrativeIntegrity', 'Narrative integrity'], ['detectContradictions', 'Detect contradictions'], ['detectUnsupportedClaims', 'Unsupported claims']];
drawer.append(
  $('div', { class: 'h2cc-head' }, $('span', { text: 'RCA Coach · h2c_Creates' }), $('button', { class: 'b', type: 'button', 'aria-label': 'Close RCA Coach', text: '✕', onclick: 'void 0' })),
  $('div', { class: 'h2cc-body' },
    $('div', { class: 'note', text: 'Privacy: your investigation stays in this browser. AI runs locally in a Web Worker; no investigation content is sent to a cloud AI service and there is no telemetry. Standard Mode works fully without AI.' }),
    stat, enableBox,
    $('div', { class: 'note', text: 'Local AI can make mistakes. Treat its output as a suggestion. Verify against evidence and investigation records before acceptance.' }),
    tgt,
    $('div', { class: 'row' }, $('button', { class: 'b alt', type: 'button', text: 'Rule check (no AI)', id: 'h2cc-rule' }), $('button', { class: 'b alt', type: 'button', text: 'Use focused field', id: 'h2cc-use' }), undoBtn, $('button', { class: 'b bad', type: 'button', text: 'Cancel AI task', id: 'h2cc-cancel' })),
    $('div', { class: 'row' }, ...TASK_BTNS.map(([k, l]) => { const det = ['reviewAnalysisIntegrity', 'reviewNarrativeIntegrity', 'detectContradictions', 'detectUnsupportedClaims'].includes(k); const b = $('button', det ? { class: 'b alt', type: 'button', text: l } : { class: 'b', type: 'button', 'data-ai': k, text: l, disabled: '' }); b.onclick = () => runTask(k); return b; })),
    results, notesBox,
    $('div', { class: 'row' }, $('button', { class: 'b alt', type: 'button', text: 'Export case (JSON)', id: 'h2cc-export' }), $('button', { class: 'b alt', type: 'button', text: 'Import case (JSON)', id: 'h2cc-import' }), $('input', { type: 'file', accept: 'application/json,.json', id: 'h2cc-file', 'aria-label': 'Choose case file to import', style: 'display:none' }), $('button', { class: 'b bad', type: 'button', text: 'Reset local data…', id: 'h2cc-reset' })),
    $('div', { class: 'note', text: `Model: ${MODEL_CONFIG.id} (${MODEL_CONFIG.license}) via Transformers.js ${MODEL_CONFIG.libraryVersion} (Apache-2.0).` })));
drawer.querySelector('.h2cc-head button').onclick = () => openDrawer(false);
drawer.querySelector('#h2cc-rule').onclick = ruleCard;
drawer.querySelector('#h2cc-use').onclick = () => { if (lastField) tgt.value = lastField.value; };
drawer.querySelector('#h2cc-cancel').onclick = () => svc.cancel();
// One shared clear path: used by the masthead "New analysis" button and the drawer's reset. Keeps a 1-step backup so Undo works.
const BACKUP_KEY = 'h2c-last-cleared-v1', TOAST_KEY = 'h2c-cleared-toast';
function clearCase(msg) {
  if (!confirm(msg)) return;
  try { localStorage.setItem(BACKUP_KEY, JSON.stringify({ app: localStorage.getItem(APP_KEY), notes: localStorage.getItem(NOTES_KEY), at: Date.now() })); sessionStorage.setItem(TOAST_KEY, '1'); } catch {}
  localStorage.removeItem(APP_KEY); localStorage.removeItem(NOTES_KEY); location.reload();
}
function undoClear() { try { const b = JSON.parse(localStorage.getItem(BACKUP_KEY) || 'null'); if (!b) return; if (b.app != null) localStorage.setItem(APP_KEY, b.app); if (b.notes != null) localStorage.setItem(NOTES_KEY, b.notes); localStorage.removeItem(BACKUP_KEY); } catch {} location.reload(); }
drawer.querySelector('#h2cc-reset').onclick = () => clearCase('Delete ALL locally stored investigation data and AI notes in this browser? You can undo right after.');
const newBtn = $('button', { type: 'button', id: 'h2c-new', class: 'h2c-new', 'aria-label': 'New analysis: clear the current analysis and start a new one', text: '＋ New analysis' });
newBtn.onclick = () => clearCase('Clear analysis and start new?\n\nThe current case is removed from this browser. You can undo right after. Use Export case first if you want a file copy.');
const mountNew = () => { const m = document.querySelector('.h2c-mast'); if (m && !m.contains(newBtn)) { const r = m.querySelector('.r'); m.insertBefore(newBtn, r || null); } };
mountNew(); new MutationObserver(mountNew).observe(document.documentElement, { childList: true, subtree: true });
if (sessionStorage.getItem(TOAST_KEY)) { sessionStorage.removeItem(TOAST_KEY); const t = $('div', { class: 'h2cc-toast', role: 'status' }, $('span', { text: 'Analysis cleared. Starting fresh.' }), $('button', { type: 'button', class: 'b', text: 'Undo', onclick: 'void 0' })); t.querySelector('button').onclick = undoClear; root.append(t); setTimeout(() => t.remove(), 20000); }
const openDrawer = (o) => { drawer.classList.toggle('open', o); if (o) drawer.querySelector('.h2cc-head button').focus(); else pill.focus(); };
pill.onclick = () => openDrawer(!drawer.classList.contains('open'));
drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-modal', 'false');
drawer.querySelector('#h2cc-export').onclick = () => { const blob = new Blob([JSON.stringify(exportCase(appState(), notes()), null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'h2c-rca-case.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
drawer.querySelector('#h2cc-import').onclick = () => drawer.querySelector('#h2cc-file').click();
drawer.querySelector('#h2cc-file').onchange = async (e) => { const f = e.target.files[0]; if (!f) return; const r = validateImport(await f.text()); if (!r.ok) { addResult(card('rule', 'Import rejected', $('div', { class: 'err', text: r.error + ' Nothing was changed.' }))); return; } if (!confirm('Replace the current investigation with the imported case?')) return; localStorage.setItem(APP_KEY, JSON.stringify(r.state)); saveNotes(r.notes); location.reload(); };
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('open')) openDrawer(false); });

// contextual chip next to the focused app field
document.addEventListener('focusin', (e) => {
  const el = e.target; if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) || root.contains(el) || (el.type && !['text', 'search', ''].includes(el.type) && el.tagName === 'INPUT')) return;
  lastField = el; const r = el.getBoundingClientRect(); const label = fieldLabel(el); const isPE = /^what$/i.test(label);
  chip.replaceChildren(...[isPE ? ['Review wording', 'reviewPrimaryEffect'] : el.tagName === 'TEXTAREA' ? ['Extract timeline', 'extractTimelineCandidates'] : ['Ask RCA Coach', 'reviewCauseStatement']].map(([l, k]) => { const b = $('button', { type: 'button', text: l }); b.onmousedown = (ev) => ev.preventDefault(); b.onclick = () => { tgt.value = el.value; target = k; openDrawer(true); ruleCard(); }; return b; }));
  chip.style.display = 'flex'; chip.style.left = Math.max(4, Math.min(r.left, innerWidth - 170)) + 'px'; chip.style.top = Math.max(4, r.top - 30) + 'px';
});
document.addEventListener('scroll', () => (chip.style.display = 'none'), true);
document.addEventListener('mousedown', (e) => { if (!chip.contains(e.target) && e.target !== lastField) chip.style.display = 'none'; });
renderStatus(); renderNotes(); const mount = () => document.documentElement.append(root); mount(); new MutationObserver(() => { if (!root.isConnected) mount(); }).observe(document.documentElement, { childList: true });

// Layer C + UI: contextual RCA Coach. Overlay only; never mutates app data without an explicit Accept.
import { MODEL_CONFIG, AI_VERSION } from './ai-config.js';
import { AIService, TASK_NAMES } from './ai-service.js';
import { WorkerTransport } from './ai-transport.js';
import * as R from './rca-rules.js';

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
@media(max-width:640px){.h2cc-drawer{width:100vw;top:auto;bottom:0;height:80%;border-left:0;border-top:4px solid #c9a227;transform:translateY(100%)}}
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
    if (svc.status !== 'unsupported') enableBox.append($('div', { class: 'note', text: `Enabling AI downloads an open-source model (${MODEL_CONFIG.label}, ${MODEL_CONFIG.license}, about ${MODEL_CONFIG.approxDownloadMB} MB, cached in your browser) and runs it locally. Investigation content is not sent to any AI service. Only the model files are fetched from the Hugging Face model host.` }), $('button', { class: 'b', text: svc.status === 'error' ? 'Retry' : 'Enable AI Assistant', type: 'button' }));
    const b = enableBox.querySelector('button'); if (b) b.onclick = () => svc.enable();
  } else if (svc.status === 'loading') {
    enableBox.append($('div', { text: `Downloading / loading model… ${svc.progress || 0}%` }), $('div', { class: 'row' }, $('button', { class: 'b bad', type: 'button', text: 'Cancel', onclick: 'void 0' })));
    enableBox.querySelector('button').onclick = () => svc.disable();
  } else enableBox.append($('div', { text: 'AI is enabled and runs locally.' }), $('button', { class: 'b alt', type: 'button', text: 'Unload / Disable AI' })), (enableBox.querySelector('button').onclick = () => svc.disable());
}
svc.on(renderStatus);

function card(kind, title, ...kids) { return $('div', { class: 'card ' + (kind === 'rule' ? 'rule' : '') }, $('span', { class: 'badge ' + (kind === 'rule' ? 'r' : ''), text: kind === 'rule' ? 'Rule check (deterministic)' : 'AI suggestion — investigator validation required' }), title && $('strong', { text: title }), kids); }
function addResult(c) { results.prepend(c); }

// Accept / Modify / Reject card for one suggestion
function suggestion(task, label, text, mode, extra = {}) {
  const body = $('div', { text }); let ta = null;
  const c = card('ai', `${task} · ${label}`, body);
  const mod = $('button', { class: 'b alt', type: 'button', text: 'Modify' }), acc = $('button', { class: 'b', type: 'button', text: 'Accept' }), rej = $('button', { class: 'b bad', type: 'button', text: 'Reject' });
  mod.onclick = () => { if (ta) return; ta = $('textarea', { 'aria-label': 'Edit suggestion before accepting' }); ta.value = text; body.replaceChildren(ta); ta.focus(); };
  rej.onclick = () => c.remove();
  acc.onclick = () => { const v = ta ? ta.value : text; if (applyAccepted(task, mode, v, extra)) { c.querySelector('.badge').textContent = (ta ? 'Accepted (AI-assisted, modified)' : 'Accepted (AI-assisted)'); body.textContent = v; [mod, acc, rej].forEach((x) => x.remove()); c.append($('div', { class: 'note', text: mode === 'field' ? 'Applied to the field. Use Undo in this panel to revert.' : mode === 'timeline' ? 'Added as a timeline row. Verify against evidence.' : 'Saved to AI-assisted notes (not part of validated findings).' })); } };
  c.append($('div', { class: 'row' }, acc, mod, rej)); return c;
}
function applyAccepted(task, mode, v, extra) {
  if (mode === 'field') {
    const el = extra.el && document.contains(extra.el) ? extra.el : lastField; if (!el) { alert('Click the field in the app that should receive this text, then Accept again.'); return false; }
    undoStack.push({ el, prev: el.value }); setNative(el, v); refreshUndo(); return true;
  }
  if (mode === 'timeline') {
    const add = [...document.querySelectorAll('main button')].find((b) => /^\s*Row\s*$/.test(b.textContent)); if (!add) { alert('Timeline "Row" button not found in this view.'); return false; }
    add.click();
    setTimeout(() => { const t = [...document.querySelectorAll('main input[placeholder="14:32"]')].pop(); if (!t) return; const e = t.parentElement.querySelector('input:not([placeholder="14:32"])'); const tm = R.parseTimeHHMM(extra.time || ''); if (tm) setNative(t, tm); if (e) setNative(e, v); const del = t.parentElement.querySelector('button'); undoStack.push({ del, el: null }); refreshUndo(); }, 60);
    return true;
  }
  const n = notes(); n.push({ task, text: v, origin: 'ai-assisted', at: new Date().toISOString() }); saveNotes(n); renderNotes(); return true;
}
const undoBtn = $('button', { class: 'b alt', type: 'button', text: 'Undo last AI insertion', disabled: '' });
function refreshUndo() { undoBtn.disabled = !undoStack.length; }
undoBtn.onclick = () => { const u = undoStack.pop(); if (u) { if (u.el) setNative(u.el, u.prev); else if (u.del && document.contains(u.del)) u.del.click(); } refreshUndo(); };
function renderNotes() { const n = notes(); notesBox.replaceChildren($('strong', { text: `AI-assisted notes (${n.length}) — not validated findings` }), ...n.slice(-5).reverse().map((x) => $('div', { class: 'note', text: `[${x.task}] ${x.text}` })), $('div', { class: 'row' }, $('button', { class: 'b alt', type: 'button', text: 'Copy notes', onclick: 'void 0' }))); notesBox.querySelector('button').onclick = () => navigator.clipboard && navigator.clipboard.writeText(notes().map((x) => `[${x.task}] ${x.text}`).join('\n\n')); }

// Layer A output
function ruleCard() {
  const t = tgt.value; const label = lastField ? fieldLabel(lastField) : '';
  const isPE = /^what$/i.test(label); const rr = isPE ? R.reviewPrimaryEffect(t) : R.reviewCause(t, evidenceList());
  const lines = rr.issues.length ? rr.issues.map((i) => $('div', { class: i.severity === 'warn' ? 'warn' : '', text: (i.severity === 'warn' ? '⚠ ' : 'ℹ ') + i.message })) : [$('div', { text: '✓ No rule concerns found.' })];
  if (!isPE) lines.push($('div', { class: 'note', text: `Evidence support (keyword match against your entries): ${rr.evidenceSupport}. This is a rough rule check, not validation.` }));
  addResult(card('rule', isPE ? `Primary effect check · ${rr.wordCount} words` : 'Cause statement check', lines));
}

// AI tasks
async function runTask(task) {
  const t = tgt.value.trim(); if (!t && !['summarizeInvestigation', 'draftInvestigationNarrative'].includes(task)) { alert('Enter or pick some text first.'); return; }
  const ctx = contextText(); const el = lastField;
  const input = { text: t, context: ctx, evidence: evidenceList(), cause: t, action: t };
  if (task === 'summarizeInvestigation' || task === 'draftInvestigationNarrative') input.text = ctx;
  if (task === 'reviewCorrectiveActionAlignment') { input.cause = prompt('Accepted cause this action should address:', '') || ''; }
  try {
    const { value: v } = await svc.run(task, input);
    const S = (l, a) => a && a.length && a.forEach((x) => addResult(suggestion(task, l, x, 'note')));
    if (task === 'reviewPrimaryEffect' || task === 'rewritePrimaryEffect') { (v.rewrites || []).forEach((x) => addResult(suggestion(task, 'rewrite', x, 'field', { el }))); if (v.explanation || v.rationale) addResult(card('ai', task, $('div', { text: v.explanation || v.rationale }), $('div', { class: 'note', text: (v.issues || []).join(' · ') }))); S('question', v.questions); }
    else if (task === 'extractTimelineCandidates') v.events.forEach((x) => addResult(suggestion(task, `${x.dateTimeText || 'time unknown'} · ${x.certainty}`, x.event, 'timeline', { time: x.dateTimeText })));
    else if (task === 'reviewCauseStatement') { addResult(card('ai', 'Cause Quality Check', $('div', { text: `Observable: ${v.observable ? 'yes' : 'concern'} · Evidence support: ${v.evidenceSupport} · Blame: ${v.blameRisk} · Assumption risk: ${v.assumptionRisk}` }), $('div', { class: 'note', text: [v.ambiguity, v.causalLinkConcern].filter(Boolean).join(' · ') }))); if (v.suggestedRevision) addResult(suggestion(task, 'suggested revision', v.suggestedRevision, 'field', { el })); S('follow-up', v.questions); }
    else if (task === 'identifyEvidenceGaps') { S('gap', v.gaps); S('contradiction', v.contradictions); S('evidence to seek (category)', v.evidenceToSeek); }
    else if (task === 'generateClarifyingQuestions') S('question', v.questions);
    else if (task === 'suggestHypothesisBranches') v.hypotheses.forEach((h) => addResult(suggestion(task, 'Hypothesis — requires evidence and investigator validation', `${h.statement}\nWhy relevant: ${h.relevance}\nEvidence required: ${h.evidenceRequired}\nDisconfirmed by: ${h.disconfirmedBy}`, 'note')));
    else if (task === 'reviewCorrectiveActionAlignment') addResult(suggestion(task, `alignment: ${v.rating} (addresses ${v.addresses})`, `${v.rationale} ${v.residualQuestion}`.trim(), 'note'));
    else if (task === 'summarizeInvestigation') { S('established fact', v.establishedFacts); S('causal analysis', v.causalAnalysis); S('unresolved', v.unresolved); S('corrective action', v.correctiveActions); }
    else if (task === 'draftInvestigationNarrative') addResult(suggestion(task, 'AI-assisted draft narrative (editable)', v.narrative, 'note'));
  } catch (e) { addResult(card('ai', 'AI Assistant is unavailable', $('div', { class: 'err', text: 'Your investigation has not been changed. You can continue in Standard Mode.' }), $('div', { class: 'note', text: svc.error || String(e.message || e) }))); }
}

const TASK_BTNS = [['reviewPrimaryEffect', 'Review wording'], ['rewritePrimaryEffect', 'Suggest rewrite'], ['extractTimelineCandidates', 'Extract timeline'], ['reviewCauseStatement', 'Ask RCA Coach'], ['identifyEvidenceGaps', 'Check evidence gap'], ['generateClarifyingQuestions', 'Clarifying questions'], ['suggestHypothesisBranches', 'Suggest hypotheses'], ['reviewCorrectiveActionAlignment', 'Review cause alignment'], ['summarizeInvestigation', 'Summarize'], ['draftInvestigationNarrative', 'Draft narrative']];
drawer.append(
  $('div', { class: 'h2cc-head' }, $('span', { text: 'RCA Coach · h2c_Creates' }), $('button', { class: 'b', type: 'button', 'aria-label': 'Close RCA Coach', text: '✕', onclick: 'void 0' })),
  $('div', { class: 'h2cc-body' },
    $('div', { class: 'note', text: 'Privacy: your investigation stays in this browser. AI runs locally in a Web Worker; no investigation content is sent to a cloud AI service and there is no telemetry. Standard Mode works fully without AI.' }),
    stat, enableBox,
    $('div', { class: 'note', text: 'Local AI can make mistakes. Treat its output as a suggestion. Verify against evidence and investigation records before acceptance.' }),
    tgt,
    $('div', { class: 'row' }, $('button', { class: 'b alt', type: 'button', text: 'Rule check (no AI)', id: 'h2cc-rule' }), $('button', { class: 'b alt', type: 'button', text: 'Use focused field', id: 'h2cc-use' }), undoBtn, $('button', { class: 'b bad', type: 'button', text: 'Cancel AI task', id: 'h2cc-cancel' })),
    $('div', { class: 'row' }, ...TASK_BTNS.map(([k, l]) => { const b = $('button', { class: 'b', type: 'button', 'data-ai': k, text: l, disabled: '' }); b.onclick = () => runTask(k); return b; })),
    results, notesBox,
    $('div', { class: 'row' }, $('button', { class: 'b bad', type: 'button', text: 'Reset local data…', id: 'h2cc-reset' })),
    $('div', { class: 'note', text: `Model: ${MODEL_CONFIG.id} (${MODEL_CONFIG.license}) via Transformers.js ${MODEL_CONFIG.libraryVersion} (Apache-2.0).` })));
drawer.querySelector('.h2cc-head button').onclick = () => drawer.classList.remove('open');
drawer.querySelector('#h2cc-rule').onclick = ruleCard;
drawer.querySelector('#h2cc-use').onclick = () => { if (lastField) tgt.value = lastField.value; };
drawer.querySelector('#h2cc-cancel').onclick = () => svc.cancel();
drawer.querySelector('#h2cc-reset').onclick = () => { if (confirm('Delete ALL locally stored investigation data and AI notes in this browser? This cannot be undone.')) { localStorage.removeItem(APP_KEY); localStorage.removeItem(NOTES_KEY); location.reload(); } };
pill.onclick = () => drawer.classList.toggle('open');
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') drawer.classList.remove('open'); });

// contextual chip next to the focused app field
document.addEventListener('focusin', (e) => {
  const el = e.target; if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) || root.contains(el) || (el.type && !['text', 'search', ''].includes(el.type) && el.tagName === 'INPUT')) return;
  lastField = el; const r = el.getBoundingClientRect(); const label = fieldLabel(el); const isPE = /^what$/i.test(label);
  chip.replaceChildren(...[isPE ? ['Review wording', 'reviewPrimaryEffect'] : el.tagName === 'TEXTAREA' ? ['Extract timeline', 'extractTimelineCandidates'] : ['Ask RCA Coach', 'reviewCauseStatement']].map(([l, k]) => { const b = $('button', { type: 'button', text: l }); b.onmousedown = (ev) => ev.preventDefault(); b.onclick = () => { tgt.value = el.value; target = k; drawer.classList.add('open'); ruleCard(); }; return b; }));
  chip.style.display = 'flex'; chip.style.left = Math.max(4, Math.min(r.left, innerWidth - 170)) + 'px'; chip.style.top = Math.max(4, r.top - 30) + 'px';
});
document.addEventListener('scroll', () => (chip.style.display = 'none'), true);
document.addEventListener('mousedown', (e) => { if (!chip.contains(e.target) && e.target !== lastField) chip.style.display = 'none'; });
renderStatus(); renderNotes(); const mount = () => document.documentElement.append(root); mount(); new MutationObserver(() => { if (!root.isConnected) mount(); }).observe(document.documentElement, { childList: true });

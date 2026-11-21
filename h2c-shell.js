function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Thin shell around the Grok Build app: one-click "New analysis" with confirm + undo,
// interactive lively 7-step Apollo RCA workflow hub, real-time color-coded validation,
// and local AI daemon bridge for low-resource hardware.

import { PROVIDER_PRESETS, LOCAL_PRESETS } from './provider-presets.js';
import { sessionStore, SESSION_CHANGED, listLegacyData, removeLegacyData, legacyRecoveryPlan } from './session-store.js';
import './app-build.js';

import { getBridgeConfig, saveBridgeConfig, testConfiguredConnection, pickInstalledQwen, installExternalCoach, isLoopback, executeLocalChat, stripModelThinking } from './local-ai-bridge.js?v=28';
import { COACH_STEPS, coachIsReady, coachReadyHint, buildStepPrompt, reviewStepEntries } from './coach-steps.js?v=2';
import { DEEPER_TASKS, runDeeperReview, briefForReview, presentFinding } from './coach-deeper.js?v=7';
import { AUDIT_KEY, AUDIT_SECTIONS, isCloudAuditMode, runCloudSectionAudit, saveCoachAudit, loadCoachAudit, clearCoachAudit, auditAsReview, visibleAudit, fingerprint, appendAuditPdf, auditMarkdown, exportableAudit, workflowAnchor, reportAnchor } from './coach-audit.js?v=1';

const FORBIDDEN_TAGS = new Set(['SCRIPT', 'OBJECT', 'EMBED', 'LINK', 'META', 'IFRAME', 'BASE', 'FRAME', 'FRAMESET', 'FORM', 'STYLE', 'TEMPLATE', 'MATH', 'FOREIGNOBJECT', 'ANIMATE', 'SET']);
const ALLOWED_TAGS = new Set([
  'DIV', 'SPAN', 'P', 'A', 'BUTTON', 'STRONG', 'EM', 'B', 'I', 'U', 'SMALL', 'SUP', 'SUB',
  'CODE', 'PRE', 'UL', 'OL', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BR', 'HR',
  'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'NAV', 'ASIDE', 'MAIN', 'DETAILS', 'SUMMARY',
  'LABEL', 'INPUT', 'SELECT', 'OPTION', 'OPTGROUP', 'DATALIST', 'TEXTAREA', 'FIELDSET', 'LEGEND',
  'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD',
  'SVG', 'G', 'PATH', 'CIRCLE', 'RECT', 'LINE', 'POLYLINE', 'POLYGON', 'ELLIPSE'
]);
const ALLOWED_ATTRS = new Set([
  'class', 'id', 'style', 'type', 'role', 'tabindex', 'href', 'target', 'rel', 'title',
  'value', 'placeholder', 'checked', 'disabled', 'selected', 'open', 'for', 'name', 'list',
  'rows', 'cols', 'min', 'max', 'step', 'autocomplete', 'autocapitalize', 'spellcheck', 'inputmode', 'readonly', 'hidden',
  'width', 'height', 'viewbox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap',
  'stroke-linejoin', 'd', 'cx', 'cy', 'r', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'points', 'rx', 'ry'
]);
const URL_ATTRS = new Set(['href', 'src', 'xlink:href', 'action', 'formaction', 'poster', 'data', 'background', 'srcset']);

function normalizedUrl(value) {
  let v = String(value ?? '')
    .replace(/&#(x[0-9a-f]+|\d+);?/gi, (_, n) => {
      const code = n[0] === 'x' || n[0] === 'X' ? parseInt(n.slice(1), 16) : parseInt(n, 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : '';
    })
    .replace(/&colon;/gi, ':')
    .replace(/&(tab|newline|nbsp);/gi, '');
  for (let i = 0; i < 2; i += 1) {
    try {
      const next = decodeURIComponent(v.replace(/\+/g, '%20'));
      if (next === v) break;
      v = next;
    } catch {
      break;
    }
  }
  return v.replace(/[\u0000-\u0020\u00a0]+/g, '').toLowerCase();
}

function blockedUrl(value) {
  const v = normalizedUrl(value);
  return v.startsWith('javascript:') || v.startsWith('vbscript:') || v.startsWith('data:');
}

function unsafeStyle(value) {
  const v = normalizedUrl(value);
  return v.includes('expression(') || v.includes('javascript:') || v.includes('vbscript:') || v.includes('url(') || v.includes('@import');
}

function setSafeHtml(el, html) {
  const doc = new DOMParser().parseFromString(String(html ?? ''), 'text/html');
  const drop = [];
  const visit = (node) => {
    if (!node || node.nodeType !== 1) return;
    const tag = node.tagName.toUpperCase();
    if (FORBIDDEN_TAGS.has(tag) || !ALLOWED_TAGS.has(tag)) {
      drop.push(node);
      return;
    }
    for (const attr of [...node.attributes]) {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on') || name === 'srcdoc') {
        node.removeAttribute(attr.name);
        continue;
      }
      if (!ALLOWED_ATTRS.has(name) && !name.startsWith('aria-') && !name.startsWith('data-')) {
        node.removeAttribute(attr.name);
        continue;
      }
      if (URL_ATTRS.has(name) && blockedUrl(attr.value)) {
        node.removeAttribute(attr.name);
        continue;
      }
      if (name === 'style' && unsafeStyle(attr.value)) {
        node.removeAttribute(attr.name);
      }
    }
    for (const child of [...node.children]) visit(child);
  };
  for (const child of [...doc.body.children]) visit(child);
  for (const node of drop) node.remove();
  el.replaceChildren(...doc.body.childNodes);
}

const KEYS = ['realitychart-intake-v1', 'realitychart-analysis-v1', 'realitychart-hypotheses-v1', 'realitychart-raw-notes-v1', AUDIT_KEY];
const BACKUP = 'h2c-last-cleared-v1';
let proceed = false;
let updating = false;

// Injected CSS for the 7-step Workflow Hub and Real-Time Color Coded Validation
const css = document.createElement('style');
css.textContent = `
main{min-width:0}main>div{min-width:0}main .grid{min-width:0}main .grid>*{min-width:0}#realitychart{min-width:0;max-width:100%}main{padding-bottom:4.5rem}@media (max-width:720px){table.h2c-cards thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}table.h2c-cards,table.h2c-cards tbody,table.h2c-cards tr,table.h2c-cards td{display:block;width:100%}table.h2c-cards tr{border:1px solid #d7deea;border-radius:8px;margin:0 0 12px;padding:8px 10px}table.h2c-cards td{border:0;padding:4px 0;white-space:normal}table.h2c-cards td[colspan]::before{content:none}table.h2c-ca td:nth-child(1)::before{content:"Action ID"}table.h2c-ca td:nth-child(2)::before{content:"Primary effect"}table.h2c-ca td:nth-child(3)::before{content:"Target cause"}table.h2c-ca td:nth-child(4)::before{content:"Corrective action"}table.h2c-ca td:nth-child(5)::before{content:"4-criteria"}table.h2c-ca td:nth-child(6)::before{content:"Responsible"}table.h2c-ca td:nth-child(7)::before{content:"Due"}table.h2c-ca td:nth-child(8)::before{content:"Cost / ROI"}table.h2c-ai td:nth-child(1)::before{content:"ID"}table.h2c-ai td:nth-child(2)::before{content:"Primary effect"}table.h2c-ai td:nth-child(3)::before{content:"Node"}table.h2c-ai td:nth-child(4)::before{content:"Gap"}table.h2c-ai td:nth-child(5)::before{content:"Owner"}table.h2c-ai td:nth-child(6)::before{content:"Due"}table.h2c-cards td::before{display:block;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#5c6b62}}
.h2c-new-prominent{background:linear-gradient(180deg,#f6dd7a,#c9a227)!important;color:#043d2e!important;border:2px solid #8c6a1a!important;font-weight:700!important}
.h2c-tools-menu{position:relative;display:inline-flex;align-items:center}
.h2c-tools-menu>summary{list-style:none;display:inline-flex;align-items:center;gap:6px;height:2.4rem;padding:0 12px;border-radius:8px;border:1px solid #d4c5a9;background:#fffdfa;color:#3e331c;font:600 13px system-ui,-apple-system,sans-serif;cursor:pointer;white-space:nowrap;transition:background .15s ease,border-color .15s ease}
.h2c-tools-menu>summary::-webkit-details-marker{display:none}
.h2c-tools-menu>summary:hover,.h2c-tools-menu[open]>summary{background:#f7f1e3;border-color:#c9a227;color:#043d2e}
.h2c-tools-menu>summary:focus-visible{outline:3px solid #0a5c45;outline-offset:2px}
.h2c-tools-popover{position:absolute;top:calc(100% + 6px);right:0;z-index:60;min-width:220px;display:flex;flex-direction:column;gap:6px;padding:8px;border-radius:10px;border:1px solid #c9a227;background:#fffdf8;box-shadow:0 12px 28px rgba(16,32,51,.16)}
.h2c-tools-popover>button{width:100%!important;justify-content:flex-start!important;text-align:left!important;height:auto!important;min-height:36px!important;padding:7px 10px!important;border-radius:7px!important;border:1px solid transparent!important;background:transparent!important;color:#102033!important;font-size:13px!important;font-weight:600!important;box-shadow:none!important}
.h2c-tools-popover>button:hover{background:#f4efe2!important;border-color:#d4c5a9!important;color:#043d2e!important}
@media (max-width:639px){.h2c-tools-popover{left:0;right:auto;min-width:min(240px,86vw)}}
.h2c-coach-hidden,.h2c-dup-coach-hidden{display:none!important}
.h2c-coach-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 8px;padding:4px;border-radius:10px;background:#f4efe2;border:1px solid #e2d6bc}
.h2c-coach-tab{border:1px solid transparent;background:transparent;color:#4a3d24;font:600 12.5px system-ui,-apple-system,sans-serif;padding:6px 12px;border-radius:7px;cursor:pointer;transition:all .15s ease}
.h2c-coach-tab:hover{background:#fffdf8;color:#043d2e}
.h2c-coach-tab.is-active{background:#043d2e;color:#f1d16b;border-color:#043d2e;box-shadow:0 1px 4px rgba(4,61,46,.18)}
.h2c-coach-tab:focus-visible{outline:3px solid #0a5c45;outline-offset:2px}
.h2c-ask-coach{margin:6px 0 10px!important;display:flex!important;flex-wrap:wrap!important;gap:8px!important;align-items:center!important}
.h2c-ask-coach-btn{min-height:34px!important;border:1px solid #c9a227!important;border-radius:999px!important;padding:5px 12px!important;background:#fffef8!important;color:#043d2e!important;font:600 12.5px system-ui,-apple-system,sans-serif!important;cursor:pointer;transition:all .15s ease}
.h2c-ask-coach-btn:hover{background:#043d2e!important;color:#f1d16b!important;border-color:#043d2e!important}
.h2c-ask-coach-btn:focus-visible{outline:3px solid #0a5c45;outline-offset:2px}
.h2c-coach-open-link{border:0;background:transparent;color:#047857;font:600 12px system-ui,-apple-system,sans-serif;text-decoration:underline;cursor:pointer;padding:4px 6px}
.h2c-coach-open-link:hover{color:#043d2e}
.h2c-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:18px;z-index:10000;background:#043d2e;color:#f1d16b;border:2px solid #c9a227;border-radius:8px;padding:10px 14px;display:flex;gap:12px;align-items:center;font:600 14px system-ui;box-shadow:0 4px 14px rgba(0,0,0,.4)}
.h2c-toast button{background:#f1d16b;color:#043d2e;border:0;border-radius:6px;padding:6px 12px;font-weight:700;cursor:pointer}.h2c-toast button:focus-visible{outline:3px solid #fff}
.h2c-browser-ai-dialog{position:fixed;right:16px;bottom:16px;left:auto;top:auto;margin:0;z-index:40;max-width:min(34rem,calc(100vw - 32px));max-height:min(70vh,32rem);overflow:auto;border:2px solid #c9a227;border-radius:12px;padding:0;background:#fffdf8;color:#1c1915;box-shadow:0 12px 40px rgba(0,0,0,.28);pointer-events:auto}
.h2c-browser-ai-dialog[hidden]{display:none}
.h2c-browser-ai-dialog h2{margin:0;padding:14px 16px;background:#043d2e;color:#f1d16b;font:700 16px system-ui}
.h2c-browser-ai-dialog .body{padding:14px 16px 16px;display:grid;gap:10px;font:14px/1.45 system-ui}
.h2c-browser-ai-dialog p{margin:0}
.h2c-browser-ai-dialog code{font-size:12px}
.h2c-browser-ai-dialog .row{display:flex;flex-wrap:wrap;gap:8px}
.h2c-browser-ai-dialog button{min-height:40px;border-radius:8px;padding:0 12px;font:600 13px system-ui;cursor:pointer}
.h2c-browser-ai-dialog .go{background:#043d2e;color:#f1d16b;border:1px solid #c9a227}
.h2c-browser-ai-dialog .stop{background:#fff;color:#043d2e;border:1px solid #c9a227}

/* Elegant, Eye-Friendly Methodology & Attribution Ribbon (Top) */
.h2c-top-ribbon {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: #fffdf9;
  border: 1px solid #e7ded0;
  border-left: 4px solid #c9a227;
  border-radius: 8px;
  padding: 6px 12px;
  margin-top: 6px;
  margin-bottom: 8px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 12px;
  color: #3e331c;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}
@media (max-width:639px){.h2c-top-ribbon{padding:6px 10px;gap:4px;font-size:11.5px;margin-top:4px;margin-bottom:6px}.h2c-top-ribbon-badge{display:none}}
.h2c-top-ribbon-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.h2c-top-ribbon-badge {
  background: #043d2e;
  color: #f1d16b;
  font-weight: 700;
  font-size: 10.5px;
  padding: 2px 7px;
  border-radius: 4px;
  letter-spacing: 0.02em;
}
.h2c-top-ribbon-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.h2c-top-ribbon-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #043d2e !important;
  font-weight: 700;
  text-decoration: underline !important;
  font-size: 12px;
  padding: 3px 6px;
  border-radius: 4px;
  transition: background 0.15s ease;
}
.h2c-top-ribbon-link:hover {
  background: #f0f7f3;
  color: #065f46 !important;
}
.h2c-top-ribbon-jump {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fbf7ee;
  border: 1px solid #c9a227;
  color: #634a12;
  font-weight: 700;
  font-size: 11.5px;
  padding: 3px 9px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.h2c-top-ribbon-jump:hover {
  background: #c9a227;
  color: #043d2e;
  transform: translateY(-1px);
}

/* Toolbar button for Legal & Trademarks */
.h2c-tb-legal {
  display: inline-flex;
  align-items: center;
  align-self: center;
  flex: none;
  height: 2.75rem;
  gap: 6px;
  background: #fffdfa;
  border: 1.5px solid #d4c5a9;
  color: #4a3d24;
  font: 700 13px system-ui, -apple-system, sans-serif;
  padding: 0 12px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}
.h2c-tb-legal svg { width: 16px; height: 16px; flex: none; }
.h2c-tb-legal:hover {
  background: #fbf7ee;
  border-color: #c9a227;
  color: #043d2e;
  transform: translateY(-1px);
}

/* Executive Bottom Legal Showcase & Safe Harbor */
.h2c-legal-showcase {
  margin-top: 3.5rem;
  margin-bottom: 2rem;
  background: #fffdf9;
  border: 1.5px solid #dcd3be;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(4, 61, 46, 0.05), 0 1px 4px rgba(0,0,0,0.02);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #2d3748;
  line-height: 1.55;
  overflow: hidden;
  transition: box-shadow 0.4s ease, border-color 0.4s ease;
}
.h2c-legal-showcase.h2c-pulse-focus {
  border-color: #c9a227;
  box-shadow: 0 0 0 4px rgba(201, 162, 39, 0.3), 0 8px 30px rgba(4, 61, 46, 0.12);
}
.h2c-legal-accent-bar {
  height: 5px;
  background: linear-gradient(90deg, #7f1d1d 0%, #c9a227 40%, #043d2e 100%);
}
.h2c-legal-showcase-inner {
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.h2c-legal-header-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1.5px solid #ece4d2;
}
.h2c-legal-header-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 800;
  color: #1a202c;
  letter-spacing: -0.01em;
}
.h2c-legal-pills-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.h2c-legal-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 5px;
  letter-spacing: 0.02em;
}
.h2c-legal-pill-burgundy { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
.h2c-legal-pill-gold { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
.h2c-legal-pill-green { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }

/* Dual Book Showcase Cards */
.h2c-books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
  margin-top: 8px;
}
.h2c-book-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fbf9f4;
  border: 1px solid #e7ded0;
  border-left: 4px solid #c9a227;
  border-radius: 8px;
  padding: 12px 14px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
.h2c-book-icon {
  font-size: 26px;
  line-height: 1;
}
.h2c-book-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 2px 0;
}
.h2c-book-pub {
  font-size: 11.5px;
  color: #6b7280;
  margin: 0;
}

/* Official Recommendation Section */
.h2c-official-promo-card {
  background: linear-gradient(180deg, #f0fdf4 0%, #e6f7ec 100%);
  border: 1.5px solid #86efac;
  border-radius: 10px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.h2c-official-promo-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.h2c-official-promo-title {
  font-size: 14px;
  font-weight: 800;
  color: #065f46;
}
.h2c-official-promo-desc {
  font-size: 13px;
  color: #166534;
  line-height: 1.5;
  margin: 0;
}
.h2c-official-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(180deg, #059669 0%, #047857 100%);
  color: #ffffff !important;
  font-weight: 800;
  font-size: 13.5px;
  padding: 10px 18px;
  border-radius: 8px;
  text-decoration: none !important;
  box-shadow: 0 3px 10px rgba(5, 150, 105, 0.25);
  transition: all 0.2s ease;
  width: fit-content;
}
.h2c-official-cta-btn:hover {
  background: linear-gradient(180deg, #10b981 0%, #059669 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.35);
}

/* Safe Harbor Card */
.h2c-legal-safeharbor-card {
  background: #f9f7f2;
  border: 1px solid #e5dfd3;
  border-radius: 8px;
  padding: 14px 16px;
  font-size: 12px;
  color: #4b5563;
  line-height: 1.55;
}
.h2c-legal-safeharbor-card strong {
  color: #1f2937;
}
.h2c-legal-safeharbor-card p {
  margin: 4px 0 8px 0;
}
.h2c-legal-safeharbor-card p:last-child {
  margin-bottom: 0;
}

/* Back to Top button */
.h2c-back-to-top-btn {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f3efe6;
  border: 1px solid #d5cbba;
  color: #4a5568;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.h2c-back-to-top-btn:hover {
  background: #c9a227;
  color: #043d2e;
}

/* 7-Step Interactive Workflow Hub */
.h2c-local-bridge-card {
  margin: 0 0 0 0 !important;
  background: linear-gradient(180deg, #fffdfa 0%, #fbf7ee 100%) !important;
  border: 2px solid #c9a227 !important;
  border-bottom: 0 !important;
  border-radius: 12px 12px 0 0 !important;
  box-shadow: none !important;
}
.h2c-local-bridge-card + .h2c-official-coach:has(+ .h2c-deeper) {
  border-bottom: 0 !important;
  border-radius: 0 !important;
  margin-bottom: 0 !important;
  box-shadow: none !important;
}
.h2c-official-coach + .h2c-deeper {
  margin: 0 0 1.5rem !important;
  padding: 0 18px 16px;
  border: 2px solid #c9a227;
  border-top: 0;
  border-radius: 0 0 12px 12px;
  background: linear-gradient(180deg, #fbf7ee 0%, #fffdfa 100%);
  box-shadow: 0 4px 18px rgba(4, 61, 46, 0.08), 0 1px 3px rgba(0,0,0,0.04);
}
.h2c-deeper button {
  min-height: 40px;
  border: 1px solid #d7c7a2;
  border-radius: 8px;
  padding: 6px 12px;
  background: #fff;
  color: #14261c;
  font: 600 13px/1.2 system-ui, sans-serif;
  cursor: pointer;
}
.h2c-deeper button:hover { border-color: #c9a227; }
.h2c-deeper button:disabled { opacity: 0.55; cursor: default; }
.h2c-local-bridge-card + .h2c-official-coach {
  margin-top: 0 !important;
  border-top: 0 !important;
  border-radius: 0 0 12px 12px !important;
}
.h2c-official-coach {
  margin: 0 0 1.5rem 0 !important;
  border: 2px solid #c9a227 !important;
  background: linear-gradient(180deg, #fffdfa 0%, #fbf7ee 100%) !important;
  border-radius: 12px !important;
  padding: 16px 18px !important;
  box-shadow: 0 4px 18px rgba(4, 61, 46, 0.08), 0 1px 3px rgba(0,0,0,0.04) !important;
}
.h2c-official-coach.h2c-coach-focus { outline: 3px solid #c9a227; outline-offset: 3px; }
.h2c-official-coach h2 {
  font: 700 15px/1.3 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  color: #14261c !important;
}
.h2c-review { display: grid; gap: 10px; margin-top: 4px; }
.h2c-review h3 { margin: 0; font: 700 14px/1.3 system-ui, sans-serif; color: #043d2e; }
.h2c-review-summary, .h2c-review-next, .h2c-review-note { margin: 0; }
.h2c-review-summary, .h2c-review-next { padding: 8px 10px; background: #fff; border-left: 4px solid #c9a227; border-radius: 4px; }
.h2c-review-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.h2c-review-list > li { margin: 0; padding: 8px 10px; background: #fff; border: 1px solid #e7ded0; border-radius: 6px; }
.h2c-review-kind { display: inline-block; margin: 0 8px 4px 0; padding: 1px 7px; border-radius: 999px; background: #043d2e; color: #f1d16b; font-size: 11px; font-weight: 700; letter-spacing: .02em; text-transform: capitalize; }
.h2c-review-list h4 { display: inline; margin: 0; font-size: 13px; }
.h2c-review-list ul { margin: 6px 0 0; padding-left: 1.15rem; }
.h2c-review-list li li { margin: 3px 0; }
.h2c-review-label { font-weight: 700; color: #043d2e; }
.h2c-review-ids { margin: 6px 0 0; font-size: 12px; color: #3d4a42; }
.h2c-review-note { font-size: 12px; color: #5c6e80; }
.h2c-audit-card, .h2c-audit-note { margin: 10px 0; border: 1px solid #e7ded0; border-left: 4px solid #c9a227; border-radius: 8px; background: #fffdf8; color: #14261c; }
.h2c-audit-card { padding: 0; }
.h2c-audit-card summary, .h2c-audit-note h3 { cursor: pointer; padding: 8px 10px; font: 700 13px/1.4 system-ui, sans-serif; }
.h2c-audit-body { padding: 0 10px 10px; display: grid; gap: 6px; }
.h2c-audit-card p, .h2c-audit-note p, .h2c-audit-card li { margin: 0; font: 13px/1.45 system-ui, sans-serif; }
.h2c-audit-badge { display: inline-block; margin-right: 6px; padding: 1px 7px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.h2c-audit-pass { background: #e8f6ee; color: #04693a; }
.h2c-audit-attention { background: #fbf3d5; color: #6a4b00; }
.h2c-audit-critical { background: #fde8e8; color: #9f1239; }
.h2c-audit-jump, .h2c-audit-card button { margin: 2px 4px 0 0; min-height: 32px; border: 1px solid #d7c7a2; border-radius: 6px; background: #fff; color: #14261c; font: 600 12px/1.2 system-ui, sans-serif; cursor: pointer; }
.h2c-audit-hit { outline: 3px solid #c9a227; outline-offset: 3px; }
.h2c-audit-stale { font-size: 12px; color: #9f1239; }
.h2c-audit-toggle { display: flex; align-items: center; gap: 6px; font: 12px/1.4 system-ui, sans-serif; color: #14261c; }
.h2c-key-steps { margin: 6px 0 6px 1.2rem; }
.h2c-key-steps li { margin: 2px 0; }
.h2c-key-links, .h2c-key-note { margin: 6px 0; }
.h2c-ai-steps a { color: #043d2e; font-weight: 700; }
.h2c-official-coach .h2c-local-bridge-card {
  margin-top: 12px !important;
  background: #fff !important;
  border: 1px solid #e7ded0 !important;
  border-left: 4px solid #c9a227 !important;
  border-radius: 8px !important;
  box-shadow: none !important;
}
.h2c-workflow-hub {
  margin-bottom: 1.5rem;
  border: 2px solid #c9a227;
  background: linear-gradient(180deg, #fffdfa 0%, #fbf7ee 100%);
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: 0 4px 18px rgba(4, 61, 46, 0.08), 0 1px 3px rgba(0,0,0,0.04);
  position: relative;
}
.h2c-workflow-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.h2c-workflow-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font: 700 15px/1.3 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #14261c;
}
.h2c-pulse-dot {
  position: relative;
  display: inline-flex;
  width: 10px;
  height: 10px;
}
.h2c-pulse-dot::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: #10b981;
  animation: h2c-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
  opacity: 0.75;
}
.h2c-pulse-dot::after {
  content: '';
  position: relative;
  display: inline-flex;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #059669;
}
@keyframes h2c-ping {
  75%, 100% {
    transform: scale(2.2);
    opacity: 0;
  }
}
.h2c-overall-pill {
  font: 700 12px/1.2 system-ui, sans-serif;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid;
  transition: all 0.3s ease;
}
.h2c-pill-high {
  background: #d1fae5;
  color: #065f46;
  border-color: #6ee7b7;
}
.h2c-pill-med {
  background: #fef3c7;
  color: #92400e;
  border-color: #fcd34d;
}
.h2c-pill-low {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fca5a5;
}
.h2c-progress-track {
  width: 100%;
  height: 10px;
  background: #e6d7a8;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 14px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.12);
}
.h2c-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #d97706 0%, #10b981 50%, #0d9488 100%);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}
.h2c-steps-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
@media (min-width: 640px) {
  .h2c-steps-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (min-width: 1100px) {
  .h2c-steps-grid {
    grid-template-columns: repeat(7, minmax(8.4rem, 1fr));
  }
}
.h2c-step-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 2px solid #e6d7a8;
  background: #ffffff;
  border-radius: 10px;
  padding: 10px 10px;
  text-align: left;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  user-select: none;
  position: relative;
  width: 100%;
  min-height: 115px;
  min-width: 0;
  overflow-wrap: anywhere;
  gap: 4px;
}
.h2c-step-card:hover {
  transform: translateY(-3px);
  border-color: #b8860b;
  box-shadow: 0 8px 18px rgba(4, 61, 46, 0.14);
  background: #fffdf8;
}
.h2c-step-card:active {
  transform: scale(0.97);
}
.h2c-step-card:focus-visible {
  outline: 2px solid #047857;
  outline-offset: 2px;
}
.h2c-step-card.is-ready {
  border-color: #059669;
  background: #f0fdf4;
  box-shadow: 0 2px 6px rgba(5, 150, 105, 0.08);
}
.h2c-step-card.is-ready:hover {
  border-color: #047857;
  box-shadow: 0 8px 20px rgba(5, 150, 105, 0.2);
}
.h2c-step-card.is-current {
  border-color: #c9a227;
  background: #fffdf4;
  box-shadow: 0 0 0 3px rgba(201,162,39,.22), 0 4px 14px rgba(16,32,51,.08);
}
.h2c-step-card.is-current .h2c-step-num {
  background: #c9a227;
  color: #102033;
  border-color: #8c6a1a;
}
.h2c-step-card.is-todo {
  background: #fffef9;
  border-color: #e6d7a8;
  opacity: .92;
}
.h2c-step-bot {
  margin-top: auto;
  padding-top: 5px;
  border-top: 1px dashed rgba(0,0,0,0.08);
}
.h2c-step-vid-btn:hover {
  background: #fee2e2 !important;
  border-color: #dc2626 !important;
  color: #991b1b !important;
  transform: translateY(-1px);
}
.h2c-step-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
  width: 100%;
}
.h2c-step-num {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font: 700 12px/1 monospace;
  background: #f4f1e6;
  color: #14261c;
  border: 1px solid #e6d7a8;
  transition: all 0.2s ease;
}
.h2c-step-card.is-ready .h2c-step-num {
  background: #059669;
  color: #ffffff;
  border-color: #047857;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}
.h2c-step-pill {
  font: 650 11px/1.3 system-ui, sans-serif;
  padding: 3px 7px;
  border-radius: 999px;
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
  max-width: none;
  text-align: right;
  flex: 1 1 auto;
}
.h2c-pill-stop {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}
.h2c-pill-warn {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}
.h2c-pill-ready {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}
.h2c-pill-neutral {
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}
.h2c-step-name {
  font: 700 13px/1.3 system-ui, sans-serif;
  color: #14261c;
  display: flex;
  align-items: center;
  gap: 4px;
}
.h2c-step-sub {
  font: 400 11px/1.2 system-ui, sans-serif;
  color: #5e6b5a;
  margin-top: 3px;
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
}

/* Color Coded Validation Badges */
.h2c-val-box {
  margin-top: 6px;
  font-family: system-ui, -apple-system, sans-serif;
  transition: all 0.2s ease;
}
.h2c-val-badge {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 12px;
  line-height: 1.4;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.h2c-val-stop {
  background: #fee2e2;
  border: 1.5px solid #f87171;
  color: #991b1b;
}
.h2c-val-stop strong {
  color: #b91c1c;
}
.h2c-val-violation {
  background: #fff1f2;
  border: 2px solid #e11d48;
  color: #881337;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 12px;
  border-radius: 8px;
}
.h2c-val-violation-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  color: #be123c;
}
.h2c-val-warn {
  background: #fef3c7;
  border: 1.5px solid #fbbf24;
  color: #92400e;
}
.h2c-val-warn strong {
  color: #b45309;
}
.h2c-val-ready {
  background: #d1fae5;
  border: 1.5px solid #34d399;
  color: #065f46;
}
.h2c-val-ready strong {
  color: #047857;
}

/* Dynamic Input Border Highlights */
input.h2c-input-stop {
  border-color: #ef4444 !important;
  background-color: #fef2f2 !important;
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.25) !important;
}
input.h2c-input-violation {
  border-color: #dc2626 !important;
  background-color: #fee2e2 !important;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.35) !important;
}
input.h2c-input-warn {
  border-color: #f59e0b !important;
  background-color: #fffbeb !important;
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.25) !important;
}
input.h2c-input-ready {
  border-color: #10b981 !important;
  background-color: #f0fdf4 !important;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.25) !important;
}
`;

const findBtn = () => [...document.querySelectorAll('button')].find((b) => /^\s*New analysis\s*$/.test(b.textContent));

// --- Lively 7 Steps Workflow Navigator ---
function getAppState() {
  if (!globalThis.h2cSessionReady) {
    return { pending: true, hasValidWhat: false, hasAnyWhat: false, hasBlame: false, wordsCounts: [], timelineCount: 0, timelineReady: false, chartReady: false, evidenceCount: 0, evidenceReady: false, testReady: false, solutionsCount: 0, solutionsReady: false, scheduleReady: false, downloadReady: false, missing: [], trackReady: false, completedCount: 0, pct: 0 };
  }
  const whatInputs = [...document.querySelectorAll('input[placeholder="Oil Released"]')];
  const primaryEffectWhats = whatInputs.map(i => (i.value || '').trim());
  const wordsCounts = primaryEffectWhats.map(t => t.split(/\s+/).filter(Boolean).length);

  const blameRegex = /\b(who|why|blame|fault|mistake|careless|carelessness|operator error|human error|negligence|negligent|john doe)\b/i;
  const hasBlame = primaryEffectWhats.some(t => blameRegex.test(t));
  const hasValidWhat = wordsCounts.some(c => c >= 2 && c <= 4) && !hasBlame;
  const hasAnyWhat = primaryEffectWhats.some(t => t.length > 0);

  // Timeline events count
  const timelineInputs = [...document.querySelectorAll('input[placeholder="Seal temperature rose"], input[placeholder="Event"]')];
  const timelineCount = timelineInputs.filter((desc) => {
    const time = desc.parentElement?.querySelector('input[placeholder="14:32"]');
    return (desc.value || '').trim() || (time?.value || '').trim();
  }).length;
  const timelineReady = timelineCount > 0;

  // Chart active
  const realityChart = document.getElementById('realitychart');
  const chartReady = Boolean(realityChart && realityChart.offsetHeight > 0);

  // Evidence items count
  const evidenceTextareas = [...document.querySelectorAll('textarea[placeholder*="observed, read, or calculated"]')];
  const evidenceCount = evidenceTextareas.length;
  const evidenceReady = evidenceCount > 0;

  // Test
  const testReady = chartReady;

  // Solutions count
  const solutionsCount = document.querySelectorAll('#solution-matrix table.h2c-ca tbody tr').length;
  const solutionsReady = Boolean(document.getElementById('solution-matrix'));

  // Track / Organization
  const leadInvestigator = [...document.querySelectorAll('label')].find(l => l.textContent.includes('Lead investigator'))?.querySelector('input');
  const trackReady = Boolean(leadInvestigator && (leadInvestigator.value || '').trim().length > 0);

  const gapEl = document.getElementById('h2c-report-gap');
  const missing = (gapEl?.dataset.missing || '').split('|').map((part) => part.trim()).filter(Boolean);
  const scheduleReady = Boolean(gapEl) && missing.length === 0;
  const downloadReady = scheduleReady;

  const readySteps = [hasValidWhat, timelineReady, evidenceReady, chartReady, solutionsReady, scheduleReady, downloadReady];
  const completedCount = readySteps.filter(Boolean).length;
  const pct = Math.round((completedCount / 7) * 100);

  return {
    hasValidWhat,
    hasAnyWhat,
    hasBlame,
    wordsCounts,
    timelineCount,
    timelineReady,
    chartReady,
    evidenceCount,
    evidenceReady,
    testReady,
    solutionsCount,
    solutionsReady,
    scheduleReady,
    downloadReady,
    missing,
    trackReady,
    completedCount,
    pct
  };
}

function scrollToLegal() {
  const el = document.getElementById('legal-disclosure');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('h2c-pulse-focus');
    setTimeout(() => el.classList.remove('h2c-pulse-focus'), 1800);
  }
}

function updateTopAttributionRibbon() {
  // Remove legacy red disclosure if present
  const old = document.querySelector('.h2c-header-disclosure');
  if (old) old.remove();

  const sub = document.querySelector('main');
  if (sub && !document.querySelector('.h2c-top-ribbon')) {
    const ribbon = document.createElement('div');
    ribbon.className = 'no-print h2c-top-ribbon';
    setSafeHtml(ribbon, `
      <div class="h2c-top-ribbon-text">
        <span class="h2c-top-ribbon-badge">⚖️ METHODOLOGY ATTRIBUTION</span>
        <span>Independent study tool based on Apollo RCA&trade; principles created by <strong>Dean L. Gano</strong>.</span>
      </div>
      <div class="h2c-top-ribbon-actions">
        <a href="https://realitycharting.com/home/" target="_blank" rel="noopener noreferrer" class="h2c-top-ribbon-link">
          Official Software: realitycharting.com &rarr;
        </a>
        <button type="button" class="h2c-top-ribbon-jump" id="h2c-ribbon-jump-btn">
          📜 Full Legal Notice &amp; Safe Harbor &darr;
        </button>
      </div>
    `);
    const btn = ribbon.querySelector('#h2c-ribbon-jump-btn');
    if (btn) btn.onclick = scrollToLegal;
    sub.before(ribbon);
  }
  placeChrome();

  // Also ensure toolbar button is mounted
  mountLegalToolbarBtn();
}

function mountLegalToolbarBtn() {
  if (document.querySelector('.h2c-tb-legal')) return;
  const anchor = [...document.querySelectorAll('button')].find((b) => /^\s*New analysis\s*$/.test(b.textContent));
  if (!anchor?.parentNode) return;
    const tb = document.createElement('button');
    tb.className = 'no-print h2c-tb-legal';
    tb.type = 'button';
    tb.setAttribute('aria-label', 'View Legal disclosure and trademark attribution');
    setSafeHtml(tb, `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c9a227" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
      <span>⚖️ Legal &amp; Trademarks</span>
    `);
    tb.onclick = scrollToLegal;
    const tools = document.querySelector('.h2c-hero-tools');
    if (tools) {
      tb.classList.add('h2c-cta-tool');
      tools.append(tb);
    } else {
      anchor.parentNode.insertBefore(tb, anchor);
    }
}

function ensureBottomLegalShowcase() {
  // Remove any legacy banner that was placed above the workflow hub
  const oldTop = document.querySelector('.h2c-legal-banner');
  if (oldTop) oldTop.remove();

  const main = document.querySelector('main');
  if (!main) return;

  let showcase = document.getElementById('legal-disclosure');
  if (!showcase) {
    showcase = document.createElement('section');
    showcase.id = 'legal-disclosure';
    showcase.className = 'no-print h2c-legal-showcase';
    showcase.setAttribute('role', 'region');
    showcase.setAttribute('aria-label', 'Intellectual Property, Trademark Attribution and Legal Safe Harbor');
    main.appendChild(showcase);
  }

  if (showcase && !showcase.dataset.rendered) {
    showcase.dataset.rendered = 'true';
    setSafeHtml(showcase, `
      <div class="h2c-legal-accent-bar"></div>
      <div class="h2c-legal-showcase-inner">
        <div class="h2c-legal-header-row">
          <div class="h2c-legal-header-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a227" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>Intellectual Property, Trademark Attribution &amp; Legal Safe Harbor</span>
          </div>
          <div class="h2c-legal-pills-row">
            <span class="h2c-legal-pill h2c-legal-pill-burgundy">NOMINATIVE FAIR USE (15 U.S.C. &sect; 1125)</span>
            <span class="h2c-legal-pill h2c-legal-pill-gold">DEAN L. GANO INTELLECTUAL PROPERTY</span>
            <span class="h2c-legal-pill h2c-legal-pill-green">INDEPENDENT OPEN SOURCE (MIT)</span>
          </div>
        </div>

        <div>
          <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 800; color: #1a202c;">
            ATTRIBUTION TO ORIGINAL AUTHOR &amp; FOUNDATIONAL LITERATURE
          </h4>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #4a5568; line-height: 1.5;">
            The principles of Apollo Root Cause Analysis, the Reality Tree causal logic diagramming method, and the RealityCharting methodology were conceived, developed, and authored by renowned reliability engineer and educator <strong>Dean L. Gano</strong>. This web study application is directly inspired by his seminal books:
          </p>
          <div class="h2c-books-grid">
            <div class="h2c-book-card">
              <span class="h2c-book-icon">📘</span>
              <div>
                <p class="h2c-book-title">Apollo Root Cause Analysis: A New Way of Thinking</p>
                <p class="h2c-book-pub">Apollonian Publications &bull; Foundational text establishing the principles of cause-and-effect and elimination of the root cause myth.</p>
              </div>
            </div>
            <div class="h2c-book-card">
              <span class="h2c-book-icon">📙</span>
              <div>
                <p class="h2c-book-title">RealityCharting: Seven Steps to Effective Problem-Solving</p>
                <p class="h2c-book-pub">Apollonian Publications &bull; Comprehensive methodology guide for facilitators, investigators, and organizations.</p>
              </div>
            </div>
          </div>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #718096; line-height: 1.45; background: #f7fafc; border: 1px solid #edf2f7; padding: 8px 12px; border-radius: 6px;">
            <strong>Trademark Notice:</strong> <em>"Apollo Root Cause Analysis"</em>, <em>"Apollo RCA"</em>, <em>"Reality Tree"</em>, and <em>"RealityCharting&reg;"</em> are registered trademarks and intellectual property of <strong>Dean L. Gano</strong> and <strong>Apollonian Publications, LLC</strong>. All rights are fully and strictly reserved by their respective trademark owners.
          </p>
        </div>

        <div class="h2c-official-promo-card">
          <div class="h2c-official-promo-head">
            <span style="font-size: 24px; line-height: 1;">📢</span>
            <div>
              <div class="h2c-official-promo-title">RECOMMENDATION: USE THE OFFICIAL CERTIFIED SOFTWARE &amp; TRAINING</div>
              <p class="h2c-official-promo-desc">
                If you want to master genuine certified Apollo RCA, obtain professional facilitator certification, or deploy official enterprise-grade software instead of this experimental vibe coded study tool, please visit the official Dean L. Gano website:
              </p>
            </div>
          </div>
          <a href="https://realitycharting.com/home/" target="_blank" rel="noopener noreferrer" class="h2c-official-cta-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            <span>Go to Official RealityCharting&reg; Software &amp; Website (realitycharting.com) &rarr;</span>
          </a>
        </div>

        <div class="h2c-legal-safeharbor-card">
          <p style="font-weight: 800; font-size: 12px; color: #2d3748; margin-bottom: 4px;">
            LEGAL NON-AFFILIATION, SAFE HARBOR &amp; DISCLAIMER OF CLAIMS:
          </p>
          <p>
            <strong>Independent Community Prototype:</strong> This web application (<em>H2C Root Cause Analyst</em>) is an independent, non-commercial open-source experimental prototype ("vibe coded work") developed by Engr. Harold Henry G. Cabanilla (h2c_Creates / h2c-DataSci) strictly for educational, personal research, and community demonstration purposes under the MIT License. It is <strong>NOT</strong> affiliated with, endorsed by, sponsored by, authorized by, or in any way officially connected with <strong>Dean L. Gano</strong>, <strong>Apollonian Publications, LLC</strong>, or <strong>RealityCharting.com</strong>.
          </p>
          <p>
            <strong>Non-Infringement &amp; Nominative Fair Use:</strong> No proprietary source code, copyrighted illustrations, or certified training materials from Apollonian Publications, LLC have been used, reverse-engineered, or reproduced. All methodology names and trademarks are referenced strictly under <strong>Nominative Fair Use (15 U.S.C. &sect; 1125 / Lanham Act)</strong> for descriptive identification.
          </p>
          <p>
            <strong>Disclaimer of Warranties:</strong> The software is provided "AS IS", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement. In no event shall the authors be liable for any claim, damages, or other liability arising from the use of this tool.
          </p>
        </div>

        <button type="button" class="h2c-back-to-top-btn" id="h2c-legal-back-top-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          <span>↑ Back to Top of Analysis</span>
        </button>
      </div>
    `);

    const backBtn = showcase.querySelector('#h2c-legal-back-top-btn');
    if (backBtn) {
      backBtn.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }
  }
  if (showcase.parentElement !== main || main.lastElementChild !== showcase) main.appendChild(showcase);
}

function updateStepsHub() {
  const existingOl = document.querySelector('ol.grid-cols-2, ol.sm\\:grid-cols-7');
  let hub = document.querySelector('.h2c-workflow-hub');

  // The step list is a React child of <main>. Moving it into the hub makes the
  // next coach mount call insertBefore on a node that is no longer a child.
  if (existingOl && hub && hub.contains(existingOl)) hub.after(existingOl);

  if (!hub && existingOl && existingOl.parentNode) {
    hub = document.createElement('div');
    hub.className = 'no-print h2c-workflow-hub';
    existingOl.before(hub);
  }

  if (existingOl) existingOl.hidden = true;
  if (!hub) return;

  if (!globalThis.h2cSessionReady) {
    if (hub.dataset.sig !== 'pending') {
      hub.dataset.sig = 'pending';
      if (!hub.querySelector('.h2c-step-card')) {
        const wait = document.createElement('p');
        wait.className = 'h2c-session-pending';
        wait.style.cssText = 'margin:8px 0;font:13px/1.4 system-ui;color:#5e6b5a';
        wait.textContent = 'Restoring session…';
        hub.replaceChildren(wait);
      }
    }
    return;
  }

  const st = getAppState();

  const scrollStep = (id, alt, heading) => {
    const el = document.getElementById(id) || (alt && document.getElementById(alt)) || (heading && [...document.querySelectorAll('h2, h3')].find((node) => heading.test(node.textContent || '')));
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const scrollGenerate = () => {
    const genBtn = [...document.querySelectorAll('button')].find((b) => /generate realitychart|generate chart/i.test(b.textContent || ''));
    genBtn?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const steps = [
    { num: 1, name: 'Define', sub: 'Primary effects', status: st.hasValidWhat ? '✓ Ready' : (st.hasAnyWhat ? '⚡ In Progress' : '✕ 0 words'), pillClass: st.hasValidWhat ? 'h2c-pill-ready' : (st.hasAnyWhat ? 'h2c-pill-warn' : 'h2c-pill-stop'), isReady: st.hasValidWhat, action: () => scrollStep('h2c-problem', null, /problem definition/i) },
    { num: 2, name: 'Timeline', sub: 'Filled events', status: st.timelineReady ? `✓ ${st.timelineCount} ${st.timelineCount === 1 ? 'event' : 'events'}` : '● 0 events', pillClass: st.timelineReady ? 'h2c-pill-ready' : 'h2c-pill-neutral', isReady: st.timelineReady, action: () => scrollStep('h2c-timeline', 'section-timeline', /timeline/i) },
    { num: 3, name: 'Evidence', sub: 'Hypothesized causes', status: st.evidenceReady ? `✓ ${st.evidenceCount} ${st.evidenceCount === 1 ? 'item' : 'items'}` : '● Before the chart', pillClass: st.evidenceReady ? 'h2c-pill-ready' : 'h2c-pill-neutral', isReady: st.evidenceReady, action: () => scrollStep('h2c-evidence', 'section-evidence', /evidence/i) },
    { num: 4, name: 'Chart', sub: 'RealityChart', status: st.chartReady ? '✓ Chart active' : '● Not built', pillClass: st.chartReady ? 'h2c-pill-ready' : 'h2c-pill-neutral', isReady: st.chartReady, action: () => { if (st.chartReady) document.getElementById('realitychart')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); else scrollGenerate(); } },
    { num: 5, name: 'Solutions', sub: 'Blank matrix', status: st.solutionsReady ? '✓ Matrix open' : (st.chartReady ? '● Generate the matrix' : '● After the chart'), pillClass: st.solutionsReady ? 'h2c-pill-ready' : 'h2c-pill-neutral', isReady: st.solutionsReady, action: () => scrollStep('h2c-solutions', 'solution-matrix', /solution/i) },
    { num: 6, name: 'Schedule', sub: 'Actions and dates', status: !st.chartReady ? '● After the chart' : st.scheduleReady ? '✓ Schedule filled' : `● ${st.missing[0] || 'Fill the schedule'}`, pillClass: st.scheduleReady ? 'h2c-pill-ready' : 'h2c-pill-neutral', isReady: st.scheduleReady, action: () => scrollStep('solution-matrix', 'h2c-organization', /corrective|organization/i) },
    { num: 7, name: 'Download', sub: 'PDF or ZIP', status: st.downloadReady ? '✓ Ready' : (st.missing[0] ? `● ${st.missing[0]}` : '● Not ready'), pillClass: st.downloadReady ? 'h2c-pill-ready' : 'h2c-pill-neutral', isReady: st.downloadReady, action: () => scrollStep('h2c-download', 'realitychart', /download/i) }
  ];
  const overallClass = st.pct >= 70 ? 'h2c-pill-high' : st.pct > 0 ? 'h2c-pill-med' : 'h2c-pill-low';

  const sig = steps.map((s) => `${s.num}:${s.status}:${s.isReady ? 1 : 0}`).join('|');
  if (hub.dataset.sig === sig && hub.querySelector('.h2c-step-card') && !hub.querySelector('.h2c-step-vid-btn')) return;
  hub.dataset.sig = sig;

  setSafeHtml(hub, `
    <div class="h2c-workflow-header">
      <div class="h2c-workflow-title">
        <span class="h2c-pulse-dot"></span>
        <span>7-Step Apollo RCA Workflow Navigator</span>
        <span class="h2c-overall-pill ${overallClass}">${st.completedCount} / 7 Steps Ready (${st.pct}%)</span>
      </div>
      <div style="font-size: 12px; color: #5e6b5a; display: flex; align-items: center; gap: 6px;">
        <span style="display:inline-block; width:6px; height:6px; border-radius:999px; background:#b8860b;"></span>
        Interactive: Click any card to navigate & inspect
      </div>
    </div>
    <div class="h2c-progress-track">
      <div class="h2c-progress-fill" style="width: ${Math.max(6, st.pct)}%;"></div>
    </div>
    <div class="h2c-steps-grid"></div>
  `);

  const grid = hub.querySelector('.h2c-steps-grid');
  for (const s of steps) {
    const card = document.createElement('div');
    const firstTodo = steps.findIndex((step) => !step.isReady);
    card.className = `h2c-step-card ${s.isReady ? 'is-ready is-done' : (s.num === steps[firstTodo]?.num ? 'is-current' : 'is-todo')}`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Step ${s.num}: ${s.name} (${s.status})`);
    setSafeHtml(card, `
      <div class="h2c-step-top">
        <span class="h2c-step-num">${s.num}</span>
        <span class="h2c-step-pill ${s.pillClass}">${s.status}</span>
      </div>
      <div class="h2c-step-name">${s.name}</div>
      <div class="h2c-step-sub">${s.sub}</div>
    `);
    card.onclick = () => s.action();
    card.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        s.action();
      }
    };
    grid.append(card);
  }
}

// --- Real-Time Input Validation with Dynamic Color Codes ---
function updateColorCodedValidation() {
  const whatInputs = [...document.querySelectorAll('input[placeholder="Oil Released"]')];
  const blameRegex = /\b(who|why|blame|fault|mistake|careless|carelessness|operator error|human error|negligence|negligent|john doe)\b/i;

  for (const input of whatInputs) {
    const val = (input.value || '').trim();
    const words = val.split(/\s+/).filter(Boolean);
    const count = words.length;
    const blameMatch = val.match(blameRegex);

    // Remove any previous custom feedback box
    let box = input.parentElement.querySelector('.h2c-val-box');
    if (!box) {
      box = document.createElement('div');
      box.className = 'h2c-val-box';
      input.parentElement.append(box);
    }

    // Hide default static "0 words" text to avoid confusing duplication
    const defaultSpans = [...input.parentElement.querySelectorAll('span')].filter(s => !s.classList.contains('h2c-val-badge') && /^\s*\d+\s+words?/i.test(s.textContent));
    for (const ds of defaultSpans) ds.style.display = 'none';

    // Clear class list highlights
    input.classList.remove('h2c-input-stop', 'h2c-input-violation', 'h2c-input-warn', 'h2c-input-ready');

    const touched = input.dataset.h2cTouched === '1' || document.activeElement === input;
    if (count === 0 && !touched) {
      box.replaceChildren();
    } else if (count === 0) {
      input.classList.add('h2c-input-stop');
      setSafeHtml(box, `
        <div class="h2c-val-badge h2c-val-stop">
          <strong>✕ Not Acceptable (0 words)</strong>
          <span>— Required: Enter 2–4 word noun-verb effect (e.g. "Oil Released", "Pump Tripped")</span>
        </div>
      `);
    } else if (blameMatch) {
      input.classList.add('h2c-input-violation');
      setSafeHtml(box, `
        <div class="h2c-val-badge h2c-val-violation">
          <div class="h2c-val-violation-title">
            <span style="font-size: 14px;">⛔</span>
            <strong>Principle P01/P05 Violation (Not Acceptable)</strong>
          </div>
          <div style="font-size: 11.5px; line-height: 1.35;">
            Blame / Who / Why detected: <strong>"${escapeHtml(blameMatch[0])}"</strong>. Apollo RCA forbids blaming individuals or asking "why". Describe the physical effect only.
          </div>
        </div>
      `);
    } else if (count >= 2 && count <= 4) {
      input.classList.add('h2c-input-ready');
      setSafeHtml(box, `
        <div class="h2c-val-badge h2c-val-ready">
          <strong>✓ Acceptable (${count} words)</strong>
          <span>— Valid noun-verb primary effect statement. Ready for reality charting!</span>
        </div>
      `);
    } else if (count === 1) {
      input.classList.add('h2c-input-warn');
      setSafeHtml(box, `
        <div class="h2c-val-badge h2c-val-warn">
          <strong>⚠ Incomplete (1 word)</strong>
          <span>— A primary effect requires both a noun and a verb (e.g. "Oil Released")</span>
        </div>
      `);
    } else {
      input.classList.add('h2c-input-warn');
      setSafeHtml(box, `
        <div class="h2c-val-badge h2c-val-warn">
          <strong>⚠ Too Wordy (${count} words)</strong>
          <span>— Keep to 2–4 words. Only the first 4 content words will be charted.</span>
        </div>
      `);
    }
  }

  // Also validate Where inputs
  const whereInputs = [...document.querySelectorAll('label')].filter(l => l.querySelector('span')?.textContent === 'Where').map(l => l.querySelector('input')).filter(Boolean);
  for (const input of whereInputs) {
    const val = (input.value || '').trim();
    let box = input.parentElement.querySelector('.h2c-where-val');
    if (!box) {
      box = document.createElement('div');
      box.className = 'h2c-where-val h2c-val-box';
      input.parentElement.append(box);
    }
    input.classList.remove('h2c-input-ready', 'h2c-input-warn');
    const touched = input.dataset.h2cTouched === '1' || document.activeElement === input;
    if (val.length > 0) {
      input.classList.add('h2c-input-ready');
      setSafeHtml(box, `<div class="h2c-val-badge h2c-val-ready" style="padding: 3px 8px; font-size: 11px;"><strong>✓ Location specified</strong></div>`);
    } else if (!touched) {
      box.replaceChildren();
    } else {
      setSafeHtml(box, `<div class="h2c-val-badge h2c-val-warn" style="padding: 3px 8px; font-size: 11px;"><span>⚠ Location required (facility, unit, equipment)</span></div>`);
    }
  }
}

function placeOfficialCoach() {
  document.getElementById('h2c-coach-workbench')?.remove();
  const coach = document.querySelector('section[aria-label="RCA coach"]');
  if (!coach) return;
  coach.classList.add('h2c-official-coach');
}

function focusOfficialCoach() {
  placeOfficialCoach();
  const coach = document.querySelector('section[aria-label="RCA coach"]');
  if (!coach) return;
  coach.scrollIntoView({ behavior: 'smooth', block: 'start' });
  coach.classList.add('h2c-coach-focus');
  setTimeout(() => coach.classList.remove('h2c-coach-focus'), 1600);
}

function addReviewPoint(list, point) {
  const item = document.createElement('li');
  if (point.label) {
    const label = document.createElement('span');
    label.className = 'h2c-review-label';
    label.textContent = point.label + ':';
    item.append(label, document.createTextNode(' ' + point.text));
  } else item.textContent = point.text;
  list.append(item);
}

function renderReview(review, root) {
  root.replaceChildren();
  root.classList.add('h2c-review');
  const heading = document.createElement('h3');
  heading.textContent = 'Review';
  const summary = document.createElement('p');
  summary.className = 'h2c-review-summary';
  summary.textContent = review.summary;
  root.append(heading, summary);
  if (review.findings.length) {
    const list = document.createElement('ol');
    list.className = 'h2c-review-list';
    for (const finding of review.findings) {
      const item = document.createElement('li');
      const kind = document.createElement('span');
      kind.className = 'h2c-review-kind';
      kind.textContent = finding.kind || 'note';
      item.append(kind);
      const presented = presentFinding(finding.text);
      if (presented.title) {
        const title = document.createElement('h4');
        title.textContent = presented.title;
        item.append(title);
      }
      const points = document.createElement('ul');
      for (const point of presented.points) addReviewPoint(points, point);
      if (points.childNodes.length) item.append(points);
      if (finding.evidenceIds.length) {
        const ids = document.createElement('p');
        ids.className = 'h2c-review-ids';
        ids.textContent = 'Evidence: ' + finding.evidenceIds.join(', ');
        item.append(ids);
      }
      list.append(item);
    }
    root.append(list);
  }
  if (review.nextStep) {
    const next = document.createElement('p');
    next.className = 'h2c-review-next';
    const label = document.createElement('span');
    label.className = 'h2c-review-label';
    label.textContent = 'Next:';
    next.append(label, document.createTextNode(' ' + review.nextStep));
    root.append(next);
  }
  const caution = document.createElement('p');
  caution.className = 'h2c-review-note';
  caution.textContent = 'This is not a finding. Check the evidence before you accept anything.';
  root.append(caution);
}

function statusClass(status) {
  if (status === 'pass') return 'h2c-audit-pass';
  if (status === 'critical') return 'h2c-audit-critical';
  return 'h2c-audit-attention';
}

function fillAuditBody(body, audit, section, interactive) {
  const badge = document.createElement('span');
  badge.className = `h2c-audit-badge ${statusClass(section.status)}`;
  badge.textContent = section.statusLabel;
  const title = document.createElement('p');
  title.append(badge, document.createTextNode(section.title));
  body.append(title);
  if (audit.stale) {
    const stale = document.createElement('p');
    stale.className = 'h2c-audit-stale';
    stale.textContent = 'Chart modified since this audit. Run Audit full report again before relying on it.';
    body.append(stale);
    if (interactive) {
      const again = document.createElement('button');
      again.type = 'button';
      again.textContent = 'Audit again';
      again.addEventListener('click', () => {
        const button = [...document.querySelectorAll('.h2c-review-btn')].find((item) => item.textContent === 'Audit full report');
        button?.click();
      });
      body.append(again);
    }
  }
  const list = document.createElement('ul');
  for (const finding of section.findings) {
    const item = document.createElement('li');
    item.textContent = finding.refs.length ? `${finding.text} (${finding.refs.join(', ')})` : finding.text;
    list.append(item);
  }
  if (list.childNodes.length) body.append(list);
}

function jumpToRef(ref) {
  const wanted = String(ref || '').toLowerCase();
  if (!wanted) return;
  const marked = document.querySelector(`[data-pe="${CSS.escape(ref)}"], [id="${CSS.escape(ref)}"]`);
  const textHit = marked || [...document.querySelectorAll('#realitychart text, svg text, h2, h3, p, li')].find((node) => String(node.textContent || '').toLowerCase().includes(wanted));
  if (!textHit) return;
  textHit.classList.add('h2c-audit-hit');
  setTimeout(() => textHit.classList.remove('h2c-audit-hit'), 2000);
  textHit.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function auditCard(audit, key) {
  const section = audit.sections[key];
  const card = document.createElement('details');
  card.className = 'h2c-audit-card no-print';
  card.open = section.status !== 'pass' || !!audit.stale;
  const summary = document.createElement('summary');
  summary.textContent = `RCA Coach API Audit — ${section.title}`;
  const body = document.createElement('div');
  body.className = 'h2c-audit-body';
  fillAuditBody(body, audit, section, true);
  if (key === 'causalRelationships') {
    for (const [id, note] of Object.entries(audit.nodeAnnotations || {})) {
      const jump = document.createElement('button');
      jump.type = 'button';
      jump.textContent = `${note.statusLabel}: ${id}`;
      jump.addEventListener('click', () => jumpToRef(id));
      body.append(jump);
    }
  }
  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.textContent = 'Dismiss';
  dismiss.addEventListener('click', () => {
    const current = loadCoachAudit();
    if (!current) return;
    current.dismissed = { ...(current.dismissed || {}), [key]: true };
    saveCoachAudit(current);
    paintCoachAudit.token = '';
    paintCoachAudit();
  });
  body.append(dismiss);
  card.append(summary, body);
  return card;
}

function paintCoachAudit() {
  const cfg = getBridgeConfig();
  const audit = visibleAudit(loadCoachAudit(), cfg, fingerprint(briefForReview('audit')));
  const token = audit ? JSON.stringify([audit.timestamp, !!audit.stale, audit.includeInReport !== false, audit.dismissed || {}]) : '';
  const article = document.querySelector('article.print-sheet');
  const download = [...document.querySelectorAll('button')].some((button) => /Download report/.test(button.textContent || ''));
  const expectedCards = !audit ? 0 : AUDIT_SECTIONS.filter(([key]) => !(audit.dismissed && audit.dismissed[key])).length;
  const ready = !audit
    ? !document.querySelector('.h2c-audit-card, .h2c-audit-note, .h2c-audit-toggle')
    : document.querySelectorAll('.h2c-audit-card').length >= expectedCards
      && (!article || audit.includeInReport === false || !!article.querySelector('.h2c-audit-note'))
      && (!download || !!document.querySelector('.h2c-audit-toggle'));
  if (paintCoachAudit.token === token && ready) return;
  paintCoachAudit.token = token;
  document.querySelectorAll('.h2c-audit-card, .h2c-audit-note, .h2c-audit-toggle').forEach((node) => node.remove());
  if (!audit) return;
  const placed = new Set();
  for (const heading of document.querySelectorAll('h2, h3')) {
    if (heading.closest('article.print-sheet') || heading.closest('.h2c-deeper') || heading.closest('.h2c-audit-card')) continue;
    const key = workflowAnchor(heading.textContent);
    if (!key || placed.has(key) || (audit.dismissed && audit.dismissed[key])) continue;
    placed.add(key);
    heading.insertAdjacentElement('afterend', auditCard(audit, key));
  }
  const hub = document.querySelector('.h2c-workflow-hub');
  if (hub) {
    for (const [key] of AUDIT_SECTIONS) {
      if (placed.has(key) || (audit.dismissed && audit.dismissed[key])) continue;
      hub.append(auditCard(audit, key));
    }
  }
  if (article && audit.includeInReport !== false) {
    const noted = new Set();
    for (const block of article.querySelectorAll('header, section')) {
      const key = reportAnchor(block.querySelector('h2, h3')?.textContent || '');
      if (!key || noted.has(key)) continue;
      noted.add(key);
      const note = document.createElement('aside');
      note.className = 'h2c-audit-note';
      const title = document.createElement('h3');
      title.textContent = 'RCA Coach API Audit Notes';
      const body = document.createElement('div');
      body.className = 'h2c-audit-body';
      fillAuditBody(body, audit, audit.sections[key], false);
      note.append(title, body);
      block.append(note);
    }
    const summary = document.createElement('section');
    summary.className = 'h2c-audit-note';
    const title = document.createElement('h3');
    title.textContent = 'RCA Coach API Audit Summary';
    const body = document.createElement('div');
    body.className = 'h2c-audit-body';
    const overall = document.createElement('p');
    overall.textContent = `${audit.overall.statusLabel}. ${audit.overall.summary}`;
    body.append(overall);
    if (audit.stale) {
      const stale = document.createElement('p');
      stale.className = 'h2c-audit-stale';
      stale.textContent = 'Chart modified since this audit. Run Audit full report again before relying on it.';
      body.append(stale);
    }
    for (const step of audit.overall.nextSteps || []) {
      const line = document.createElement('p');
      line.textContent = `Next: ${step}`;
      body.append(line);
    }
    summary.append(title, body);
    article.append(summary);
  }
  const downloadButton = [...document.querySelectorAll('button')].find((button) => /Download report/.test(button.textContent || ''));
  if (downloadButton && downloadButton.parentElement) {
    const toggle = document.createElement('label');
    toggle.className = 'h2c-audit-toggle no-print';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = audit.includeInReport !== false;
    box.addEventListener('change', () => {
      const current = loadCoachAudit();
      if (!current) return;
      current.includeInReport = box.checked;
      saveCoachAudit(current);
      paintCoachAudit();
    });
    toggle.append(box, document.createTextNode(' Include RCA Coach API Audit in Report'));
    downloadButton.parentElement.before(toggle);
  }
}

function placeCoachReviews(coachSection) {
  const deeper = document.querySelector('.h2c-deeper');
  if (coachSection && deeper && deeper.previousElementSibling !== coachSection) coachSection.after(deeper);
}

function ensureLocalBridgeUI() {
  const coachSection = document.querySelector('section[aria-label="RCA coach"]');
  if (!coachSection) return;
  let bridge = document.querySelector('.h2c-local-bridge-card');
  if (bridge) {
    if (bridge.nextElementSibling !== coachSection) coachSection.before(bridge);
    placeCoachReviews(coachSection);
    return;
  }
  const cfg = getBridgeConfig();
  bridge = document.createElement('div');
  bridge.className = 'no-print h2c-local-bridge-card';
  bridge.style.cssText = 'margin:12px 0;background:#fffdf8;border:1px solid #e7ded0;border-left:4px solid #c9a227;border-radius:8px;padding:14px;font:13px/1.5 system-ui;color:#1a202c';
  setSafeHtml(bridge, `
    <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><strong>Connection</strong><span class="h2c-bridge-status-pill" role="status">Not connected</span></div>
    <p style="margin:6px 0 12px">Choose how AI helps. Your investigation stays under your control; suggestions need your review.</p>
    <div class="h2c-ai-controls" style="display:flex;gap:12px;flex-wrap:wrap;align-items:end">
      <label>1. AI path<br><select class="h2c-ai-mode"><option value="local">Local AI — on this device</option><option value="free">Free cloud — your own key</option><option value="paid">Paid cloud — your own key</option></select></label>
      <label class="h2c-ai-preset-label">2. Provider<br><select class="h2c-ai-preset"></select></label>
      <label>Model<br><select class="h2c-ai-model-choice" aria-label="Choose model"></select><input class="h2c-bridge-model" list="h2c-bridge-models" autocomplete="off" spellcheck="false" aria-label="Model ID" placeholder="Enter model ID"></label>
      <datalist id="h2c-bridge-models"></datalist>
      <label class="h2c-ai-local-runtime-label">2. Local runtime<br><select class="h2c-ai-local-runtime"></select></label>
      <label class="h2c-bridge-key-label">3. Your API key<br><input type="password" class="h2c-bridge-key" autocomplete="off" spellcheck="false" autocapitalize="off" placeholder="Paste key for this session"></label>
    </div>
    <label class="h2c-ai-remember" style="display:block;margin:8px 0"><input type="checkbox" class="h2c-ai-remember-key"> Remember key on this device (off by default — saved in browser localStorage, which browser extensions can read; leave off on shared computers)</label>
    <p class="h2c-ai-steps" style="margin:10px 0"></p>
    <details class="h2c-ai-advanced"><summary>Connection settings</summary><label>Server / API base URL<br><input class="h2c-bridge-endpoint" type="url" spellcheck="false" style="max-width:100%;width:360px"></label>
    <div class="h2c-ai-custom-fields" hidden>
      <label>Provider name<br><input class="h2c-bridge-provider-name" spellcheck="false" placeholder="My provider"></label>
      <label>API style<br><select class="h2c-bridge-api-style"><option value="openai">OpenAI-compatible</option><option value="anthropic">Anthropic-style</option><option value="gemini">Gemini-style</option></select></label>
      <label>Extra headers (optional, one Name: value per line)<br><textarea class="h2c-bridge-extra-headers" rows="3" spellcheck="false" placeholder="X-Custom: value"></textarea></label>
    </div>
    <p class="h2c-ai-local-help">Default: http://127.0.0.1:11434 for Ollama, or http://127.0.0.1:1234/v1 for LM Studio. Test connection lists installed models. No model folder is needed. If the runtime is stopped, start the installed app, then retry. A website cannot start programs or inspect folders. Browser local-network permission or origin settings may be needed; do not disable browser security.</p></details>
    <label class="h2c-ai-consent" style="display:block;margin:10px 0"><input type="checkbox" class="h2c-ai-allow"> I authorize sending selected investigation context to this provider. I have checked its privacy and billing settings.</label>
    <p class="h2c-ai-risk" style="font-size:12px;margin:8px 0"></p>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="h2c-bridge-test-btn">Test connection</button><button type="button" class="h2c-ai-forget">Disconnect &amp; clear key</button></div>
    <div class="h2c-bridge-feedback" role="status" aria-live="polite" style="margin-top:8px"></div>
    <details style="margin-top:10px;font-size:12px"><summary>Privacy, accuracy &amp; saving your work</summary><p>Cloud providers process the context you send under their own policies. Absolute confidentiality, zero retention across every system, uninterrupted availability and correct AI advice cannot be guaranteed. Verify evidence and causal logic; AI is not a verified finding or a replacement for qualified judgment. Use Local AI or Standard Mode for information you cannot share.</p><p>Cases and keys are kept in this tab's memory. Reloading or closing it loses unsaved work. Download your report or ZIP package before leaving. Your browser controls the download folder; enable “Ask where to save” for a folder prompt. Downloaded copies may remain in device backups or synced folders. Local runtimes may keep their own logs.</p><p>No shared API key, proxy or Cloudflare account is used. Some tasks may make a second AI validation call and consume additional provider quota. Cancellation may not stop work already processed by a provider.</p></details>
  `);
  coachSection.before(bridge);
  for (const el of bridge.querySelectorAll('input:not([type="checkbox"]), select, button')) el.style.cssText += ';min-height:38px;border:1px solid #cbd5e1;border-radius:5px;padding:6px 9px;max-width:100%;background:#fff;color:#1a202c';
  const deeper = document.createElement('div');
  deeper.className = 'no-print h2c-deeper';
  const deeperNote = document.createElement('p');
  deeperNote.style.margin = '0 0 8px';
  deeperNote.textContent = 'Longer reviews use the connected model once. On a Free or Paid API, Audit full report also checks each step and can be included in the report. Local AI keeps a single review. Nothing is written into the chart.';
  const deeperRow = document.createElement('div');
  deeperRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
  const deeperOut = document.createElement('div');
  deeperOut.className = 'h2c-deeper-out';
  deeperOut.setAttribute('role', 'status');
  deeperOut.style.marginTop = '8px';
  for (const task of DEEPER_TASKS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'h2c-review-btn';
    button.textContent = task.label;
    button.addEventListener('click', async () => {
      deeperRow.querySelectorAll('button').forEach((item) => { item.disabled = true; });
      deeperOut.textContent = 'Reviewing. Reasoning is not shown.';
      try {
        const cfg = getBridgeConfig();
        if (task.id === 'audit' && isCloudAuditMode(cfg)) {
          const brief = briefForReview(task.id);
          const audit = await runCloudSectionAudit(brief);
          saveCoachAudit(audit);
          renderReview(auditAsReview(audit), deeperOut);
          paintCoachAudit();
        } else {
          const review = await runDeeperReview(task.id, briefForReview(task.id));
          renderReview(review, deeperOut);
        }
      } catch (error) {
        deeperOut.textContent = error && error.message ? error.message : 'The review failed. Nothing was changed.';
      } finally {
        deeperRow.querySelectorAll('button').forEach((item) => { item.disabled = false; });
      }
    });
    deeperRow.append(button);
  }
  deeper.append(deeperNote, deeperRow, deeperOut);
  coachSection.after(deeper);
  const $ = (q) => bridge.querySelector(q);
  const mode = $('.h2c-ai-mode'), preset = $('.h2c-ai-preset'), model = $('.h2c-bridge-model');
  const choice = $('.h2c-ai-model-choice');
  const key = $('.h2c-bridge-key'), endpoint = $('.h2c-bridge-endpoint'), consent = $('.h2c-ai-allow');
  const remember = $('.h2c-ai-remember-key'), localRuntime = $('.h2c-ai-local-runtime'), providerName = $('.h2c-bridge-provider-name'), apiStyle = $('.h2c-bridge-api-style'), extraHeaders = $('.h2c-bridge-extra-headers');
  const feedback = $('.h2c-bridge-feedback'), pill = $('.h2c-bridge-status-pill'), test = $('.h2c-bridge-test-btn');
  let revision = 0;
  const presets = () => Array.isArray(PROVIDER_PRESETS) ? PROVIDER_PRESETS : Object.values(PROVIDER_PRESETS);
  const currentPreset = () => presets().find((p) => p.id === preset.value);
  const resetStatus = () => { revision++; pill.textContent = 'Not connected'; feedback.textContent = ''; globalThis.h2cExternalAbort?.(); };
  const save = () => {
    const local = mode.value === 'local';
    const custom = !local && preset.value === 'custom';
    const runtime = local ? (localRuntime.value || 'ollama') : '';
    saveBridgeConfig({
      provider: local ? runtime : (custom ? 'custom' : (currentPreset()?.apiStyle === 'gemini' ? 'google' : currentPreset()?.apiStyle === 'anthropic' ? 'anthropic' : 'openai')),
      mode: mode.value,
      preset: local ? runtime : preset.value,
      endpoint: endpoint.value.trim(),
      model: model.value.trim(),
      apiKey: (local || (custom && isLoopback(endpoint.value.trim()) && !key.value.trim())) ? '' : key.value.trim(),
      cloudConsent: !local && consent.checked,
      rememberKey: !local && remember.checked === true,
      apiStyle: custom ? (apiStyle.value || 'openai') : (currentPreset()?.apiStyle || ''),
      extraHeaders: custom ? extraHeaders.value : {},
      providerName: custom ? providerName.value.trim() : '',
      numPredict: local ? 384 : 1536,
      timeoutMs: local ? 90000 : 60000,
      enabled: true
    });
  };
  const models = (values) => {
    const list = $('#h2c-bridge-models'); list.replaceChildren(); choice.replaceChildren();
    for (const value of values) { const name = typeof value === 'string' ? value : value.id; const label = typeof value === 'string' ? value : (value.label || value.id); const o = document.createElement('option'); o.value = name; list.append(o); const c = document.createElement('option'); c.value = name; c.textContent = label; choice.append(c); }
    choice.hidden = !values.length; model.hidden = values.length > 0 && preset.value !== 'custom';
    if (values.length && [...choice.options].some((o) => o.value === model.value)) choice.value = model.value;
  };
  const applyPreset = (restore = false) => {
    const local = mode.value === 'local', p = currentPreset();
    key.value = restore ? cfg.apiKey || '' : ''; consent.checked = restore && cfg.cloudConsent === true;
    remember.checked = restore && cfg.rememberKey === true;
    $('.h2c-ai-preset-label').hidden = local; $('.h2c-bridge-key-label').hidden = local; $('.h2c-ai-consent').hidden = local;
    $('.h2c-ai-remember').hidden = local; $('.h2c-ai-local-runtime-label').hidden = !local; $('.h2c-ai-local-help').hidden = !local;
    const runtime = LOCAL_PRESETS.find((item) => item.id === (restore ? cfg.preset || cfg.provider : localRuntime.value)) || LOCAL_PRESETS[0];
    if (local && !restore) localRuntime.value = runtime.id;
    endpoint.value = local ? (restore && isLoopback(cfg.endpoint || '') ? cfg.endpoint : (runtime?.endpoint || 'http://127.0.0.1:11434')) : (restore && preset.value === 'custom' ? cfg.endpoint : p?.endpoint || '');
    endpoint.readOnly = !local && preset.value !== 'custom';
    const customBox = $('.h2c-ai-custom-fields');
    if (customBox) {
      customBox.hidden = local || preset.value !== 'custom';
      if (!local && preset.value === 'custom') {
        providerName.value = restore ? (cfg.providerName || '') : providerName.value;
        apiStyle.value = restore ? (cfg.apiStyle || 'openai') : (apiStyle.value || 'openai');
        extraHeaders.value = restore && cfg.extraHeaders && typeof cfg.extraHeaders === 'object' && !Array.isArray(cfg.extraHeaders)
          ? Object.entries(cfg.extraHeaders).map(([k, v]) => `${k}: ${v}`).join('\n')
          : (restore ? '' : extraHeaders.value);
      }
    }
    model.value = restore ? cfg.model : local ? (runtime?.model || 'qwen3:2b') : (p?.models?.[0]?.id || p?.models?.[0] || '');
    models(local ? [] : p?.models || []);
    choice.value = model.value;
    const steps = $('.h2c-ai-steps'); steps.replaceChildren();
    const externalLink = (href, text) => { const link = document.createElement('a'); link.href = href; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = text; return link; };
    if (local) steps.textContent = 'Start Ollama, then Test connection to find your installed models. Use Enable assistant in the Coach when connected.';
    else if (mode.value === 'free') {
      const title = document.createElement('strong');
      title.textContent = 'Set up your own free key';
      const list = document.createElement('ol');
      list.className = 'h2c-key-steps';
      for (const line of ['Open one provider below and create a key in your own account. This app does not include a key.', 'Choose that same provider here, paste the key, and pick a listed model.', 'Check the authorization box, then Test connection. The key stays in this tab only.']) {
        const item = document.createElement('li');
        item.textContent = line;
        list.append(item);
      }
      const links = document.createElement('p');
      links.className = 'h2c-key-links';
      presets().filter((item) => item.free && item.keyUrl).forEach((item, index) => {
        if (index) links.append(document.createTextNode(' · '));
        links.append(externalLink(item.keyUrl, `${item.label.replace(/\s+\(.*\)$/, '')} — create a key ↗`));
      });
      steps.append(title, list, links);
      if (p?.setup) {
        const note = document.createElement('p');
        note.className = 'h2c-key-note';
        note.append(document.createTextNode(p.setup + ' '), externalLink(p.privacyUrl || p.keyUrl, 'Privacy policy ↗'));
        steps.append(note);
      }
    } else {
      steps.append(document.createTextNode('Create a key with your provider, paste it above, review the notice, then Test connection. '));
      if (p?.keyUrl) steps.append(externalLink(p.keyUrl, 'Get your key ↗'));
      if (p?.privacyUrl) steps.append(externalLink(p.privacyUrl, ' · Privacy policy ↗'));
      if (p?.setup) { const note = document.createElement('p'); note.className = 'h2c-key-note'; note.textContent = p.setup; steps.append(note); }
    }
    $('.h2c-ai-risk').textContent = local ? 'Local mode stays on loopback. A folder path does not start or import a model.' : mode.value === 'free' ? 'Free models use your provider account and its quota. Confirm billing is disabled or capped. Availability and provider retention settings can change. No automatic paid fallback. OpenRouter may route to different underlying free providers.' : 'Your provider may charge you. The app cannot guarantee the final cost or verify account billing settings. Only use a provider you trust.';
    resetStatus(); save();
  };
  const applyMode = (restore = false) => {
    preset.replaceChildren();
    for (const p of presets().filter((p) => p.id === 'custom' || (mode.value === 'free' ? p.free : !p.free))) { const o = document.createElement('option'); o.value = p.id; o.textContent = p.label; preset.append(o); }
    if (restore && [...preset.options].some((o) => o.value === cfg.preset)) preset.value = cfg.preset;
    localRuntime.replaceChildren();
    for (const item of LOCAL_PRESETS) { const o = document.createElement('option'); o.value = item.id; o.textContent = item.label; localRuntime.append(o); }
    if (restore && [...localRuntime.options].some((o) => o.value === (cfg.preset || cfg.provider))) localRuntime.value = cfg.preset || cfg.provider;
    applyPreset(restore);
  };
  mode.value = cfg.mode || (cfg.provider === 'openai' ? 'paid' : 'local');
  mode.addEventListener('change', () => applyMode()); preset.addEventListener('change', () => applyPreset());
  localRuntime.addEventListener('change', () => applyPreset());
  choice.addEventListener('change', () => { model.value = choice.value; resetStatus(); save(); });
  endpoint.addEventListener('input', () => { key.value = ''; consent.checked = false; remember.checked = false; resetStatus(); save(); });
  for (const el of [model, key, consent, remember, providerName, apiStyle, extraHeaders]) el.addEventListener('input', () => { resetStatus(); save(); });
  $('.h2c-ai-forget').onclick = () => { key.value = ''; consent.checked = false; remember.checked = false; saveBridgeConfig({ enabled: false, apiKey: '', cloudConsent: false, rememberKey: false }); resetStatus(); feedback.textContent = 'Disconnected. Key cleared from this session and from this device. Standard Mode still works.'; };
  test.onclick = async () => {
    save(); const ticket = ++revision;
    const loopback = isLoopback(endpoint.value.trim());
    if (mode.value !== 'local' && !loopback && (!key.value.trim() || !consent.checked)) { feedback.textContent = 'Paste your key and authorize this provider first. No request was sent.'; return; }
    test.disabled = true; test.textContent = 'Checking…'; pill.textContent = 'Checking…';
    try {
      const status = await testConfiguredConnection(getBridgeConfig());
      if (ticket !== revision || !bridge.isConnected) return;
      pill.textContent = status.online ? 'Connected' : 'Not connected';
      feedback.textContent = status.message || status.error || 'Connection failed.';
      if (status.online) {
        const names = status.models || [];
        if (mode.value === 'local') {
          models(names);
          if (names.length && !names.includes(model.value)) model.value = pickInstalledQwen(names) || names[0];
          choice.value = model.value;
          feedback.textContent += names.length ? ' Choose an installed model, then Enable assistant in the Coach.' : ' No installed models found. Install a model in Ollama before enabling the assistant.';
        }
        if (mode.value === 'paid') {
          models(names);
          if (!model.value.trim() && names.length) { const blank = document.createElement('option'); blank.value = ''; blank.textContent = 'Choose a model'; choice.prepend(blank); choice.value = ''; }
          if (!model.value.trim() && names.length) feedback.textContent += ' Choose a model from the Model field before enabling the assistant.';
        }
        save();
      } else feedback.textContent += ' Check the key, address and browser permissions. If the provider blocks browser access, choose another provider; no proxy is used.';
    } catch { if (ticket === revision) { pill.textContent = 'Not connected'; feedback.textContent = 'Connection failed. Check your provider settings and browser access.'; } }
    finally { test.disabled = false; test.textContent = 'Test connection'; }
  };
  applyMode(true);
}

function placeChrome() {
  const main = document.querySelector('main');
  if (!main) return;
  const ribbon = document.querySelector('.h2c-top-ribbon');
  const foot = document.querySelector('.h2c-devfoot');
  if (ribbon && ribbon.nextElementSibling !== main) main.before(ribbon);
  if (foot && main.nextElementSibling !== foot) main.after(foot);
}

function ensureEmptyHints() {
  document.querySelectorAll('.h2c-empty-chart-hint').forEach((node) => {
    if (document.getElementById('realitychart')) node.remove();
  });
  const gen = [...document.querySelectorAll('button')].find((b) => /Generate chart/i.test(b.textContent || ''));
  if (gen && !document.getElementById('realitychart') && !document.querySelector('.h2c-empty-chart-hint')) {
    const hint = document.createElement('p');
    hint.className = 'no-print h2c-empty-hint h2c-empty-chart-hint';
    hint.textContent = 'Fill the primary effect, where, date and a timeline event, then generate the RealityChart. A colour legend appears with the chart.';
    gen.insertAdjacentElement('afterend', hint);
  }
  const ev = document.getElementById('h2c-evidence');
  if (ev) {
    ev.querySelectorAll('.h2c-empty-ev-hint').forEach((node) => node.remove());
    if (!ev.querySelector('.h2c-ev-row')) {
      const hint = document.createElement('p');
      hint.className = 'no-print h2c-empty-hint h2c-empty-ev-hint';
      hint.textContent = 'No observations yet. Add what you saw, read or calculated, and the hypothesized cause it supports.';
      ev.append(hint);
    }
  }
}

function ensureBuildLabel() {
  if (document.querySelector('.h2c-build-label')) return;
  const host = document.querySelector('#legal-disclosure') || document.querySelector('main') || document.body;
  const label = document.createElement('p');
  label.className = 'no-print h2c-build-label';
  label.textContent = 'App build ' + (globalThis.H2C_APP_BUILD || '');
  host.append(label);
}

function readStoredCase() {
  try {
    const intake = JSON.parse(sessionStore.getItem('realitychart-intake-v1') || 'null');
    const analysis = JSON.parse(sessionStore.getItem('realitychart-analysis-v1') || 'null');
    return { intake, analysis };
  } catch {
    return { intake: null, analysis: null };
  }
}

function ensureStepCoachButtons() {
  for (const step of COACH_STEPS) {
    const byId = step.section && document.getElementById(step.section);
    const byHeading = step.heading && [...document.querySelectorAll('h2, h3')].find((node) => step.heading.test((node.textContent || '').trim()));
    const section = byId || byHeading;
    if (!section) continue;
    if (byId && byId.id === 'h2c-download' && !byHeading) continue;
    const heading = byHeading || section.querySelector('h2, h3') || section;
    if (heading.nextElementSibling && heading.nextElementSibling.classList.contains('h2c-ask-coach')) continue;
    if (section.querySelector && section.querySelector('.h2c-ask-coach')) continue;
    const wrap = document.createElement('div');
    wrap.className = 'no-print h2c-ask-coach';
    wrap.style.cssText = 'margin:8px 0;display:flex;flex-wrap:wrap;gap:8px;align-items:center';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'h2c-ask-coach-btn';
    btn.textContent = 'Ask coach about this step';
    btn.style.cssText = 'min-height:38px;border:1px solid #cbd5e1;border-radius:5px;padding:6px 9px;background:#fff;color:#1a202c;cursor:pointer';
    const out = document.createElement('p');
    out.className = 'h2c-ask-coach-out';
    out.setAttribute('role', 'status');
    out.style.cssText = 'margin:0;font:12px/1.45 system-ui;color:#3f4a43;max-width:40rem';
    btn.addEventListener('click', async () => {
      const cfg = getBridgeConfig();
      const { intake, analysis } = readStoredCase();
      const notes = reviewStepEntries(step.id, intake || {}, analysis);
      if (!coachIsReady(cfg)) {
        out.textContent = coachReadyHint() + (notes.length ? ' Quick checks: ' + notes.join(' ') : '');
        return;
      }
      out.textContent = 'Asking the coach…';
      btn.disabled = true;
      try {
        const prompt = buildStepPrompt(step.id, intake || {}, analysis);
        const raw = await executeLocalChat([{ role: 'user', content: prompt }], cfg);
        const text = typeof stripModelThinking === 'function' ? stripModelThinking(raw) : raw;
        out.textContent = String(text || notes.join(' ') || 'The coach returned no text.');
        focusOfficialCoach();
      } catch (error) {
        out.textContent = (error && error.message) || 'The coach request failed. Nothing was changed.';
      } finally {
        btn.disabled = false;
      }
    });
    wrap.append(btn, out);
    heading.after(wrap);
  }
}

function ensureBrowserAiButton() {
  if (document.querySelector('.h2c-browser-ai-btn')) return;
  const anchor = [...document.querySelectorAll('header button')].find((b) => /RCA Coach/i.test(b.textContent));
  if (!anchor) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = anchor.className + ' h2c-browser-ai-btn';
  btn.textContent = 'Browser AI';
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    import('./browser-ai.js?v=26').then((mod) => mod.openBrowserAiDialog()).catch(() => {});
  });
  anchor.insertAdjacentElement('afterend', btn);
}

function enforceChartColors() {
  document.querySelectorAll('svg text').forEach((label) => {
    const word = (label.textContent || '').trim();
    if (word !== 'STOP' && word !== '?') return;
    const shape = label.previousElementSibling;
    if (!shape || shape.classList?.contains('fill-surface')) return;
    const tag = (shape.tagName || '').toLowerCase();
    if (tag !== 'polygon' && tag !== 'rect' && tag !== 'circle') return;
    const stop = word === 'STOP';
    const color = stop ? '#d32f2f' : '#fbc02d';
    const ink = stop ? '#ffffff' : '#000000';
    shape.setAttribute('fill', color);
    shape.setAttribute('stroke', color);
    if (shape.style) {
      shape.style.fill = color;
      shape.style.stroke = color;
    }
    shape.classList?.remove('fill-action', 'fill-warn', 'stroke-action', 'stroke-warn', 'fill-stop', 'fill-unknown');
    shape.classList?.add(stop ? 'fill-stop' : 'fill-unknown');
    label.setAttribute('fill', ink);
    if (label.style) label.style.fill = ink;
    label.classList?.remove('fill-ink', 'fill-on-solid', 'fill-unknown-ink');
    label.classList?.add(stop ? 'fill-on-solid' : 'fill-unknown-ink');
  });
}

function whenHydrated(run) {
  const start = Date.now();
  const tick = () => {
    const tsr = globalThis.$_TSR;
    if (!globalThis.h2cAppHydrated) {
      setTimeout(tick, 40);
      return;
    }
    run();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick, { once: true });
  else tick();
}

function organizeHeroTools() {
  const tools = document.querySelector('.h2c-hero-tools');
  if (!tools) return;
  let menu = tools.querySelector('details.h2c-tools-menu');
  if (!menu) {
    menu = document.createElement('details');
    menu.className = 'no-print h2c-tools-menu';
    const summary = document.createElement('summary');
    summary.setAttribute('aria-label', 'More workspace tools');
    summary.textContent = 'Tools ▾';
    const pop = document.createElement('div');
    pop.className = 'h2c-tools-popover';
    menu.append(summary, pop);
    tools.append(menu);
    document.addEventListener('click', (ev) => {
      if (menu.open && !menu.contains(ev.target)) menu.open = false;
    });
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && menu.open) menu.open = false;
    });
  }
  const pop = menu.querySelector('.h2c-tools-popover');
  if (!pop) return;
  const secondaryRe = /^(QA \/ Stress Test Suite|Load full test case|Browser AI|.*Legal & Trademarks)$/i;
  for (const btn of [...tools.children]) {
    if (btn.tagName !== 'BUTTON') continue;
    const label = (btn.textContent || '').trim().replace(/\s+/g, ' ');
    if (secondaryRe.test(label) || btn.classList.contains('h2c-tb-legal') || btn.classList.contains('h2c-browser-ai-btn')) {
      pop.append(btn);
      if (!btn.dataset.h2cMenuClose) {
        btn.dataset.h2cMenuClose = '1';
        btn.addEventListener('click', () => { menu.open = false; });
      }
    }
  }
}

function dedupeStepCoachButtons() {
  const dupRe = /^RCA Coach\s*[—-]\s*check (this step|the timeline and evidence|the chart|the solutions)$/i;
  for (const btn of document.querySelectorAll('main button')) {
    const label = (btn.textContent || '').trim();
    if (!dupRe.test(label)) continue;
    const section = btn.closest('section') || btn.parentElement?.parentElement;
    if (section && (section.querySelector('.h2c-ask-coach') || document.querySelector('.h2c-ask-coach'))) {
      btn.classList.add('h2c-dup-coach-hidden');
      btn.setAttribute('aria-hidden', 'true');
      btn.tabIndex = -1;
    }
  }
}

const COACH_TASK_GROUPS = [
  { id: 'wording', label: 'Wording & Timeline', tasks: ['Review wording', 'Suggest rewrite', 'Extract timeline', 'Ask RCA Coach'] },
  { id: 'evidence', label: 'Evidence & Logic', tasks: ['Check evidence gap', 'Clarifying questions', 'Hypothesis branches', 'Review solution alignment'] },
  { id: 'narrative', label: 'Narrative & Summary', tasks: ['Summarize', 'Draft narrative'] },
  { id: 'integrity', label: 'Integrity Audit', tasks: ['Validate analysis integrity', 'Review narrative integrity', 'Detect contradictions', 'Detect unsupported claims'] },
  { id: 'all', label: 'All (14)', tasks: null },
];

function enhanceCoachPanelTabs() {
  const coach = document.querySelector('[aria-label="RCA coach"]');
  if (!coach) return;
  const reviewBtn = [...coach.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === 'Review wording');
  if (!reviewBtn || !reviewBtn.parentElement) return;
  const grid = reviewBtn.parentElement;
  let bar = coach.querySelector('.h2c-coach-tabs');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'no-print h2c-coach-tabs';
    bar.setAttribute('role', 'tablist');
    bar.setAttribute('aria-label', 'RCA Coach task categories');
    bar.dataset.activeGroup = 'wording';
    for (const grp of COACH_TASK_GROUPS) {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'h2c-coach-tab' + (grp.id === 'wording' ? ' is-active' : '');
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', grp.id === 'wording' ? 'true' : 'false');
      tab.dataset.group = grp.id;
      tab.textContent = grp.label;
      tab.addEventListener('click', () => {
        bar.dataset.activeGroup = grp.id;
        for (const t of bar.querySelectorAll('.h2c-coach-tab')) {
          const active = t.dataset.group === grp.id;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', active ? 'true' : 'false');
        }
        applyCoachGroupFilter(grid, grp.id);
      });
      bar.append(tab);
    }
    grid.before(bar);
  }
  applyCoachGroupFilter(grid, bar.dataset.activeGroup || 'wording');
}

function applyCoachGroupFilter(grid, groupId) {
  const grp = COACH_TASK_GROUPS.find((g) => g.id === groupId);
  const allowed = grp && grp.tasks ? new Set(grp.tasks) : null;
  for (const btn of grid.querySelectorAll('button')) {
    const label = (btn.textContent || '').trim();
    const show = !allowed || allowed.has(label);
    btn.classList.toggle('h2c-coach-hidden', !show);
  }
}

function enhanceChartToolbar() {
  const bar = document.querySelector('.h2c-chart-toolbar');
  if (!bar) return;
  let menu = bar.querySelector('details.h2c-chart-export');
  if (!menu) {
    menu = document.createElement('details');
    menu.className = 'no-print h2c-chart-export';
    const summary = document.createElement('summary');
    summary.setAttribute('aria-label', 'Export RealityChart');
    summary.textContent = 'Export ▾';
    const pop = document.createElement('div');
    pop.className = 'h2c-chart-export-pop';
    menu.append(summary, pop);
    bar.append(menu);
    document.addEventListener('click', (ev) => {
      if (menu.open && !menu.contains(ev.target)) menu.open = false;
    });
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && menu.open) menu.open = false;
    });
  }
  const pop = menu.querySelector('.h2c-chart-export-pop');
  if (!pop) return;
  const exportRe = /^(PNG|SVG|JSON)$/i;
  for (const btn of [...bar.children]) {
    if (btn.tagName !== 'BUTTON') continue;
    const label = (btn.textContent || '').trim().replace(/\s+/g, ' ');
    if (exportRe.test(label)) {
      pop.append(btn);
      if (!btn.dataset.h2cExportClose) {
        btn.dataset.h2cExportClose = '1';
        btn.addEventListener('click', () => { menu.open = false; });
      }
    }
  }
}

let focusModeOn = false;
let focusStepIndex = 0;

function applyStepFocusState() {
  const sections = [...document.querySelectorAll('main > div.grid > section, main section#realitychart')].filter((s) => !s.matches('[aria-label="RCA coach"], #legal-disclosure'));
  if (!focusModeOn) {
    for (const sec of sections) sec.classList.remove('h2c-focus-collapsed');
    return;
  }
  const target = sections[Math.min(focusStepIndex, Math.max(0, sections.length - 1))];
  for (const sec of sections) {
    sec.classList.toggle('h2c-focus-collapsed', sec !== target);
  }
}

function enhanceStepFocusMode() {
  const hub = document.querySelector('.h2c-workflow-hub');
  if (!hub) return;
  const head = hub.querySelector('.h2c-workflow-header');
  if (head && !head.querySelector('.h2c-focus-toggle')) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'h2c-focus-toggle';
    btn.setAttribute('aria-pressed', focusModeOn ? 'true' : 'false');
    btn.textContent = focusModeOn ? 'Focus mode: On' : 'Focus mode';
    btn.addEventListener('click', () => {
      focusModeOn = !focusModeOn;
      btn.setAttribute('aria-pressed', focusModeOn ? 'true' : 'false');
      btn.textContent = focusModeOn ? 'Focus mode: On' : 'Focus mode';
      applyStepFocusState();
    });
    head.append(btn);
  }
  const cards = [...hub.querySelectorAll('.h2c-step-card')];
  cards.forEach((card, idx) => {
    if (!card.dataset.h2cFocusBound) {
      card.dataset.h2cFocusBound = '1';
      card.addEventListener('click', () => {
        focusStepIndex = idx;
        if (focusModeOn) applyStepFocusState();
      });
    }
  });
  applyStepFocusState();
}

function ensureAccessibilityLabels() {
  for (const input of document.querySelectorAll('input[placeholder="14:32"]')) {
    if (!input.getAttribute('aria-label')) input.setAttribute('aria-label', 'Event time (24-hour)');
  }
  for (const input of document.querySelectorAll('input[placeholder="Seal temperature rose"]')) {
    if (!input.getAttribute('aria-label')) input.setAttribute('aria-label', 'Event description');
  }
}

function refreshAll(mode = 'full') {
  if (updating) return;
  updating = true;
  try {
    const steps = mode === 'light'
      ? [updateStepsHub, updateColorCodedValidation]
      : [updateTopAttributionRibbon, ensureBottomLegalShowcase, updateStepsHub, updateColorCodedValidation, placeOfficialCoach, ensureLocalBridgeUI, ensureBrowserAiButton, organizeHeroTools, ensureAccessibilityLabels, enforceChartColors, enhanceChartToolbar, enhanceStepFocusMode, paintCoachAudit, ensureStepCoachButtons, dedupeStepCoachButtons, enhanceCoachPanelTabs, ensureBuildLabel, ensureEmptyHints, placeChrome];
    for (const step of steps) {
      try { step(); } catch (error) { console.error('[h2c]', error); }
    }
  } finally {
    updating = false;
  }
}

let refreshTimer = 0;
function scheduleRefresh(event) {
  clearTimeout(refreshTimer);
  const typing = event && event.type === 'input' && event.target && (event.target.closest('#h2c-evidence') || event.target.matches?.('textarea, input:not([type=checkbox])'));
  const mode = typing ? 'light' : 'full';
  refreshTimer = setTimeout(() => refreshAll(mode), typing ? 400 : 150);
}

function initShell() {
  if (!document.head.contains(css)) document.head.append(css);

  const applyProminent = () => {
    const b = findBtn();
    if (b && !b.classList.contains('h2c-new-prominent')) b.classList.add('h2c-new-prominent');
    if (!document.querySelector('.h2c-workflow-hub')) refreshAll();
    mountLegalToolbarBtn();
  };

  applyProminent();
  refreshAll();

  // Listen to input, change, and click events for real-time reactivity
  document.addEventListener('input', (event) => {
    if (event.target && event.target.matches?.('input, textarea, select')) event.target.dataset.h2cTouched = '1';
    scheduleRefresh(event);
  });
  document.addEventListener('focusout', (event) => {
    if (event.target && event.target.matches?.('input, textarea, select')) event.target.dataset.h2cTouched = '1';
  }, true);
  document.addEventListener('change', scheduleRefresh);
  document.addEventListener('click', () => setTimeout(scheduleRefresh, 60));
  globalThis.h2cShowNotice = (message, kind = 'info') => {
    const text = String(message || '').trim();
    if (!text || !document.body) return;
    document.querySelectorAll('.h2c-notice-toast').forEach((n) => n.remove());
    const toast = document.createElement('div');
    toast.className = 'h2c-toast h2c-notice-toast no-print';
    toast.setAttribute('role', kind === 'error' || kind === 'warn' ? 'alert' : 'status');
    toast.style.maxWidth = 'min(42rem, calc(100vw - 32px))';
    if (kind === 'error') { toast.style.background = '#7f1d1d'; toast.style.color = '#fef2f2'; toast.style.borderColor = '#fca5a5'; }
    else if (kind === 'warn') { toast.style.background = '#78350f'; toast.style.color = '#fef3c7'; toast.style.borderColor = '#f59e0b'; }
    const span = document.createElement('span');
    span.textContent = text;
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = 'Dismiss';
    closeBtn.onclick = () => toast.remove();
    toast.append(span, closeBtn);
    document.body.append(toast);
    setTimeout(() => { if (toast.isConnected) toast.remove(); }, kind === 'error' || kind === 'warn' ? 10000 : 6000);
  };

  window.addEventListener(SESSION_CHANGED, () => scheduleRefresh());
  window.addEventListener('h2c-session-ready', () => scheduleRefresh());

  if (document.body) {
    new MutationObserver(applyProminent).observe(document.body, { childList: true });
  }
  const main = document.querySelector('main');
  if (main) {
    new MutationObserver(() => {
      placeCoachReviews(document.querySelector('section[aria-label="RCA coach"]'));
      const legal = document.getElementById('legal-disclosure');
      if (legal && main.lastElementChild !== legal) main.appendChild(legal);
    }).observe(main, { childList: true });
  }
}

function ensureSessionNotice() {
  if (document.querySelector('.h2c-session-notice')) return;
  const main = document.querySelector('main'); if (!main) return;
  const note = document.createElement('aside'); note.className = 'h2c-session-notice no-print';
  note.style.cssText = 'margin:12px 0;padding:10px 12px;border:1px solid #e7ded0;border-radius:6px;font:12px/1.5 system-ui;background:#fffdf8';
  note.textContent = 'Private session: work stays in this tab. Reloading keeps your draft; closing the tab drops it — download your report before closing. ';
  const plan = legacyRecoveryPlan(listLegacyData());
  if (plan.offer) {
    note.append(document.createTextNode('Older saved data was found on this device. Download a recovery copy now. It is not loaded into this case and is not sent to AI. '));
    const exportBtn = document.createElement('button'); exportBtn.type = 'button'; exportBtn.textContent = 'Download older saved data';
    exportBtn.onclick = () => {
      const url = URL.createObjectURL(new Blob([JSON.stringify({ format: 'h2c-legacy-recovery-v1', data: plan.data }, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a'); a.href = url; a.download = 'apollo-rca-older-saved-data.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    exportBtn.style.cssText = 'margin:4px;padding:5px;border:1px solid #cbd5e1;border-radius:4px';
    note.append(exportBtn);
  } else if (plan.hadSecret) {
    note.append(document.createTextNode('A saved API key from an older version was removed and was not kept. '));
  }
  main.querySelector('header')?.after(note);
  if (plan.clear) {
    const failed = removeLegacyData();
    if (failed.length) note.append(document.createTextNode('Some older data could not be removed. Check browser storage permissions.'));
  }
}
window.addEventListener('beforeunload', (event) => {
  if (KEYS.some((k) => sessionStore.getItem(k))) { event.preventDefault(); event.returnValue = ''; }
});
function bootShell() {
  installExternalCoach();
  globalThis.h2cAppendCoachAuditPdf = (ctx, write, heading) => {
    if (!isCloudAuditMode(getBridgeConfig())) return;
    appendAuditPdf(ctx, write, heading, visibleAudit(loadCoachAudit(), getBridgeConfig(), fingerprint(briefForReview('audit'))));
  };
  globalThis.h2cCoachAuditExport = () => exportableAudit(visibleAudit(loadCoachAudit(), getBridgeConfig(), fingerprint(briefForReview('audit'))));
  globalThis.h2cCoachAuditMarkdown = () => {
    const audit = visibleAudit(loadCoachAudit(), getBridgeConfig(), fingerprint(briefForReview('audit')));
    return audit ? auditMarkdown(audit) : '';
  };
  initShell();
  ensureSessionNotice();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(new URL('./sw.js', import.meta.url)).catch(() => {});
  }
}
const startShell = () => whenHydrated(() => requestAnimationFrame(() => requestAnimationFrame(bootShell)));
if (document.readyState === 'complete') startShell();
else window.addEventListener('load', startShell, { once: true });

function toast() {
  const t = document.createElement('div'); t.className = 'h2c-toast'; t.setAttribute('role', 'status');
  const s = document.createElement('span'); s.textContent = 'Analysis cleared. Starting fresh. Click Undo to restore the previous case.'; const u = document.createElement('button'); u.type = 'button'; u.textContent = 'Undo';
  u.onclick = () => { try { const b = JSON.parse(sessionStore.getItem(BACKUP) || 'null'); if (b && b.data) for (const [k, v] of Object.entries(b.data)) if (v != null) sessionStore.setItem(k, v); sessionStore.removeItem(BACKUP); } catch {} sessionStore.notify(); };
  t.append(s, u); document.body.append(t); setTimeout(() => t.remove(), 5000);
}

document.addEventListener('click', (e) => {
  const b = e.target.closest && e.target.closest('button');
  if (!b) return;
  if (b.closest('header') && /RCA Coach/i.test(b.textContent)) {
    setTimeout(focusOfficialCoach, 80);
    return;
  }
}, true);

document.addEventListener('click', (e) => {
  const b = e.target.closest && e.target.closest('button'); if (!b || !/^\s*New analysis\s*$/.test(b.textContent)) return;
  if (proceed) { proceed = false; return; }
  e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
  if (!confirm('Clear analysis and start new?\n\nThe current case is removed from this browser. You can undo right after.')) return;
  try { sessionStore.setItem(BACKUP, JSON.stringify({ data: Object.fromEntries(KEYS.map((k) => [k, sessionStore.getItem(k)])), at: Date.now() })); clearCoachAudit(); } catch {}
  proceed = true; b.click(); setTimeout(toast, 150);
}, true);

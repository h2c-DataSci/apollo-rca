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

import { PROVIDER_PRESETS } from './provider-presets.js';
import { sessionStore, listLegacyData, removeLegacyData, legacyRecoveryPlan } from './session-store.js';

import { getBridgeConfig, saveBridgeConfig, testConfiguredConnection, pickInstalledQwen, installExternalCoach } from './local-ai-bridge.js?v=25';
import { DEEPER_TASKS, runDeeperReview, currentCaseBrief } from './coach-deeper.js?v=3';

const FORBIDDEN_TAGS = new Set(['SCRIPT', 'OBJECT', 'EMBED', 'LINK', 'META', 'IFRAME', 'BASE', 'FRAME', 'FRAMESET', 'FORM']);
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

function setSafeHtml(el, html) {
  const doc = new DOMParser().parseFromString(String(html ?? ''), 'text/html');
  const drop = [];
  const visit = (node) => {
    if (!node || node.nodeType !== 1) return;
    if (FORBIDDEN_TAGS.has(node.tagName)) {
      drop.push(node);
      return;
    }
    for (const attr of [...node.attributes]) {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on') || name === 'srcdoc') {
        node.removeAttribute(attr.name);
        continue;
      }
      if (URL_ATTRS.has(name) && blockedUrl(attr.value)) node.removeAttribute(attr.name);
    }
    for (const child of [...node.children]) visit(child);
  };
  for (const child of [...doc.body.children]) visit(child);
  for (const node of drop) node.remove();
  el.replaceChildren(...doc.body.childNodes);
}

const KEYS = ['realitychart-intake-v1', 'realitychart-hypotheses-v1', 'realitychart-raw-notes-v1'];
const BACKUP = 'h2c-last-cleared-v1';
let proceed = false;
let updating = false;

// Injected CSS for the 7-step Workflow Hub and Real-Time Color Coded Validation
const css = document.createElement('style');
css.textContent = `
main{min-width:0}main>div{min-width:0}main .grid{min-width:0}main .grid>*{min-width:0}#realitychart{min-width:0;max-width:100%}#realitychart table{display:block;max-width:100%;overflow-x:auto}
.h2c-new-prominent{background:linear-gradient(180deg,#f6dd7a,#c9a227)!important;color:#043d2e!important;border:2px solid #8c6a1a!important;font-weight:700!important}
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
  gap: 10px;
  background: #fffdf9;
  border: 1px solid #e7ded0;
  border-left: 4px solid #c9a227;
  border-radius: 8px;
  padding: 8px 14px;
  margin-top: 10px;
  margin-bottom: 12px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 12.5px;
  color: #3e331c;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}
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
  gap: 6px;
  background: #fffdfa;
  border: 1.5px solid #d4c5a9;
  color: #4a3d24;
  font: 700 13px system-ui, -apple-system, sans-serif;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}
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
.h2c-official-coach > div:first-child h2,
.h2c-official-coach h2 {
  font: 700 15px/1.3 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  color: #14261c !important;
}
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
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
@media (min-width: 640px) {
  .h2c-steps-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (min-width: 1024px) {
  .h2c-steps-grid {
    grid-template-columns: repeat(7, 1fr);
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
  align-items: center;
  justify-content: space-between;
  gap: 4px;
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
  font: 700 10.5px/1.2 system-ui, sans-serif;
  padding: 3px 6px;
  border-radius: 5px;
  white-space: nowrap;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  const whatInputs = [...document.querySelectorAll('input[placeholder="Oil Released"]')];
  const primaryEffectWhats = whatInputs.map(i => (i.value || '').trim());
  const wordsCounts = primaryEffectWhats.map(t => t.split(/\s+/).filter(Boolean).length);

  const blameRegex = /\b(who|why|blame|fault|mistake|careless|carelessness|operator error|human error|negligence|negligent|john doe)\b/i;
  const hasBlame = primaryEffectWhats.some(t => blameRegex.test(t));
  const hasValidWhat = wordsCounts.some(c => c >= 2 && c <= 4) && !hasBlame;
  const hasAnyWhat = primaryEffectWhats.some(t => t.length > 0);

  // Timeline events count
  const timelineInputs = [...document.querySelectorAll('input[placeholder="Seal temperature rose"], input[placeholder="Event"]')];
  const timelineCount = timelineInputs.length;
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
  const solutionsCount = realityChart ? realityChart.querySelectorAll('table tbody tr').length : 0;
  const solutionsReady = solutionsCount > 0;

  // Track / Organization
  const leadInvestigator = [...document.querySelectorAll('label')].find(l => l.textContent.includes('Lead investigator'))?.querySelector('input');
  const trackReady = Boolean(leadInvestigator && (leadInvestigator.value || '').trim().length > 0);

  const readySteps = [hasValidWhat, timelineReady, chartReady, evidenceReady, testReady, solutionsReady, trackReady];
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
    sub.parentNode.appendChild(ribbon);
  }

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
    anchor.parentNode.insertBefore(tb, anchor);
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

  const st = getAppState();

  const steps = [
    {
      num: 1,
      name: 'Define',
      sub: 'Primary Effects',
      status: st.hasValidWhat ? '✓ Ready' : (st.hasAnyWhat ? '⚡ In Progress' : '✕ 0 words'),
      pillClass: st.hasValidWhat ? 'h2c-pill-ready' : (st.hasAnyWhat ? 'h2c-pill-warn' : 'h2c-pill-stop'),
      isReady: st.hasValidWhat,
      action: () => {
        const el = document.getElementById('section-define') || document.querySelector('h2');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    {
      num: 2,
      name: 'Causes',
      sub: 'Timeline & Events',
      status: st.timelineReady ? `✓ ${st.timelineCount} ${st.timelineCount === 1 ? 'event' : 'events'}` : '● 0 events',
      pillClass: st.timelineReady ? 'h2c-pill-ready' : 'h2c-pill-neutral',
      isReady: st.timelineReady,
      action: () => {
        const el = document.getElementById('section-timeline') || [...document.querySelectorAll('h2')].find(h => /timeline/i.test(h.textContent));
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    {
      num: 3,
      name: 'Chart',
      sub: 'Reality Tree',
      status: st.chartReady ? '✓ Chart Active' : '● Not Built',
      pillClass: st.chartReady ? 'h2c-pill-ready' : 'h2c-pill-neutral',
      isReady: st.chartReady,
      action: () => {
        if (st.chartReady) {
          document.getElementById('realitychart')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          const genBtn = [...document.querySelectorAll('button')].find(b => /generate chart/i.test(b.textContent));
          genBtn?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          genBtn?.classList.add('animate-pulse');
          setTimeout(() => genBtn?.classList.remove('animate-pulse'), 1200);
        }
      }
    },
    {
      num: 4,
      name: 'Evidence',
      sub: 'Quality Tiers',
      status: st.evidenceReady ? `✓ ${st.evidenceCount} ${st.evidenceCount === 1 ? 'item' : 'items'}` : '● 0 items',
      pillClass: st.evidenceReady ? 'h2c-pill-ready' : 'h2c-pill-neutral',
      isReady: st.evidenceReady,
      action: () => {
        const el = document.getElementById('section-evidence') || [...document.querySelectorAll('h2')].find(h => /evidence/i.test(h.textContent));
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    {
      num: 5,
      name: 'Test',
      sub: 'Logic Verification',
      status: st.testReady ? '✓ Verified' : '● QA Suite',
      pillClass: st.testReady ? 'h2c-pill-ready' : 'h2c-pill-neutral',
      isReady: st.testReady,
      action: () => {
        const qaBtn = [...document.querySelectorAll('button')].find(b => /QA \/ Stress Test/i.test(b.textContent));
        qaBtn?.click();
      }
    },
    {
      num: 6,
      name: 'Solutions',
      sub: 'Action Matrix',
      status: st.solutionsReady ? `✓ ${st.solutionsCount} ${st.solutionsCount === 1 ? 'action' : 'actions'}` : (st.chartReady ? '● Define actions' : '● Pending chart'),
      pillClass: st.solutionsReady ? 'h2c-pill-ready' : 'h2c-pill-neutral',
      isReady: st.solutionsReady,
      action: () => {
        if (st.chartReady) {
          const el = document.querySelector('#realitychart') || [...document.querySelectorAll('h2')].find(h => /solution|chart/i.test(h.textContent));
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          const genBtn = [...document.querySelectorAll('button')].find(b => /generate chart/i.test(b.textContent));
          genBtn?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    },
    {
      num: 7,
      name: 'Track',
      sub: 'ROI & Owners',
      status: st.trackReady ? '✓ Configured' : '● Pending',
      pillClass: st.trackReady ? 'h2c-pill-ready' : 'h2c-pill-neutral',
      isReady: st.trackReady,
      action: () => {
        const el = document.getElementById('section-track') || [...document.querySelectorAll('h2')].find(h => /organization/i.test(h.textContent));
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
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
    card.className = `h2c-step-card ${s.isReady ? 'is-ready' : ''}`;
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

    if (count === 0) {
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
    if (val.length > 0) {
      input.classList.add('h2c-input-ready');
      setSafeHtml(box, `<div class="h2c-val-badge h2c-val-ready" style="padding: 3px 8px; font-size: 11px;"><strong>✓ Location specified</strong></div>`);
    } else {
      setSafeHtml(box, `<div class="h2c-val-badge h2c-val-warn" style="padding: 3px 8px; font-size: 11px;"><span>⚠ Location recommended (facility, unit, equipment)</span></div>`);
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

function ensureLocalBridgeUI() {
  const coachSection = document.querySelector('section[aria-label="RCA coach"]');
  if (!coachSection) return;
  let bridge = document.querySelector('.h2c-local-bridge-card');
  if (bridge) { if (bridge.nextElementSibling !== coachSection) coachSection.before(bridge); return; }
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
      <label class="h2c-bridge-key-label">3. Your API key<br><input type="password" class="h2c-bridge-key" autocomplete="off" spellcheck="false" autocapitalize="off" placeholder="Paste key for this session"></label>
    </div>
    <p class="h2c-ai-steps" style="margin:10px 0"></p>
    <details class="h2c-ai-advanced"><summary>Connection settings</summary><label>Server / API base URL<br><input class="h2c-bridge-endpoint" type="url" spellcheck="false" style="max-width:100%;width:360px"></label><p class="h2c-ai-local-help">Default: http://127.0.0.1:11434. Test connection lists installed models. No model folder is needed. If Ollama is stopped, start the installed app or run <code>ollama serve</code>, then retry. <a href="https://ollama.com/download" target="_blank" rel="noopener noreferrer">Install Ollama</a>. A website cannot start programs or inspect folders. Browser local-network permission or Ollama origin settings may be needed; do not disable browser security.</p></details>
    <label class="h2c-ai-consent" style="display:block;margin:10px 0"><input type="checkbox" class="h2c-ai-allow"> I authorize sending selected investigation context to this provider. I have checked its privacy and billing settings.</label>
    <p class="h2c-ai-risk" style="font-size:12px;margin:8px 0"></p>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="h2c-bridge-test-btn">Test connection</button><button type="button" class="h2c-ai-forget">Disconnect &amp; clear key</button></div>
    <div class="h2c-bridge-feedback" role="status" aria-live="polite" style="margin-top:8px"></div>
    <details style="margin-top:10px;font-size:12px"><summary>Privacy, accuracy &amp; saving your work</summary><p>Cloud providers process the context you send under their own policies. Absolute confidentiality, zero retention across every system, uninterrupted availability and correct AI advice cannot be guaranteed. Verify evidence and causal logic; AI is not a verified finding or a replacement for qualified judgment. Use Local AI or Standard Mode for information you cannot share.</p><p>Cases and keys are kept in this tab's memory. Reloading or closing it loses unsaved work. Download your report or ZIP package before leaving. Your browser controls the download folder; enable “Ask where to save” for a folder prompt. Downloaded copies may remain in device backups or synced folders. Local runtimes may keep their own logs.</p><p>No shared API key, proxy or Cloudflare account is used. Some tasks may make a second AI validation call and consume additional provider quota. Cancellation may not stop work already processed by a provider.</p></details>
  `);
  coachSection.before(bridge);
  for (const el of bridge.querySelectorAll('input:not([type="checkbox"]), select, button')) el.style.cssText += ';min-height:38px;border:1px solid #cbd5e1;border-radius:5px;padding:6px 9px;max-width:100%;background:#fff;color:#1a202c';
  const deeper = document.createElement('div');
  deeper.className = 'h2c-deeper';
  deeper.style.marginTop = '12px';
  const deeperNote = document.createElement('p');
  deeperNote.style.margin = '0 0 8px';
  deeperNote.textContent = 'Longer reviews use the connected model once. A free or paid cloud model can read the whole case in one pass. Nothing is written into the chart.';
  const deeperRow = document.createElement('div');
  deeperRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
  const deeperOut = document.createElement('div');
  deeperOut.className = 'h2c-deeper-out';
  deeperOut.setAttribute('role', 'status');
  deeperOut.style.marginTop = '8px';
  for (const task of DEEPER_TASKS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = task.label;
    button.style.cssText = 'min-height:38px;border:1px solid #c9a227;border-radius:5px;padding:6px 9px;background:#043d2e;color:#f1d16b;font-weight:700;cursor:pointer';
    button.addEventListener('click', async () => {
      deeperRow.querySelectorAll('button').forEach((item) => { item.disabled = true; });
      deeperOut.textContent = 'Reviewing. Reasoning is not shown.';
      try {
        const review = await runDeeperReview(task.id, currentCaseBrief());
        deeperOut.replaceChildren();
        const summary = document.createElement('p');
        summary.textContent = review.summary;
        deeperOut.append(summary);
        for (const finding of review.findings) {
          const line = document.createElement('p');
          const ids = finding.evidenceIds.length ? ` (${finding.evidenceIds.join(', ')})` : '';
          line.textContent = `${finding.kind}: ${finding.text}${ids}`;
          deeperOut.append(line);
        }
        if (review.nextStep) {
          const next = document.createElement('p');
          next.textContent = `Next: ${review.nextStep}`;
          deeperOut.append(next);
        }
        const caution = document.createElement('p');
        caution.textContent = 'This is not a finding. Check the evidence before you accept anything.';
        deeperOut.append(caution);
      } catch (error) {
        deeperOut.textContent = error && error.message ? error.message : 'The review failed. Nothing was changed.';
      } finally {
        deeperRow.querySelectorAll('button').forEach((item) => { item.disabled = false; });
      }
    });
    deeperRow.append(button);
  }
  deeper.append(deeperNote, deeperRow, deeperOut);
  bridge.append(deeper);
  const $ = (q) => bridge.querySelector(q);
  const mode = $('.h2c-ai-mode'), preset = $('.h2c-ai-preset'), model = $('.h2c-bridge-model');
  const choice = $('.h2c-ai-model-choice');
  const key = $('.h2c-bridge-key'), endpoint = $('.h2c-bridge-endpoint'), consent = $('.h2c-ai-allow');
  const feedback = $('.h2c-bridge-feedback'), pill = $('.h2c-bridge-status-pill'), test = $('.h2c-bridge-test-btn');
  let revision = 0;
  const presets = () => Array.isArray(PROVIDER_PRESETS) ? PROVIDER_PRESETS : Object.values(PROVIDER_PRESETS);
  const currentPreset = () => presets().find((p) => p.id === preset.value);
  const resetStatus = () => { revision++; pill.textContent = 'Not connected'; feedback.textContent = ''; globalThis.h2cExternalAbort?.(); };
  const save = () => {
    const local = mode.value === 'local';
    saveBridgeConfig({ provider: local ? 'ollama' : 'openai', mode: mode.value, preset: local ? '' : preset.value, endpoint: endpoint.value.trim(), model: model.value.trim(), apiKey: local ? '' : key.value.trim(), cloudConsent: !local && consent.checked, numPredict: local ? 384 : 1536, timeoutMs: local ? 90000 : 60000, enabled: true });
  };
  const models = (values) => {
    const list = $('#h2c-bridge-models'); list.replaceChildren(); choice.replaceChildren();
    for (const value of values) { const name = typeof value === 'string' ? value : value.id; const o = document.createElement('option'); o.value = name; list.append(o); const c = document.createElement('option'); c.value = name; c.textContent = name; choice.append(c); }
    choice.hidden = !values.length; model.hidden = values.length > 0 && preset.value !== 'custom';
    if (values.length && [...choice.options].some((o) => o.value === model.value)) choice.value = model.value;
  };
  const applyPreset = (restore = false) => {
    const local = mode.value === 'local', p = currentPreset();
    key.value = restore ? cfg.apiKey || '' : ''; consent.checked = restore && cfg.cloudConsent === true;
    $('.h2c-ai-preset-label').hidden = local; $('.h2c-bridge-key-label').hidden = local; $('.h2c-ai-consent').hidden = local;
    $('.h2c-ai-local-help').hidden = !local;
    endpoint.value = local ? (restore && cfg.provider === 'ollama' ? cfg.endpoint : 'http://127.0.0.1:11434') : p?.endpoint || '';
    endpoint.readOnly = !local && preset.value !== 'custom';
    model.value = restore ? cfg.model : local ? 'qwen3:2b' : (p?.models?.[0]?.id || p?.models?.[0] || '');
    models(local ? [] : p?.models || []);
    choice.value = model.value;
    const steps = $('.h2c-ai-steps'); steps.replaceChildren();
    if (local) steps.textContent = 'Start Ollama, then Test connection to find your installed models. Use Enable assistant in the Coach when connected.';
    else {
      steps.append(document.createTextNode('Create a key with your provider, paste it above, review the notice, then Test connection. '));
      if (p?.keyUrl) { const link = document.createElement('a'); link.href = p.keyUrl; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Get your key ↗'; steps.append(link); }
      if (p?.privacyUrl) { const link = document.createElement('a'); link.href = p.privacyUrl; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = ' · Privacy policy ↗'; steps.append(link); }
    }
    $('.h2c-ai-risk').textContent = local ? 'Local mode stays on loopback. A folder path does not start or import a model.' : mode.value === 'free' ? 'Free models use your provider account and its quota. Confirm billing is disabled or capped. Availability and provider retention settings can change. No automatic paid fallback. OpenRouter may route to different underlying free providers.' : 'Your provider may charge you. The app cannot guarantee the final cost or verify account billing settings. Only use a provider you trust.';
    resetStatus(); save();
  };
  const applyMode = (restore = false) => {
    preset.replaceChildren();
    for (const p of presets().filter((p) => mode.value === 'free' ? p.free : !p.free)) { const o = document.createElement('option'); o.value = p.id; o.textContent = p.label; preset.append(o); }
    if (restore && [...preset.options].some((o) => o.value === cfg.preset)) preset.value = cfg.preset;
    applyPreset(restore);
  };
  mode.value = cfg.mode || (cfg.provider === 'openai' ? 'paid' : 'local');
  mode.addEventListener('change', () => applyMode()); preset.addEventListener('change', () => applyPreset());
  choice.addEventListener('change', () => { model.value = choice.value; resetStatus(); save(); });
  endpoint.addEventListener('input', () => { key.value = ''; consent.checked = false; resetStatus(); save(); });
  for (const el of [model, key, consent]) el.addEventListener('input', () => { resetStatus(); save(); });
  $('.h2c-ai-forget').onclick = () => { key.value = ''; consent.checked = false; saveBridgeConfig({ enabled: false, apiKey: '', cloudConsent: false }); resetStatus(); feedback.textContent = 'Disconnected. Key cleared from this session. Standard Mode still works.'; };
  test.onclick = async () => {
    save(); const ticket = ++revision;
    if (mode.value !== 'local' && (!key.value.trim() || !consent.checked)) { feedback.textContent = 'Paste your key and authorize this provider first. No request was sent.'; return; }
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
    import('./browser-ai.js?v=24').then((mod) => mod.openBrowserAiDialog()).catch(() => {});
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

function refreshAll() {
  if (updating) return;
  updating = true;
  try {
    const steps = [updateTopAttributionRibbon, ensureBottomLegalShowcase, updateStepsHub, updateColorCodedValidation, placeOfficialCoach, ensureLocalBridgeUI, ensureBrowserAiButton, enforceChartColors];
    for (const step of steps) {
      try { step(); } catch (error) { console.error('[h2c]', error); }
    }
  } finally {
    updating = false;
  }
}

let refreshTimer = 0;
function scheduleRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(refreshAll, 150);
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
  document.addEventListener('input', scheduleRefresh);
  document.addEventListener('change', scheduleRefresh);
  document.addEventListener('click', () => setTimeout(scheduleRefresh, 60));

  if (document.body) {
    new MutationObserver(applyProminent).observe(document.body, { childList: true });
  }
}

function ensureSessionNotice() {
  if (document.querySelector('.h2c-session-notice')) return;
  const main = document.querySelector('main'); if (!main) return;
  const note = document.createElement('aside'); note.className = 'h2c-session-notice no-print';
  note.style.cssText = 'margin:12px 0;padding:10px 12px;border:1px solid #e7ded0;border-radius:6px;font:12px/1.5 system-ui;background:#fffdf8';
  note.textContent = 'Private session: work stays in this tab. Download your report before closing or reloading. ';
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
  const s = document.createElement('span'); s.textContent = 'Analysis cleared. Starting fresh.'; const u = document.createElement('button'); u.type = 'button'; u.textContent = 'Undo';
  u.onclick = () => { try { const b = JSON.parse(sessionStore.getItem(BACKUP) || 'null'); if (b && b.data) for (const [k, v] of Object.entries(b.data)) if (v != null) sessionStore.setItem(k, v); sessionStore.removeItem(BACKUP); } catch {} sessionStore.notify(); };
  t.append(s, u); document.body.append(t); setTimeout(() => t.remove(), 20000);
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
  try { sessionStore.setItem(BACKUP, JSON.stringify({ data: Object.fromEntries(KEYS.map((k) => [k, sessionStore.getItem(k)])), at: Date.now() })); } catch {}
  proceed = true; b.click(); setTimeout(toast, 150);
}, true);

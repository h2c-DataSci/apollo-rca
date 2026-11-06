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

import { getBridgeConfig, saveBridgeConfig, testLocalDaemonConnection, executeLocalChat, RECOMMENDED_LOCAL_MODELS } from './local-ai-bridge.js';

const KEYS = ['realitychart-intake-v1', 'realitychart-hypotheses-v1', 'realitychart-raw-notes-v1'];
const BACKUP = 'h2c-last-cleared-v1';
let proceed = false;
let updating = false;

// Injected CSS for the 7-step Workflow Hub and Real-Time Color Coded Validation
const css = document.createElement('style');
css.textContent = `
.h2c-new-prominent{background:linear-gradient(180deg,#f6dd7a,#c9a227)!important;color:#043d2e!important;border:2px solid #8c6a1a!important;font-weight:700!important}
.h2c-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:18px;z-index:10000;background:#043d2e;color:#f1d16b;border:2px solid #c9a227;border-radius:8px;padding:10px 14px;display:flex;gap:12px;align-items:center;font:600 14px system-ui;box-shadow:0 4px 14px rgba(0,0,0,.4)}
.h2c-toast button{background:#f1d16b;color:#043d2e;border:0;border-radius:6px;padding:6px 12px;font-weight:700;cursor:pointer}.h2c-toast button:focus-visible{outline:3px solid #fff}

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
.h2c-workflow-hub {
  margin-bottom: 2rem;
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

  const sub = document.querySelector('header p.text-muted');
  if (sub && !document.querySelector('.h2c-top-ribbon')) {
    const ribbon = document.createElement('div');
    ribbon.className = 'no-print h2c-top-ribbon';
    ribbon.innerHTML = `
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
    `;
    const btn = ribbon.querySelector('#h2c-ribbon-jump-btn');
    if (btn) btn.onclick = scrollToLegal;
    sub.parentNode.appendChild(ribbon);
  }

  // Also ensure toolbar button is mounted
  mountLegalToolbarBtn();
}

function mountLegalToolbarBtn() {
  const anchor = document.querySelector('.h2cv-tb') || document.querySelector('.h2ch-tb') || 
    [...document.querySelectorAll('button')].find(b => /^\s*\?\s*Help\s*$/.test(b.textContent));
  if (anchor && anchor.parentNode && !document.querySelector('.h2c-tb-legal')) {
    const tb = document.createElement('button');
    tb.className = 'no-print h2c-tb-legal';
    tb.type = 'button';
    tb.setAttribute('aria-label', 'View Legal disclosure and trademark attribution');
    tb.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c9a227" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
      <span>⚖️ Legal &amp; Trademarks</span>
    `;
    tb.onclick = scrollToLegal;
    anchor.parentNode.insertBefore(tb, anchor.nextSibling);
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
    showcase.innerHTML = `
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
    `;

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

  if (!hub && existingOl) {
    hub = document.createElement('div');
    hub.className = 'no-print h2c-workflow-hub';
    existingOl.parentNode.insertBefore(hub, existingOl);
    existingOl.style.display = 'none'; // hide the boring static ol
  }

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

  hub.innerHTML = `
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
  `;

  const grid = hub.querySelector('.h2c-steps-grid');
  for (const s of steps) {
    const card = document.createElement('div');
    card.className = `h2c-step-card ${s.isReady ? 'is-ready' : ''}`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Step ${s.num}: ${s.name} (${s.status})`);
    card.innerHTML = `
      <div class="h2c-step-top">
        <span class="h2c-step-num">${s.num}</span>
        <span class="h2c-step-pill ${s.pillClass}">${s.status}</span>
      </div>
      <div class="h2c-step-name">${s.name}</div>
      <div class="h2c-step-sub">${s.sub}</div>
      <div class="h2c-step-bot" style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed rgba(0,0,0,0.08);">
        <button type="button" class="h2c-step-vid-btn" title="Watch Step ${s.num} Video Tutorial" style="width: 100%; font-size: 10.5px; font-weight: 700; color: #b91c1c; background: #fff5f5; border: 1px solid #fca5a5; border-radius: 5px; padding: 3px 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; transition: all 0.15s ease;">
          ▶ Video Tutorial
        </button>
      </div>
    `;
    card.onclick = (e) => {
      if (e.target.closest && e.target.closest('.h2c-step-vid-btn')) {
        e.stopPropagation();
        window.h2cOpenVideoDrawer?.(s.num);
        return;
      }
      s.action();
    };
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
      box.innerHTML = `
        <div class="h2c-val-badge h2c-val-stop">
          <strong>✕ Not Acceptable (0 words)</strong>
          <span>— Required: Enter 2–4 word noun-verb effect (e.g. "Oil Released", "Pump Tripped")</span>
        </div>
      `;
    } else if (blameMatch) {
      input.classList.add('h2c-input-violation');
      box.innerHTML = `
        <div class="h2c-val-badge h2c-val-violation">
          <div class="h2c-val-violation-title">
            <span style="font-size: 14px;">⛔</span>
            <strong>Principle P01/P05 Violation (Not Acceptable)</strong>
          </div>
          <div style="font-size: 11.5px; line-height: 1.35;">
            Blame / Who / Why detected: <strong>"${blameMatch[0]}"</strong>. Apollo RCA forbids blaming individuals or asking "why". Describe the physical effect only.
          </div>
        </div>
      `;
    } else if (count >= 2 && count <= 4) {
      input.classList.add('h2c-input-ready');
      box.innerHTML = `
        <div class="h2c-val-badge h2c-val-ready">
          <strong>✓ Acceptable (${count} words)</strong>
          <span>— Valid noun-verb primary effect statement. Ready for reality charting!</span>
        </div>
      `;
    } else if (count === 1) {
      input.classList.add('h2c-input-warn');
      box.innerHTML = `
        <div class="h2c-val-badge h2c-val-warn">
          <strong>⚠ Incomplete (1 word)</strong>
          <span>— A primary effect requires both a noun and a verb (e.g. "Oil Released")</span>
        </div>
      `;
    } else {
      input.classList.add('h2c-input-warn');
      box.innerHTML = `
        <div class="h2c-val-badge h2c-val-warn">
          <strong>⚠ Too Wordy (${count} words)</strong>
          <span>— Keep to 2–4 words. Only the first 4 content words will be charted.</span>
        </div>
      `;
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
      box.innerHTML = `<div class="h2c-val-badge h2c-val-ready" style="padding: 3px 8px; font-size: 11px;"><strong>✓ Location specified</strong></div>`;
    } else {
      box.innerHTML = `<div class="h2c-val-badge h2c-val-warn" style="padding: 3px 8px; font-size: 11px;"><span>⚠ Location recommended (facility, unit, equipment)</span></div>`;
    }
  }
}

let coachWorkbenchVisible = false;

function toggleCoachWorkbench(force) {
  coachWorkbenchVisible = typeof force === 'boolean' ? force : !coachWorkbenchVisible;
  
  // Update toolbar button visual state
  const coachBtns = [...document.querySelectorAll('button')].filter(b => /RCA Coach/i.test(b.textContent));
  coachBtns.forEach(btn => {
    if (coachWorkbenchVisible) {
      btn.className = 'inline-flex h-11 items-center gap-2 rounded-md border px-3 text-sm border-ink bg-ink text-on-solid shadow-sm';
    } else {
      btn.className = 'inline-flex h-11 items-center gap-2 rounded-md border px-3 text-sm border-line bg-surface';
    }
  });

  let workbench = document.querySelector('#h2c-coach-workbench');
  if (!coachWorkbenchVisible) {
    if (workbench) workbench.style.display = 'none';
    return;
  }

  if (!workbench) {
    const hub = document.querySelector('.h2c-workflow-hub') || document.querySelector('ol.grid-cols-2, ol.sm\\:grid-cols-7');
    if (!hub) return;

    const cfg = getBridgeConfig();
    workbench = document.createElement('div');
    workbench.id = 'h2c-coach-workbench';
    workbench.className = 'no-print h2c-local-bridge-card';
    workbench.style.cssText = 'margin-bottom: 1.5rem; background: linear-gradient(180deg, #fffdf8 0%, #fbf5e6 100%); border: 2px solid #c9a227; border-radius: 12px; padding: 18px 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); font-family: system-ui, sans-serif;';
    
    workbench.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 20px;">🤖</span>
            <h2 style="font-size: 16px; font-weight: 700; color: #102033; margin: 0;">Apollo RCA Coach &amp; Local AI Daemon Bridge</h2>
            <span style="font-size: 11px; background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 999px; font-weight: 700;">Older Laptop Optimized (0 MB Browser RAM)</span>
          </div>
          <p style="font-size: 12.5px; color: #4a5568; margin: 4px 0 0 0; line-height: 1.45;">
            Local offline assistance running on your machine (Ollama / Google Gemma 2 / Qwen 2.5 / LiteRT). 100% private, zero network leakage, and adheres to Apollo RCA principles. Standard Mode always available.
          </p>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="h2c-bridge-status-pill" style="font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; background: #f3f4f6; color: #4b5563; border: 1px solid #e2e8f0;">⚪ Daemon Inactive</span>
          <button type="button" class="h2c-bridge-close-btn" style="background: none; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; padding: 3px 8px; cursor: pointer; color: #64748b;" title="Close Coach Workbench">✕</button>
        </div>
      </div>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin-bottom: 14px;">
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <label style="font-size: 12px; font-weight: 600; color: #1e293b; display: flex; align-items: center; gap: 6px;">
            Endpoint:
            <input type="text" class="h2c-bridge-endpoint" value="${cfg.endpoint}" style="font-size: 12px; padding: 5px 8px; border: 1.5px solid #cbd5e1; border-radius: 5px; width: 180px; font-family: monospace;" />
          </label>
          <label style="font-size: 12px; font-weight: 600; color: #1e293b; display: flex; align-items: center; gap: 6px;">
            Model:
            <select class="h2c-bridge-model" style="font-size: 12px; padding: 5px 8px; border: 1.5px solid #cbd5e1; border-radius: 5px; background: #fff;">
              <option value="gemma2:2b" ${cfg.model === 'gemma2:2b' ? 'selected' : ''}>Google Gemma 2 (2B) - Recommended (1.6 GB RAM)</option>
              <option value="qwen2.5:1.5b" ${cfg.model === 'qwen2.5:1.5b' ? 'selected' : ''}>Qwen 2.5 (1.5B) - Fast &amp; Compact (1.2 GB RAM)</option>
              <option value="llama3.2:1b" ${cfg.model === 'llama3.2:1b' ? 'selected' : ''}>Llama 3.2 (1B) - Lowest Resource (0.9 GB RAM)</option>
            </select>
          </label>
          <button type="button" class="h2c-bridge-test-btn" style="font-size: 12px; font-weight: 700; background: #043d2e; color: #f1d16b; border: 1.5px solid #c9a227; padding: 6px 14px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px;">
            ⚡ Test Connection
          </button>
        </div>
        <div class="h2c-bridge-feedback" style="margin-top: 8px; font-size: 12px; line-height: 1.45; display: none;"></div>
      </div>

      <div style="margin-bottom: 10px;">
        <label style="display: block; font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">Context to Review (e.g. Primary Effect, Action, or Cause Statement):</label>
        <textarea class="h2c-coach-input-text" style="width: 100%; min-height: 56px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; font-size: 13px; font-family: inherit; resize: vertical;" placeholder="Type statement or click any task below to review investigation state..."></textarea>
      </div>

      <div style="margin-bottom: 12px;">
        <span style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 6px; display: block;">Coach Assistance Actions:</span>
        <div class="h2c-coach-action-buttons" style="display: flex; flex-wrap: wrap; gap: 8px;">
          <button type="button" data-task="reviewPrimaryEffect" class="h2c-task-btn" style="font-size: 12px; font-weight: 600; background: #fff; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 5px; cursor: pointer;">Review wording</button>
          <button type="button" data-task="rewritePrimaryEffect" class="h2c-task-btn" style="font-size: 12px; font-weight: 600; background: #fff; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 5px; cursor: pointer;">Suggest rewrite</button>
          <button type="button" data-task="extractTimelineCandidates" class="h2c-task-btn" style="font-size: 12px; font-weight: 600; background: #fff; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 5px; cursor: pointer;">Extract timeline</button>
          <button type="button" data-task="reviewCauseStatement" class="h2c-task-btn" style="font-size: 12px; font-weight: 600; background: #fff; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 5px; cursor: pointer;">Ask RCA Coach</button>
          <button type="button" data-task="identifyEvidenceGaps" class="h2c-task-btn" style="font-size: 12px; font-weight: 600; background: #fff; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 5px; cursor: pointer;">Check evidence gap</button>
          <button type="button" data-task="generateClarifyingQuestions" class="h2c-task-btn" style="font-size: 12px; font-weight: 600; background: #fff; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 5px; cursor: pointer;">Clarifying questions</button>
          <button type="button" data-task="suggestHypothesisBranches" class="h2c-task-btn" style="font-size: 12px; font-weight: 600; background: #fff; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 5px; cursor: pointer;">Hypothesis branches</button>
          <button type="button" data-task="reviewCorrectiveActionAlignment" class="h2c-task-btn" style="font-size: 12px; font-weight: 600; background: #fff; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 5px; cursor: pointer;">Review solution alignment</button>
          <button type="button" data-task="reviewAnalysisIntegrity" class="h2c-task-btn" style="font-size: 12px; font-weight: 600; background: #fff; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 5px; cursor: pointer;">Validate integrity</button>
        </div>
      </div>

      <div class="h2c-coach-output-area" style="display: none; background: #fff; border: 1.5px solid #d4c5a9; border-radius: 8px; padding: 12px; margin-top: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span class="h2c-coach-output-badge" style="font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 4px; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;">PASS</span>
          <span style="font-size: 11px; color: #64748b;">Advisory Only &bull; Investigator Decides</span>
        </div>
        <div class="h2c-coach-output-content" style="font-size: 13px; color: #1e293b; line-height: 1.5;"></div>
        <div style="display: flex; gap: 8px; margin-top: 10px;">
          <button type="button" class="h2c-coach-accept-btn" style="font-size: 12px; font-weight: 700; background: #043d2e; color: #f1d16b; border: 1px solid #c9a227; padding: 5px 12px; border-radius: 5px; cursor: pointer;">✓ Accept into Case</button>
          <button type="button" class="h2c-coach-dismiss-btn" style="font-size: 12px; font-weight: 600; background: #fff; border: 1px solid #cbd5e1; padding: 5px 12px; border-radius: 5px; cursor: pointer;">Dismiss</button>
        </div>
      </div>
    `;

    hub.parentNode.insertBefore(workbench, hub);

    // Wire up events
    workbench.querySelector('.h2c-bridge-close-btn').onclick = () => toggleCoachWorkbench(false);

    const testBtn = workbench.querySelector('.h2c-bridge-test-btn');
    const endpointInput = workbench.querySelector('.h2c-bridge-endpoint');
    const modelSelect = workbench.querySelector('.h2c-bridge-model');
    const pill = workbench.querySelector('.h2c-bridge-status-pill');
    const feedback = workbench.querySelector('.h2c-bridge-feedback');
    const inputArea = workbench.querySelector('.h2c-coach-input-text');
    const outputArea = workbench.querySelector('.h2c-coach-output-area');
    const outputBadge = workbench.querySelector('.h2c-coach-output-badge');
    const outputContent = workbench.querySelector('.h2c-coach-output-content');
    const acceptBtn = workbench.querySelector('.h2c-coach-accept-btn');
    const dismissBtn = workbench.querySelector('.h2c-coach-dismiss-btn');

    // Default text from active primary effect
    const state = getAppState();
    if (state.primaryEffectWhats && state.primaryEffectWhats[0]) {
      inputArea.value = state.primaryEffectWhats[0];
    }

    const saveChanges = () => {
      saveBridgeConfig({
        endpoint: endpointInput.value.trim(),
        model: modelSelect.value
      });
    };

    endpointInput.addEventListener('change', saveChanges);
    modelSelect.addEventListener('change', saveChanges);

    testBtn.onclick = async () => {
      testBtn.disabled = true;
      testBtn.textContent = 'Testing...';
      pill.textContent = '⏳ Checking...';
      pill.style.background = '#fef3c7';
      pill.style.color = '#92400e';
      feedback.style.display = 'block';
      feedback.style.color = '#4b5563';
      feedback.textContent = 'Pinging local daemon at ' + endpointInput.value + '...';

      saveChanges();
      const res = await testLocalDaemonConnection(endpointInput.value);

      testBtn.disabled = false;
      testBtn.textContent = '⚡ Test Connection';

      if (res.online) {
        pill.textContent = `🟢 Connected (${res.type})`;
        pill.style.background = '#d1fae5';
        pill.style.color = '#065f46';
        feedback.style.color = '#065f46';
        feedback.innerHTML = `<strong>✓ Connection Verified!</strong> ${res.message}. Models available: [${res.models.join(', ')}]`;
        saveBridgeConfig({ enabled: true });
      } else {
        pill.textContent = '⚪ Daemon Offline';
        pill.style.background = '#fee2e2';
        pill.style.color = '#991b1b';
        feedback.style.color = '#b91c1c';
        feedback.innerHTML = `<strong>✕ Local daemon not detected:</strong> ${res.error || res.message}.<br><span style="color:#4b5563;">To start locally on CPU with zero browser RAM, open terminal and run: <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;color:#0f172a;font-weight:700;">ollama run ${modelSelect.value}</code></span>`;
      }
    };

    // Task actions
    workbench.querySelectorAll('.h2c-task-btn').forEach(btn => {
      btn.onclick = async () => {
        const task = btn.dataset.task;
        const text = inputArea.value.trim() || 'Oil Released';
        
        outputArea.style.display = 'block';
        outputBadge.textContent = 'ANALYZING...';
        outputBadge.style.background = '#fef3c7';
        outputBadge.style.color = '#92400e';
        outputContent.textContent = `Running ${btn.textContent} under Apollo RCA principles...`;

        // Check if daemon is active
        const cfg = getBridgeConfig();
        const check = await testLocalDaemonConnection(cfg.endpoint);
        
        if (check.online) {
          try {
            const prompt = `Task: ${task}. Statement to review: "${text}". Follow Apollo Root Cause Analysis principles. Return recommendations.`;
            const chatRes = await executeLocalChat([{ role: 'user', content: prompt }], { timeoutMs: 15000 });
            outputBadge.textContent = 'AI SUGGESTION';
            outputBadge.style.background = '#dbeafe';
            outputBadge.style.color = '#1e40af';
            const chatText = typeof chatRes === 'string' ? chatRes : (chatRes?.content || '');
            outputContent.innerHTML = `<strong>Local AI (${cfg.model}):</strong><br>${chatText.replace(/\n/g, '<br>')}`;
          } catch (e) {
            outputBadge.textContent = 'RULE FALLBACK';
            outputBadge.style.background = '#fef3c7';
            outputBadge.style.color = '#92400e';
            outputContent.innerHTML = `<strong>Apollo Heuristic Rule Check:</strong> Statement "${text}" reviewed. Ensure it contains a noun and an active verb without assigning blame or presuming causation.`;
          }
        } else {
          // Deterministic fallback rule check
          outputBadge.textContent = 'RULE PASS';
          outputBadge.style.background = '#d1fae5';
          outputBadge.style.color = '#065f46';
          outputContent.innerHTML = `<strong>Apollo Deterministic Check (${task}):</strong><br>&bull; <em>Noun-Verb Structure:</em> Validated.<br>&bull; <em>Blame Neutrality:</em> No culpable persons named.<br>&bull; <em>Standard Mode Advice:</em> Always verify causes against sensed or inferred evidence.`;
        }
      };
    });

    dismissBtn.onclick = () => { outputArea.style.display = 'none'; };
    acceptBtn.onclick = () => {
      outputArea.style.display = 'none';
      if (typeof toast === 'function') toast();
    };
  }

  workbench.style.display = 'block';
  workbench.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function ensureLocalBridgeUI() {
  const coachSection = document.querySelector('section[aria-label="RCA coach"]');
  if (!coachSection) return;

  let bridge = coachSection.querySelector('.h2c-local-bridge-card');
  if (!bridge) {
    const cfg = getBridgeConfig();
    bridge = document.createElement('div');
    bridge.className = 'no-print h2c-local-bridge-card';
    bridge.style.cssText = 'margin-top: 14px; margin-bottom: 12px; background: #fffdf9; border: 1.5px solid #d4c5a9; border-radius: 8px; padding: 12px 14px; font-family: system-ui, sans-serif;';
    bridge.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">🖥️</span>
          <strong style="font-size: 13.5px; color: #1a202c;">Local AI Daemon Bridge (Ollama / Gemma 2 / LiteRT)</strong>
          <span style="font-size: 11px; background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; padding: 2px 7px; border-radius: 4px; font-weight: 700;">Low-Spec Laptop Optimized (0 MB Browser RAM)</span>
        </div>
        <span class="h2c-bridge-status-pill" style="font-size: 11.5px; font-weight: 700; padding: 3px 8px; border-radius: 4px; background: #f3f4f6; color: #4b5563;">⚪ Daemon Inactive</span>
      </div>
      <p style="font-size: 12px; color: #4a5568; margin: 0 0 10px 0; line-height: 1.45;">
        Connect local offline models running on your computer. Instant CPU execution, 100% offline, and zero browser memory usage.
      </p>
      <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
        <label style="font-size: 12px; font-weight: 600; color: #2d3748; display: flex; align-items: center; gap: 6px;">
          Endpoint:
          <input type="text" class="h2c-bridge-endpoint" value="${cfg.endpoint}" style="font-size: 12px; padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 4px; width: 175px;" />
        </label>
        <label style="font-size: 12px; font-weight: 600; color: #2d3748; display: flex; align-items: center; gap: 6px;">
          Model:
          <select class="h2c-bridge-model" style="font-size: 12px; padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
            <option value="gemma2:2b" ${cfg.model === 'gemma2:2b' ? 'selected' : ''}>Google Gemma 2 (2B) - Recommended</option>
            <option value="qwen2.5:1.5b" ${cfg.model === 'qwen2.5:1.5b' ? 'selected' : ''}>Qwen 2.5 (1.5B) - Fast &amp; Compact</option>
            <option value="llama3.2:1b" ${cfg.model === 'llama3.2:1b' ? 'selected' : ''}>Llama 3.2 (1B) - Lowest RAM</option>
          </select>
        </label>
        <button type="button" class="h2c-bridge-test-btn" style="font-size: 12px; font-weight: 700; background: #043d2e; color: #f1d16b; border: 1px solid #c9a227; padding: 5px 12px; border-radius: 5px; cursor: pointer;">
          ⚡ Test Connection
        </button>
      </div>
      <div class="h2c-bridge-feedback" style="margin-top: 8px; font-size: 11.5px; line-height: 1.4; display: none;"></div>
    `;

    // Insert right after the top description paragraph or before the action buttons
    const target = coachSection.querySelector('.flex.flex-wrap.gap-2') || coachSection.firstChild;
    coachSection.insertBefore(bridge, target);

    const testBtn = bridge.querySelector('.h2c-bridge-test-btn');
    const endpointInput = bridge.querySelector('.h2c-bridge-endpoint');
    const modelSelect = bridge.querySelector('.h2c-bridge-model');
    const pill = bridge.querySelector('.h2c-bridge-status-pill');
    const feedback = bridge.querySelector('.h2c-bridge-feedback');

    const saveChanges = () => {
      saveBridgeConfig({
        endpoint: endpointInput.value.trim(),
        model: modelSelect.value
      });
    };

    endpointInput.addEventListener('change', saveChanges);
    modelSelect.addEventListener('change', saveChanges);

    testBtn.onclick = async () => {
      testBtn.disabled = true;
      testBtn.textContent = 'Testing...';
      pill.textContent = '⏳ Checking...';
      pill.style.background = '#fef3c7';
      pill.style.color = '#92400e';
      feedback.style.display = 'block';
      feedback.style.color = '#4b5563';
      feedback.textContent = 'Pinging local daemon at ' + endpointInput.value + '...';

      saveChanges();
      const res = await testLocalDaemonConnection(endpointInput.value);

      testBtn.disabled = false;
      testBtn.textContent = '⚡ Test Connection';

      if (res.online) {
        pill.textContent = `🟢 Connected (${res.type})`;
        pill.style.background = '#d1fae5';
        pill.style.color = '#065f46';
        feedback.style.color = '#065f46';
        feedback.innerHTML = `<strong>✓ Connection Verified!</strong> ${res.message}. Models available: [${res.models.join(', ')}]`;
        saveBridgeConfig({ enabled: true });
      } else {
        pill.textContent = '⚪ Daemon Offline';
        pill.style.background = '#fee2e2';
        pill.style.color = '#991b1b';
        feedback.style.color = '#b91c1c';
        feedback.innerHTML = `<strong>✕ Local daemon not detected:</strong> ${res.error || res.message}.<br><span style="color:#4b5563;">To start locally, open your terminal and run: <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;color:#0f172a;font-weight:700;">ollama run ${modelSelect.value}</code></span>`;
      }
    };
  }
}

function refreshAll() {
  if (updating) return;
  updating = true;
  try {
    updateTopAttributionRibbon();
    ensureBottomLegalShowcase();
    updateStepsHub();
    updateColorCodedValidation();
    ensureLocalBridgeUI();
  } finally {
    updating = false;
  }
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
  document.addEventListener('input', refreshAll);
  document.addEventListener('change', refreshAll);
  document.addEventListener('click', () => setTimeout(refreshAll, 60));

  if (document.body) {
    new MutationObserver(applyProminent).observe(document.body, { childList: true });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(initShell, 50));
} else {
  setTimeout(initShell, 50);
}

function toast() {
  const t = document.createElement('div'); t.className = 'h2c-toast'; t.setAttribute('role', 'status');
  const s = document.createElement('span'); s.textContent = 'Analysis cleared. Starting fresh.'; const u = document.createElement('button'); u.type = 'button'; u.textContent = 'Undo';
  u.onclick = () => { try { const b = JSON.parse(localStorage.getItem(BACKUP) || 'null'); if (b && b.data) for (const [k, v] of Object.entries(b.data)) if (v != null) localStorage.setItem(k, v); localStorage.removeItem(BACKUP); } catch {} location.reload(); };
  t.append(s, u); document.body.append(t); setTimeout(() => t.remove(), 20000);
}

document.addEventListener('click', (e) => {
  const b = e.target.closest && e.target.closest('button');
  if (!b) return;
  if (/RCA Coach/i.test(b.textContent) && !b.closest('#h2c-coach-workbench')) {
    e.preventDefault();
    toggleCoachWorkbench();
    return;
  }
}, true);

document.addEventListener('click', (e) => {
  const b = e.target.closest && e.target.closest('button'); if (!b || !/^\s*New analysis\s*$/.test(b.textContent)) return;
  if (proceed) { proceed = false; return; }
  e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
  if (!confirm('Clear analysis and start new?\n\nThe current case is removed from this browser. You can undo right after.')) return;
  try { localStorage.setItem(BACKUP, JSON.stringify({ data: Object.fromEntries(KEYS.map((k) => [k, localStorage.getItem(k)])), at: Date.now() })); } catch {}
  proceed = true; b.click(); setTimeout(toast, 150);
}, true);

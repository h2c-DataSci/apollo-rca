// Thin shell around the Grok Build app: one-click "New analysis" with confirm + undo,
// interactive lively 7-step Apollo RCA workflow hub, and real-time color-coded validation.

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

/* Bold Red Disclosure & Legal Attribution Banner */
.h2c-legal-banner {
  margin-bottom: 1.5rem;
  background: #fff8f8;
  border: 2px solid #dc2626;
  border-left: 8px solid #b91c1c;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 4px 18px rgba(220, 38, 38, 0.08), 0 1px 3px rgba(0,0,0,0.04);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #7f1d1d;
  line-height: 1.5;
}
.h2c-legal-topline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1.5px dashed #fca5a5;
}
.h2c-legal-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #dc2626;
  color: #ffffff;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 5px 12px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(220, 38, 38, 0.25);
}
.h2c-legal-subbadge {
  font-size: 11px;
  font-weight: 800;
  color: #dc2626;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.h2c-legal-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.h2c-legal-bold-red {
  color: #dc2626;
  font-weight: 800;
  letter-spacing: 0.02em;
}
.h2c-legal-author-box {
  background: #ffffff;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px 14px;
}
.h2c-legal-author-text {
  margin: 4px 0 8px 0;
  font-size: 13.5px;
  color: #991b1b;
  line-height: 1.5;
}
.h2c-legal-book-list {
  list-style: none;
  padding-left: 0;
  margin: 6px 0 10px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #991b1b;
}
.h2c-legal-book-list li {
  padding-left: 8px;
  border-left: 3px solid #dc2626;
  font-weight: 600;
}
.h2c-legal-tm-text {
  margin: 0;
  font-size: 12px;
  color: #b91c1c;
  line-height: 1.45;
  background: #fef2f2;
  padding: 6px 10px;
  border-radius: 6px;
}
.h2c-legal-official-box {
  background: linear-gradient(180deg, #fff5f5 0%, #fee2e2 100%);
  border: 2px solid #ef4444;
  border-radius: 8px;
  padding: 14px 16px;
}
.h2c-legal-official-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.h2c-official-icon {
  font-size: 22px;
  line-height: 1;
}
.h2c-legal-official-desc {
  margin: 4px 0 10px 0;
  font-size: 13px;
  color: #7f1d1d;
  font-weight: 600;
  line-height: 1.45;
}
.h2c-legal-cta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.h2c-legal-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(180deg, #dc2626 0%, #b91c1c 100%);
  color: #ffffff !important;
  font-weight: 800;
  font-size: 13.5px;
  padding: 9px 18px;
  border-radius: 8px;
  text-decoration: none !important;
  box-shadow: 0 3px 10px rgba(185, 28, 28, 0.3);
  transition: all 0.2s ease;
}
.h2c-legal-cta-btn:hover {
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(185, 28, 28, 0.4);
}
.h2c-legal-safeharbor {
  border-top: 1.5px solid #fecaca;
  padding-top: 10px;
}
.h2c-legal-safeharbor-text {
  margin: 4px 0;
  font-size: 11.5px;
  color: #991b1b;
  line-height: 1.45;
}
.h2c-header-disclosure {
  width: 100%;
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

function updateHeaderDisclosure() {
  const sub = document.querySelector('header p.text-muted');
  if (sub && !document.querySelector('.h2c-header-disclosure')) {
    const d = document.createElement('div');
    d.className = 'h2c-header-disclosure';
    d.innerHTML = `
      <div style="margin-top: 8px; padding: 7px 12px; background: #fff5f5; border: 1.5px solid #dc2626; border-radius: 6px; font-size: 12px; line-height: 1.45; color: #991b1b;">
        <strong style="color: #dc2626; font-size: 12px;">⚖️ BOLD RED DISCLOSURE:</strong>
        <span style="font-weight: 700; color: #b91c1c;">Independent educational prototype ("vibe coded work").</span>
        Credit to original author <strong>Dean L. Gano</strong> (<em>"Apollo Root Cause Analysis"</em> &amp; <em>"RealityCharting"</em> books).
        Apollo RCA&trade; and RealityCharting&reg; are trademarks of Dean L. Gano / Apollonian Publications, LLC.
        Not affiliated with or endorsed by the original author.
        For official software instead of this vibe coded work, visit:
        <a href="https://realitycharting.com/home/" target="_blank" rel="noopener noreferrer" style="color: #dc2626; font-weight: 800; text-decoration: underline; display: inline-flex; align-items: center; gap: 4px;">
          https://realitycharting.com/home/ &rarr;
        </a>
      </div>
    `;
    sub.parentNode.appendChild(d);
  }
}

function ensureLegalBanner() {
  const target = document.querySelector('.h2c-workflow-hub') || document.querySelector('ol.grid-cols-2, ol.sm\\:grid-cols-7');
  if (!target || !target.parentNode) return;

  let banner = document.querySelector('.h2c-legal-banner');
  if (!banner) {
    banner = document.createElement('section');
    banner.className = 'no-print h2c-legal-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Legal disclosure and trademark attribution');
    target.parentNode.insertBefore(banner, target);
  }

  if (banner && !banner.dataset.rendered) {
    banner.dataset.rendered = 'true';
    banner.innerHTML = `
      <div class="h2c-legal-topline">
        <div class="h2c-legal-badge">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          MANDATORY LEGAL DISCLOSURE &amp; TRADEMARK ATTRIBUTION
        </div>
        <span class="h2c-legal-subbadge">NOMINATIVE FAIR USE &bull; INDEPENDENT OPEN-SOURCE EXPERIMENT</span>
      </div>

      <div class="h2c-legal-body">
        <div class="h2c-legal-author-box">
          <p class="h2c-legal-bold-red" style="margin: 0 0 4px 0; font-size: 13.5px;">
            ATTRIBUTION TO ORIGINAL AUTHOR &amp; TRADEMARK CREDIT:
          </p>
          <p class="h2c-legal-author-text">
            Root Cause Analysis principles and the RealityCharting methodology were created and authored by <strong>Dean L. Gano</strong>, author of the acclaimed books:
          </p>
          <ul class="h2c-legal-book-list">
            <li>📖 <em>"Apollo Root Cause Analysis: A New Way of Thinking"</em> (Apollonian Publications)</li>
            <li>📖 <em>"RealityCharting: Seven Steps to Effective Problem-Solving and Strategies for Personal Success"</em></li>
          </ul>
          <p class="h2c-legal-tm-text">
            <strong>"Apollo Root Cause Analysis"</strong>, <strong>"Apollo RCA"</strong>, <strong>"Reality Tree"</strong>, and <strong>"RealityCharting&reg;"</strong> are registered trademarks and intellectual property of <strong>Dean L. Gano</strong> and <strong>Apollonian Publications, LLC</strong>. All rights are fully reserved by the respective trademark owners.
          </p>
        </div>

        <div class="h2c-legal-official-box">
          <div class="h2c-legal-official-header">
            <span class="h2c-official-icon">📢</span>
            <div>
              <strong class="h2c-legal-bold-red" style="font-size: 13.5px;">RECOMMENDATION: USE THE OFFICIAL CERTIFIED SOFTWARE</strong>
              <p class="h2c-legal-official-desc">
                If you want to know more, master genuine certified methodology, or use the official enterprise software instead of this experimental vibe coded work, please visit the official website:
              </p>
            </div>
          </div>
          <div class="h2c-legal-cta-row">
            <a href="https://realitycharting.com/home/" target="_blank" rel="noopener noreferrer" class="h2c-legal-cta-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Go to Official RealityCharting&reg; Software &amp; Website (realitycharting.com) &rarr;
            </a>
          </div>
        </div>

        <div class="h2c-legal-safeharbor">
          <p class="h2c-legal-bold-red" style="font-size: 12px; margin-bottom: 4px;">
            LEGAL NON-AFFILIATION, SAFE HARBOR &amp; DISCLAIMER OF CLAIMS:
          </p>
          <p class="h2c-legal-safeharbor-text">
            This web tool (<em>H2C Root Cause Analyst</em>) is an independent, non-commercial open-source experimental prototype ("vibe coded work") developed by Engr. Harold Henry G. Cabanilla (h2c_Creates / h2c-DataSci) strictly for educational, personal research, and community demonstration purposes under the MIT License. It is <strong>NOT</strong> affiliated with, endorsed by, sponsored by, authorized by, or in any way officially connected with <strong>Dean L. Gano</strong>, <strong>Apollonian Publications, LLC</strong>, or <strong>RealityCharting.com</strong>.
          </p>
          <p class="h2c-legal-safeharbor-text">
            No proprietary source code, copyrighted illustrations, or certified training materials from Apollonian Publications, LLC have been used or reproduced. All methodology references are made strictly under <strong>Nominative Fair Use (15 U.S.C. &sect; 1125 / Lanham Act)</strong> for descriptive identification. All trademarks belong to their respective holders. Provided strictly "AS IS" without warranty of any kind.
          </p>
        </div>
      </div>
    `;
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

function refreshAll() {
  if (updating) return;
  updating = true;
  try {
    updateHeaderDisclosure();
    ensureLegalBanner();
    updateStepsHub();
    updateColorCodedValidation();
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
  const b = e.target.closest && e.target.closest('button'); if (!b || !/^\s*New analysis\s*$/.test(b.textContent)) return;
  if (proceed) { proceed = false; return; }
  e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
  if (!confirm('Clear analysis and start new?\n\nThe current case is removed from this browser. You can undo right after.')) return;
  try { localStorage.setItem(BACKUP, JSON.stringify({ data: Object.fromEntries(KEYS.map((k) => [k, localStorage.getItem(k)])), at: Date.now() })); } catch {}
  proceed = true; b.click(); setTimeout(toast, 150);
}, true);

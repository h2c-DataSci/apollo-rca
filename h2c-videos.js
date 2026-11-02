// 7 YouTube Video Training Companion for Apollo RCA & RealityCharting Methodology
// Features: Toolbar button (? Help-style), Floating Action Button,
// Slide-out Video Training Drawer, 7 Step Video Cards with responsive 16:9
// YouTube player embeds, duration badges, methodology summaries, and configurable URLs.

const STORAGE_KEY = 'h2c-youtube-training-videos-v1';

export const VIDEO_MODULES = [
  {
    step: 1,
    episode: 'Episode 1 of 7',
    title: 'Episode 1 of 7: Introduction & Fundamentals of Apollo Root Cause Analysis (The Root Cause Myth)',
    shortTitle: 'Introduction & Fundamentals',
    subtitle: 'The Root Cause Myth, causal principles, and foundational Apollo RCA thinking',
    duration: '11:45',
    defaultYtId: 'IXXgr85wO74', // Official Video 1: https://youtu.be/IXXgr85wO74
    targetId: 'section-define',
    summary: 'Dismantle the single root cause myth: problems are never caused by a single isolated event, but by a confluence of necessary and sufficient causes. Master foundational causal principles before charting.',
    keyPoints: [
      'Dismantle the single root cause myth: causation is a continuous web of actions and conditions.',
      'Principles of cause-and-effect: causes and effects are the same thing viewed at different moments in time.',
      'An effect is always caused by at least two causes: an action cause and a condition cause.',
      'Establishing the blameless, fact-based Apollo RCA mindset across the investigation team.'
    ]
  },
  {
    step: 2,
    episode: 'Episode 2 of 7',
    title: 'Episode 2 of 7: Defining the Problem — The 4-Element Formula Without Placing Blame',
    shortTitle: 'Defining the Problem',
    subtitle: 'The 4-Element Formula (What, Where, When, Significance) without placing blame',
    duration: '14:20',
    defaultYtId: 'tCQuu_rvSJ8', // Official Video 2: https://youtu.be/tCQuu_rvSJ8
    targetId: 'section-define',
    summary: 'Master the 4-element problem definition formula: Primary Effect (What), Location (Where), Time (When), and Actual/Potential Significance. Never place blame or ask "why".',
    keyPoints: [
      'State the primary effect as an observed noun-verb outcome (e.g., "Oil Released").',
      'Keep statements strictly to 2–4 words; avoid run-on sentences or compound clauses.',
      'Zero Blame Rule: Never name people or assign blame in the problem definition (Principles P05 & P06).',
      'Define exact facility/equipment location, precise timestamp, and operational significance.'
    ]
  },
  {
    step: 3,
    episode: 'Episode 3 of 7',
    title: 'Episode 3 of 7: Causal Relationships & The RealityChart (Actions, Conditions, and Stop Reasons)',
    shortTitle: 'Causal Relationships & RealityChart',
    subtitle: 'Actions, Conditions, Cause Sets, AND/OR logic gates, and Stop Reasons',
    duration: '18:50',
    defaultYtId: '8y501jMIS7k', // Official Video 3: https://youtu.be/8y501jMIS7k
    targetId: 'realitychart',
    summary: 'Construct the RealityChart by pairing action causes with condition causes at each causal step. Connect effects to causes using strict AND/OR logic, and identify valid stop reasons.',
    keyPoints: [
      'Causal sets: Every effect requires an action cause co-existing with one or more condition causes.',
      'AND logic: Both the action and condition must be present simultaneously for the effect to occur.',
      'Branching & Hypotheses: Use OR branches for competing possibilities with evidence tags.',
      'Valid Stop reasons: Physical laws, outside sphere of control, or non-preventable conditions.'
    ]
  },
  {
    step: 4,
    episode: 'Episode 4 of 7',
    title: 'Episode 4 of 7: Evidence; Sufficient and Necessary — How to Test and Prove Causes',
    shortTitle: 'Evidence: Sufficient & Necessary',
    subtitle: 'Necessary & sufficient testing, 4 quality tiers, proving and corroborating causes',
    duration: '13:15',
    defaultYtId: 'lppZuZFyHzM', // Official Video 4: https://youtu.be/lppZuZFyHzM
    targetId: 'section-evidence',
    summary: 'Rigorously test causes using necessary and sufficient logic. Gather, anchor, and tier physical and data evidence across all 4 quality levels to prove causal claims.',
    keyPoints: [
      'The Necessity Test: If this cause did not exist, could the effect still occur?',
      'The Sufficiency Test: Do all identified causes completely produce the effect?',
      '4 Evidence Quality Tiers: Sensed (Tier 1 direct physical), Inferred (Tier 2 data/logs), Intuited (Tier 3 expert), and Emotional (Tier 4 unverified).',
      'Hypothesis Corroboration: Unverified theories never become findings without evidentiary proof.'
    ]
  },
  {
    step: 5,
    episode: 'Episode 5 of 7',
    title: 'Episode 5 of 7: Effective Solutions, Implementation, and Tracking (Preventing Recurrence)',
    shortTitle: 'Effective Solutions & Tracking',
    subtitle: 'Targeted corrective actions, 4 prevention criteria, owner tracking, and ROI verification',
    duration: '15:10',
    defaultYtId: 'PLACEHOLDER_EPISODE5',
    targetId: 'section-solutions',
    summary: 'Formulate corrective solutions that break specific causal paths. Evaluate actions against the four prevention criteria, assign owners, and track implementation to prevent recurrence.',
    keyPoints: [
      'Target action or condition causes directly to eliminate causal linkages permanently.',
      'Score each solution against the 4 Prevention Criteria: recurrence prevention, sphere of control, ROI, and no new hazards.',
      'Assign single accountable owners, firm completion dates, and measurable milestones.',
      'Schedule 30/60/90-day post-implementation effectiveness reviews to guarantee sustained control.'
    ]
  },
  {
    step: 6,
    episode: 'Episode 6 of 7',
    title: 'Episode 6 of 7: Culture and Facilitation — Fix the Cause, Not the Blame',
    shortTitle: 'Culture & Facilitation',
    subtitle: 'Facilitating blameless investigations, team alignment, and overcoming organizational resistance',
    duration: '16:30',
    defaultYtId: 'PLACEHOLDER_EPISODE6',
    targetId: 'section-timeline',
    summary: 'Build an organizational culture focused on fixing causes rather than assigning human blame. Facilitate collaborative inquiry, team alignment, and transparent evidence-based analysis.',
    keyPoints: [
      'Shift organization culture from "Who made the mistake?" to "What conditions allowed the failure?".',
      'Facilitation techniques: Keep cross-functional teams aligned on objective reality charting.',
      'Overcome defensiveness and finger-pointing using structured, non-judgmental causal questions.',
      'Principle P05: Human beings are never the root cause; human actions are caused by systems and conditions.'
    ]
  },
  {
    step: 7,
    episode: 'Episode 7 of 7',
    title: 'Episode 7 of 7: Success and a New Way of Thinking (Why Success Is Planned)',
    shortTitle: 'Success & A New Way of Thinking',
    subtitle: 'Proactive problem-solving, planning success, and institutionalizing Apollo RCA mastery',
    duration: '14:45',
    defaultYtId: 'PLACEHOLDER_EPISODE7',
    targetId: 'section-track',
    summary: 'Transform problem-solving from reactive firefighting into proactive success planning. Apply Apollo RCA principles to design reliable future systems and institutionalize mastery.',
    keyPoints: [
      'Success and failure share identical causal mechanisms: success is planned, not accidental.',
      'Apply causal charting proactively during design, capital projects, and operational planning.',
      'Institutionalize lessons learned across the organization to prevent cross-facility recurrence.',
      'Cultivate an enterprise-wide culture of scientific inquiry, verifiable evidence, and systemic prevention.'
    ]
  }
];

function getStoredVideos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    // Ensure newly assigned official video IDs take effect over legacy placeholders
    VIDEO_MODULES.forEach(m => {
      if (!data[m.step] || data[m.step] === 'dQw4w9WgXcQ' || (data[m.step].startsWith('PLACEHOLDER') && !m.defaultYtId.startsWith('PLACEHOLDER'))) {
        data[m.step] = m.defaultYtId;
      }
    });
    return data;
  } catch {
    const defaults = {};
    VIDEO_MODULES.forEach(m => defaults[m.step] = m.defaultYtId);
    return defaults;
  }
}

function saveVideoId(stepNum, ytId) {
  try {
    const data = getStoredVideos();
    data[stepNum] = ytId.trim();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

const css = document.createElement('style');
css.textContent = `
/* Floating Video Academy Button */
.h2cv-fab {
  position: fixed;
  left: 104px;
  bottom: 16px;
  z-index: 9998;
  background: linear-gradient(180deg, #b91c1c 0%, #991b1b 100%);
  color: #ffffff;
  border: 2px solid #ef4444;
  border-radius: 999px;
  padding: 10px 15px;
  font: 700 13px system-ui, -apple-system, sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(185, 28, 28, 0.4);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}
.h2cv-fab:hover {
  background: linear-gradient(180deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(185, 28, 28, 0.5);
}
.h2cv-fab:focus-visible, .h2cv-tb:focus-visible, .h2cv-x:focus-visible {
  outline: 3px solid #f6dd7a;
  outline-offset: 2px;
}

/* Toolbar Video Button */
.h2cv-tb {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1.5px solid #dc2626;
  color: #b91c1c;
  font-weight: 700;
  font-size: 13.5px;
  border-radius: 6px;
  padding: 0 14px;
  height: 44px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.h2cv-tb:hover {
  background: #fef2f2;
  border-color: #b91c1c;
  color: #991b1b;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.18);
}

/* Slide-out Panel Overlay & Container */
.h2cv-back {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
  z-index: 9998;
}
.h2cv-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(600px, 100vw);
  background: #fffdfa;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  border-left: 4px solid #dc2626;
  box-shadow: -8px 0 28px rgba(0, 0, 0, 0.35);
  font: 14px/1.5 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #14261c;
}
.h2cv-head {
  background: linear-gradient(180deg, #991b1b 0%, #7f1d1d 100%);
  color: #ffffff;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 2px solid #ef4444;
}
.h2cv-head-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.h2cv-head h2 {
  margin: 0;
  font: 700 17px system-ui, sans-serif;
  color: #ffffff;
}
.h2cv-head p {
  margin: 2px 0 0;
  font-size: 11.5px;
  color: #fca5a5;
}
.h2cv-x {
  background: #ffffff;
  color: #991b1b;
  border: 0;
  border-radius: 6px;
  padding: 6px 12px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}
.h2cv-x:hover {
  background: #fee2e2;
  transform: scale(1.05);
}

/* Step Filter Tabs */
.h2cv-tabs {
  display: flex;
  gap: 6px;
  padding: 10px 14px;
  background: #fbf7ee;
  border-bottom: 1px solid #e6d7a8;
  overflow-x: auto;
  white-space: nowrap;
}
.h2cv-tab-btn {
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid #d4c595;
  background: #ffffff;
  font: 700 12px system-ui;
  color: #043d2e;
  cursor: pointer;
  transition: all 0.15s ease;
}
.h2cv-tab-btn:hover {
  background: #f5eed6;
  border-color: #8c6a1a;
}
.h2cv-tab-btn.active {
  background: #dc2626;
  color: #ffffff;
  border-color: #b91c1c;
  box-shadow: 0 2px 6px rgba(220, 38, 38, 0.25);
}

/* Scrollable Body */
.h2cv-body {
  overflow-y: auto;
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Video Module Card */
.h2cv-card {
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-margin-top: 10px;
}
.h2cv-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.h2cv-step-pill {
  background: #dc2626;
  color: #ffffff;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
}
.h2cv-duration-badge {
  background: #f3f4f6;
  color: #4b5563;
  font-weight: 700;
  font-size: 11.5px;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}
.h2cv-card-title {
  margin: 6px 0 2px;
  font: 700 16px/1.3 Georgia, serif;
  color: #111827;
}
.h2cv-card-sub {
  margin: 0;
  font-size: 12.5px;
  color: #6b7280;
}

/* 16:9 Video Player Container */
.h2cv-player-box {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #0f172a;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}
.h2cv-screen {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #1e293b 0%, #090d16 100%);
  color: #ffffff;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  position: relative;
  user-select: none;
}
.h2cv-play-btn {
  width: 68px;
  height: 48px;
  background: #dc2626;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.6);
  transition: transform 0.2s ease, background 0.2s ease;
  margin-bottom: 8px;
}
.h2cv-screen:hover .h2cv-play-btn {
  transform: scale(1.12);
  background: #ef4444;
}
.h2cv-play-arrow {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 10px 0 10px 18px;
  border-color: transparent transparent transparent #ffffff;
  margin-left: 4px;
}
.h2cv-screen-title {
  font: 700 13px system-ui;
  color: #f3f4f6;
  margin-bottom: 4px;
}
.h2cv-screen-hint {
  font-size: 11px;
  color: #9ca3af;
}
.h2cv-screen-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

/* Summary & Key Points */
.h2cv-summary-box {
  background: #fbf7ee;
  border: 1px solid #e6d7a8;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 12.5px;
  color: #374151;
}
.h2cv-key-points {
  margin: 6px 0 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 12px;
  color: #4b5563;
}

/* Card Actions */
.h2cv-card-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 6px;
  border-top: 1px solid #f3f4f6;
}
.h2cv-jump-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #043d2e;
  color: #f1d16b;
  border: 1px solid #c9a227;
  border-radius: 6px;
  padding: 6px 12px;
  font: 700 12px system-ui;
  cursor: pointer;
  transition: all 0.15s ease;
}
.h2cv-jump-btn:hover {
  background: #0a5c45;
  color: #ffffff;
}
.h2cv-edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ffffff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 10px;
  font: 600 11.5px system-ui;
  cursor: pointer;
  transition: all 0.15s ease;
}
.h2cv-edit-btn:hover {
  color: #111827;
  border-color: #9ca3af;
}

/* Footer in Panel */
.h2cv-foot {
  background: #fbf7ee;
  border-top: 2px solid #e6d7a8;
  padding: 12px 16px;
  font-size: 12px;
  color: #4b5a53;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
`;

let panel, back, fab, lastFocus;

export function closeVideoDrawer() {
  panel?.remove();
  back?.remove();
  panel = back = null;
  lastFocus?.focus();
}

function parseYouTubeId(input) {
  if (!input) return null;
  input = input.trim();
  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  // youtu.be/ID
  const m1 = input.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (m1) return m1[1];
  // youtube.com/watch?v=ID
  const m2 = input.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (m2) return m2[1];
  // youtube.com/embed/ID
  const m3 = input.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
  if (m3) return m3[1];
  return null;
}

export function openVideoDrawer(targetStep = null) {
  if (panel) {
    if (targetStep) scrollToStep(targetStep);
    return;
  }
  lastFocus = document.activeElement;

  back = document.createElement('div');
  back.className = 'h2cv-back';
  back.onclick = closeVideoDrawer;

  panel = document.createElement('aside');
  panel.className = 'h2cv-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', '7 Official Methodology Training Video Episodes');

  // Header
  const head = document.createElement('div');
  head.className = 'h2cv-head';
  head.innerHTML = `
    <div class="h2cv-head-title">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true"><path d="M21.58 7.19a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.68.49a2.7 2.7 0 0 0-1.9 1.9A28.4 28.4 0 0 0 2 12a28.4 28.4 0 0 0 .42 4.81 2.7 2.7 0 0 0 1.9 1.9C6 19.2 12 19.2 12 19.2s6 0 7.68-.49a2.7 2.7 0 0 0 1.9-1.9A28.4 28.4 0 0 0 22 12a28.4 28.4 0 0 0-.42-4.81ZM9.8 15.33V8.67L15.6 12l-5.8 3.33Z"/></svg>
      <div>
        <h2>Apollo RCA Methodology Video Series</h2>
        <p>Official 7-Episode Video Companion Series for Apollo RCA &amp; RealityCharting by Dean L. Gano</p>
      </div>
    </div>
  `;
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'h2cv-x';
  closeBtn.textContent = 'Close ✕';
  closeBtn.onclick = closeVideoDrawer;
  head.appendChild(closeBtn);

  // Tabs
  const tabs = document.createElement('div');
  tabs.className = 'h2cv-tabs';
  
  const allTab = document.createElement('button');
  allTab.type = 'button';
  allTab.className = 'h2cv-tab-btn' + (!targetStep ? ' active' : '');
  allTab.textContent = 'All 7 Episodes';
  allTab.onclick = () => filterStep(null);
  tabs.appendChild(allTab);

  VIDEO_MODULES.forEach(mod => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'h2cv-tab-btn' + (targetStep === mod.step ? ' active' : '');
    btn.textContent = `Ep ${mod.step}`;
    btn.title = mod.title;
    btn.onclick = () => filterStep(mod.step);
    tabs.appendChild(btn);
  });

  // Body
  const body = document.createElement('div');
  body.className = 'h2cv-body';

  function renderCards(filterNum = null) {
    body.innerHTML = '';
    const stored = getStoredVideos();
    const list = filterNum ? VIDEO_MODULES.filter(m => m.step === filterNum) : VIDEO_MODULES;

    list.forEach(mod => {
      const card = document.createElement('article');
      card.className = 'h2cv-card';
      card.id = `h2cv-step-card-${mod.step}`;

      const ytId = stored[mod.step] || mod.defaultYtId;
      const isPlaceholder = ytId.startsWith('PLACEHOLDER') || ytId === 'dQw4w9WgXcQ';

      const jumpLabels = {
        1: '🎯 Jump to Problem Definition in Workspace &rarr;',
        2: '🎯 Jump to Problem Definition in Workspace &rarr;',
        3: '🎯 Jump to Reality Tree in Workspace &rarr;',
        4: '🎯 Jump to Evidence Tiers in Workspace &rarr;',
        5: '🎯 Jump to Solutions Action Matrix &rarr;',
        6: '🎯 Jump to Timeline & Event Sequencing &rarr;',
        7: '🎯 Jump to Tracking & Reports &rarr;'
      };

      card.innerHTML = `
        <div class="h2cv-card-header">
          <span class="h2cv-step-pill">${mod.episode}</span>
          <span class="h2cv-duration-badge">⏱ ${mod.duration} • HD</span>
        </div>
        <div>
          <h3 class="h2cv-card-title">${mod.title}</h3>
          <p class="h2cv-card-sub">${mod.subtitle}</p>
        </div>

        <div class="h2cv-player-box" id="h2cv-player-box-${mod.step}">
          <div class="h2cv-screen" role="button" tabindex="0" aria-label="Play video for ${mod.title}">
            <div class="h2cv-play-btn">
              <div class="h2cv-play-arrow"></div>
            </div>
            <div class="h2cv-screen-title">${mod.title}</div>
            <div class="h2cv-screen-hint">${isPlaceholder ? '▶ Click to preview / configure YouTube link' : '▶ Click to play official YouTube video'}</div>
            <span class="h2cv-screen-duration">${mod.duration}</span>
          </div>
        </div>

        <div class="h2cv-summary-box">
          <strong>Methodology Focus:</strong> ${mod.summary}
          <ul class="h2cv-key-points">
            ${mod.keyPoints.map(kp => `<li>• ${kp}</li>`).join('')}
          </ul>
        </div>

        <div class="h2cv-card-actions">
          <button type="button" class="h2cv-jump-btn" data-target="${mod.targetId}">
            ${jumpLabels[mod.step] || `🎯 Jump to Step ${mod.step} in Workspace &rarr;`}
          </button>
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
            <a href="https://youtu.be/${ytId}" target="_blank" rel="noopener noreferrer" class="h2cv-yt-link-btn" style="display: inline-flex; align-items: center; gap: 5px; background: #fff5f5; border: 1px solid #fca5a5; color: #dc2626; border-radius: 6px; padding: 6px 10px; font: 700 11.5px system-ui; text-decoration: none;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#dc2626" aria-hidden="true"><path d="M21.58 7.19a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.68.49a2.7 2.7 0 0 0-1.9 1.9A28.4 28.4 0 0 0 2 12a28.4 28.4 0 0 0 .42 4.81 2.7 2.7 0 0 0 1.9 1.9C6 19.2 12 19.2 12 19.2s6 0 7.68-.49a2.7 2.7 0 0 0 1.9-1.9A28.4 28.4 0 0 0 22 12a28.4 28.4 0 0 0-.42-4.81ZM9.8 15.33V8.67L15.6 12l-5.8 3.33Z"/></svg>
              Watch on YouTube &rarr;
            </a>
            <button type="button" class="h2cv-edit-btn" data-step="${mod.step}">
              ✏️ Edit URL
            </button>
          </div>
        </div>
      `;

      // Play button click handler
      const screen = card.querySelector('.h2cv-screen');
      screen.onclick = () => {
        const box = card.querySelector(`#h2cv-player-box-${mod.step}`);
        if (!box) return;
        const currentId = getStoredVideos()[mod.step] || mod.defaultYtId;
        box.innerHTML = `
          <iframe 
            src="https://www.youtube-nocookie.com/embed/${currentId}?autoplay=1&rel=0" 
            title="${mod.title}" 
            style="width: 100%; height: 100%; border: 0;" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        `;
      };

      // Jump to step
      const jumpBtn = card.querySelector('.h2cv-jump-btn');
      jumpBtn.onclick = () => {
        closeVideoDrawer();
        const el = document.getElementById(mod.targetId) || 
          document.querySelector(`[data-step="${mod.step}"]`) ||
          document.querySelector('h2');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };

      // Edit YouTube ID
      const editBtn = card.querySelector('.h2cv-edit-btn');
      editBtn.onclick = () => {
        const current = getStoredVideos()[mod.step] || '';
        const input = prompt(
          `Enter the YouTube Video URL or 11-character Video ID for Episode ${mod.step} ("${mod.shortTitle}"):\n(e.g., https://youtu.be/dQw4w9WgXcQ or dQw4w9WgXcQ)`,
          current
        );
        if (input !== null) {
          const parsed = parseYouTubeId(input);
          if (parsed) {
            saveVideoId(mod.step, parsed);
            renderCards(filterNum);
            alert(`Episode ${mod.step} video updated to YouTube ID: ${parsed}`);
          } else if (input.trim() === '') {
            saveVideoId(mod.step, mod.defaultYtId);
            renderCards(filterNum);
          } else {
            alert('Could not recognize a valid YouTube Video ID or URL. Please check the link and try again.');
          }
        }
      };

      body.appendChild(card);
    });
  }

  function filterStep(num) {
    [...tabs.querySelectorAll('.h2cv-tab-btn')].forEach((btn, idx) => {
      if (num === null && idx === 0) btn.classList.add('active');
      else if (num !== null && idx === num) btn.classList.add('active');
      else btn.classList.remove('active');
    });
    renderCards(num);
  }

  function scrollToStep(stepNum) {
    filterStep(stepNum);
    setTimeout(() => {
      const card = body.querySelector(`#h2cv-step-card-${stepNum}`);
      card?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  renderCards(targetStep);

  // Footer
  const foot = document.createElement('div');
  foot.className = 'h2cv-foot';
  foot.innerHTML = `
    <span>7 Video Modules • Apollo RCA &amp; RealityCharting Academy</span>
    <a href="https://realitycharting.com/home/" target="_blank" rel="noopener noreferrer" style="color: #b91c1c; font-weight: 700; text-decoration: underline;">
      Official RealityCharting&reg; Website &rarr;
    </a>
  `;

  panel.append(head, tabs, body, foot);
  document.body.append(back, panel);
  closeBtn.focus();

  // Escape & Tab Trap
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeVideoDrawer();
    if (e.key === 'Tab') {
      const focusables = [...panel.querySelectorAll('button, input, [tabindex="0"]')];
      const i = focusables.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        focusables.at(-1)?.focus();
      } else if (!e.shiftKey && i === focusables.length - 1) {
        e.preventDefault();
        focusables[0]?.focus();
      }
    }
  });

  if (targetStep) {
    scrollToStep(targetStep);
  }
}

// Mount the Toolbar Button and Floating FAB
export function mountVideoButtons() {
  if (!document.body) return;

  // 1. Floating FAB (above ? Help)
  if (!fab || !fab.isConnected) {
    fab = document.createElement('button');
    fab.className = 'no-print h2cv-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Open 7-Step Methodology Training Videos');
    fab.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true"><path d="M21.58 7.19a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.68.49a2.7 2.7 0 0 0-1.9 1.9A28.4 28.4 0 0 0 2 12a28.4 28.4 0 0 0 .42 4.81 2.7 2.7 0 0 0 1.9 1.9C6 19.2 12 19.2 12 19.2s6 0 7.68-.49a2.7 2.7 0 0 0 1.9-1.9A28.4 28.4 0 0 0 22 12a28.4 28.4 0 0 0-.42-4.81ZM9.8 15.33V8.67L15.6 12l-5.8 3.33Z"/></svg>
      <span>▶ 7 Videos</span>
    `;
    fab.onclick = () => openVideoDrawer();
    document.body.append(fab);
  }

  // 2. Toolbar Button next to ? Help
  const helpBtn = document.querySelector('.h2ch-tb') || 
    [...document.querySelectorAll('button')].find(b => /^\s*\?\s*Help\s*$/.test(b.textContent));
  if (helpBtn && !document.querySelector('.h2cv-tb')) {
    const tbBtn = document.createElement('button');
    tbBtn.className = 'no-print h2cv-tb';
    tbBtn.type = 'button';
    tbBtn.setAttribute('aria-label', 'Open 7-Step Methodology Training Videos');
    tbBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#dc2626" aria-hidden="true"><path d="M21.58 7.19a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.68.49a2.7 2.7 0 0 0-1.9 1.9A28.4 28.4 0 0 0 2 12a28.4 28.4 0 0 0 .42 4.81 2.7 2.7 0 0 0 1.9 1.9C6 19.2 12 19.2 12 19.2s6 0 7.68-.49a2.7 2.7 0 0 0 1.9-1.9A28.4 28.4 0 0 0 22 12a28.4 28.4 0 0 0-.42-4.81ZM9.8 15.33V8.67L15.6 12l-5.8 3.33Z"/></svg>
      <span>▶ 7 Videos (Training)</span>
    `;
    tbBtn.onclick = () => openVideoDrawer();
    helpBtn.parentNode.insertBefore(tbBtn, helpBtn.nextSibling);
  }
}

export function initVideos() {
  if (!document.head.contains(css)) document.head.append(css);
  window.h2cOpenVideoDrawer = openVideoDrawer;
  mountVideoButtons();

  if (document.body) {
    new MutationObserver(() => {
      mountVideoButtons();
    }).observe(document.body, { childList: true, subtree: true });
  }
}

// Auto-run if loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(initVideos, 60));
} else {
  setTimeout(initVideos, 60);
}

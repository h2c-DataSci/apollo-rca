// Original inline SVG diagrams for Help (built with DOM APIs, no innerHTML). Not derived from any book or third-party image.
const NS = 'http://www.w3.org/2000/svg';
const C = { pe: '#111827', act: '#dc2626', con: '#16a34a', arrow: '#2563eb', gold: '#c9a227', em: '#0a5c45', ink: '#1b2a24', amber: '#d97706', cream: '#fffdf8', stop: '#d32f2f', unknown: '#fbc02d' };
const s = (t, a = {}, txt) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); if (txt != null) n.textContent = txt; return n; };
const box = (g, x, y, w, h, fill, label, fs = 13, tc = '#fff') => { g.append(s('rect', { x, y, width: w, height: h, rx: 8, fill }), s('text', { x: x + w / 2, y: y + h / 2 + fs / 3, 'text-anchor': 'middle', fill: tc, 'font-size': fs, 'font-weight': 700 }, label)); };
const arrow = (g, x1, y1, x2, y2) => g.append(s('line', { x1, y1, x2, y2, stroke: C.arrow, 'stroke-width': 2.5, 'marker-end': 'url(#ah)' }));
const txt = (g, x, y, t, fs = 12, fill = C.ink, anchor = 'middle', w = 400) => g.append(s('text', { x, y, 'text-anchor': anchor, 'font-size': fs, fill, 'font-weight': w }, t));
const balloon = (g, x, y, label, fill = C.gold, tc = '#043d2e') => g.append(s('circle', { cx: x, cy: y, r: 9, fill, stroke: '#8c6a1a' }), s('text', { x, y: y + 4, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: tc }, label));
function frame(label, h, build) {
  const svg = s('svg', { viewBox: `0 0 480 ${h}`, role: 'img', 'aria-label': label, width: '100%', style: 'max-width:100%;height:auto;background:#fffdf8;border:1px solid #e6d7a8;border-radius:10px;margin:6px 0;font-family:system-ui,sans-serif' });
  svg.append(s('title', {}, label));
  const d = s('defs'); const m = s('marker', { id: 'ah', markerWidth: 8, markerHeight: 8, refX: 7, refY: 4, orient: 'auto' }); m.append(s('path', { d: 'M0,0 L8,4 L0,8 z', fill: C.arrow })); d.append(m); svg.append(d);
  const g = s('g'); build(g); svg.append(g); return svg;
}
export const DIAGRAMS = {
  causeSet: () => frame('Diagram: a primary effect is caused by an action and a condition together', 190, (g) => {
    box(g, 20, 70, 130, 50, C.pe, 'Primary effect'); g.append(s('path', { d: 'M150 95 H215 V50 H260 M215 95 V145 H260', fill: 'none', stroke: C.arrow, 'stroke-width': 2.5, 'marker-end': 'url(#ah)' }));
    arrow(g, 215, 145, 262, 145); box(g, 265, 25, 150, 50, C.act, 'Action (trigger)'); box(g, 265, 120, 150, 50, C.con, 'Condition (state)');
    g.append(s('circle', { cx: 440, cy: 97, r: 16, fill: C.gold })); txt(g, 440, 102, 'AND', 11, '#043d2e', 'middle', 700); txt(g, 350, 100, 'both needed', 11, C.ink);
    txt(g, 240, 186, 'Read right to left: each effect needs an action and a condition together.', 11); }),
  steps: () => frame('Diagram: the seven steps from define to track', 200, (g) => {
    const n = ['1 Define', '2 Causes', '3 Chart', '4 Evidence', '5 Test', '6 Solutions', '7 Track']; n.forEach((t, i) => { const row = i < 4 ? 0 : 1, col = i < 4 ? i : i - 4, x = 15 + col * 115 + (row ? 57 : 0), y = 20 + row * 80; box(g, x, y, 105, 48, i % 2 ? C.em : '#0f7a5c', t, 13); if (i !== 3 && i !== 6) arrow(g, x + 105, y + 24, x + 115, y + 24); });
    g.append(s('path', { d: 'M440 68 V92 H72 V100', fill: 'none', stroke: C.arrow, 'stroke-width': 2.5, 'marker-end': 'url(#ah)' })); txt(g, 240, 175, 'Solutions are tracked, then the case is reviewed to confirm the problem stays solved.', 11); }),
  chain: () => frame('Diagram: a small cause chart with action, condition, evidence balloons and an unsupported question mark', 250, (g) => {
    box(g, 10, 100, 100, 44, C.pe, 'Oil released', 12); arrow(g, 110, 118, 145, 62); arrow(g, 110, 130, 145, 180);
    box(g, 148, 38, 120, 44, C.act, 'Seal failed', 12); box(g, 148, 158, 120, 44, C.con, 'Seal worn', 12);
    arrow(g, 268, 52, 300, 28); arrow(g, 268, 70, 300, 100); box(g, 302, 8, 120, 40, C.act, 'Pressure spike', 11); box(g, 302, 82, 120, 40, C.con, 'No relief path', 11);
    balloon(g, 440, 28, 'E1'); balloon(g, 440, 102, '?', C.unknown, '#000'); balloon(g, 288, 180, 'E2'); balloon(g, 288, 200, 'E3');
    g.append(s('line', { x1: 422, y1: 28, x2: 431, y2: 28, stroke: '#8c6a1a' }), s('line', { x1: 422, y1: 102, x2: 431, y2: 102, stroke: '#8c6a1a' }));
    txt(g, 240, 235, 'Black = effect, red = action, green = condition. Red octagon = STOP. Yellow = unknown. Gold = evidence.', 11); }),
  tests: () => frame('Diagram: three checks for each cause set', 170, (g) => {
    [['Sufficient?', 'Together, are the causes enough?'], ['Necessary?', 'Would it still happen without one?'], ['Same time + place?', 'Did they exist together?']].forEach((r, i) => { const x = 12 + i * 155; g.append(s('rect', { x, y: 20, width: 145, height: 100, rx: 10, fill: '#fff', stroke: C.gold, 'stroke-width': 2 })); txt(g, x + 72, 50, r[0], 14, C.em, 'middle', 700); const l = r[1].split(' '); const mid = Math.ceil(l.length / 2); txt(g, x + 72, 78, l.slice(0, mid).join(' '), 11); txt(g, x + 72, 94, l.slice(mid).join(' '), 11); });
    txt(g, 240, 150, 'Any "no" means a cause is missing or wrong. Revise the chart.', 12, C.act, 'middle', 700); }),
  status: () => frame('Diagram: text goes through rule checks to PASS, WARN or BLOCK, then the investigator decides', 210, (g) => {
    box(g, 10, 78, 90, 50, '#374151', 'Your text or AI draft', 11); arrow(g, 100, 103, 128, 103); box(g, 130, 78, 100, 50, C.em, 'Rule check', 13); 
    arrow(g, 230, 95, 268, 40); arrow(g, 230, 103, 268, 103); arrow(g, 230, 112, 268, 168);
    box(g, 270, 15, 90, 40, C.con, 'PASS', 13); box(g, 270, 83, 90, 40, C.amber, 'WARN', 13); box(g, 270, 148, 90, 40, C.act, 'BLOCK', 13);
    g.append(s('rect', { x: 382, y: 60, width: 92, height: 86, rx: 10, fill: '#fff', stroke: C.gold, 'stroke-width': 2 })); txt(g, 428, 82, 'Investigator', 12, C.em, 'middle', 700); txt(g, 428, 102, 'Accept', 11); txt(g, 428, 118, 'Modify', 11); txt(g, 428, 134, 'Reject', 11);
    arrow(g, 360, 35, 380, 80); arrow(g, 360, 103, 380, 103); txt(g, 372, 175, 'No accept', 10, C.act, 'middle', 700); txt(g, 372, 188, 'while BLOCK', 10, C.act, 'middle', 700); txt(g, 240, 205, 'Nothing enters the case until you accept.', 11); }),
  authority: () => frame('Diagram: four levels of authority, rules above the AI', 200, (g) => {
    [['L1 Deterministic rules', 'authoritative', C.em], ['L2 Integrity controls', 'authoritative', '#0f7a5c'], ['L3 Local AI', 'advisory only', '#8c6a1a'], ['L4 Investigator', 'final decision', '#043d2e']].forEach((r, i) => { const y = 14 + i * 44; g.append(s('rect', { x: 20 + i * 14, y, width: 440 - i * 28, height: 36, rx: 8, fill: r[2] })); txt(g, 36 + i * 14, y + 23, r[0], 13, '#fff', 'start', 700); txt(g, 444 - i * 14, y + 23, r[1], 12, '#f6dd7a', 'end', 700); });
    txt(g, 240, 192, 'AI never creates a finding on its own.', 11); }),
  leaf: () => frame('Diagram: three ways a branch can end', 150, (g) => {
    box(g, 10, 50, 100, 44, C.con, 'Last cause', 12);
    arrow(g, 110, 62, 170, 30); arrow(g, 110, 72, 170, 72); arrow(g, 110, 84, 170, 118);
    g.append(s('polygon', { points: '195,12 215,12 229,26 229,46 215,60 195,60 181,46 181,26', fill: C.stop, transform: 'translate(0,-6)' })); txt(g, 205, 38, 'STOP', 11, '#fff', 'middle', 700); txt(g, 330, 32, 'out of control / policy', 11, C.ink, 'middle');
    g.append(s('rect', { x: 181, y: 52, width: 48, height: 40, rx: 8, fill: C.unknown })); txt(g, 205, 78, '?', 20, '#000', 'middle', 700); txt(g, 330, 76, 'information is missing', 11);
    box(g, 175, 100, 60, 36, C.arrow, 'GOTO', 11); txt(g, 330, 122, 'continues on another chart', 11); }),
  actions: () => frame('Diagram: types of action from immediate fix to consequence reduction', 200, (g) => {
    [['Correction', 'fix what is wrong now'], ['Containment', 'limit the spread'], ['Corrective', 'remove a cause'], ['Preventive / system', 'fix the conditions behind many events'], ['Mitigation', 'reduce the consequence']].forEach((r, i) => { const y = 8 + i * 37; g.append(s('rect', { x: 15, y, width: 450, height: 31, rx: 7, fill: i === 2 || i === 3 ? C.em : '#374151' })); txt(g, 28, y + 20, r[0], 13, '#fff', 'start', 700); txt(g, 452, y + 20, r[1], 11, '#f6dd7a', 'end'); });
    txt(g, 240, 196, 'Green rows act on causes. Retraining alone rarely does for design or control gaps.', 10); }),
  tags: () => frame('Diagram: evidence quality tags from strongest to weakest', 150, (g) => {
    [['Sensed', 'seen, heard, measured', 0.95, C.con], ['Inferred', 'instruments, logs, calculation', 0.75, '#65a30d'], ['Intuited', 'a hunch', 0.35, C.amber], ['Emotional', 'a feeling', 0.15, C.act]].forEach((r, i) => { const y = 12 + i * 34; txt(g, 15, y + 17, r[0], 13, C.ink, 'start', 700); txt(g, 105, y + 17, r[1], 11, '#4b5a53', 'start'); g.append(s('rect', { x: 290, y, width: 180, height: 22, rx: 5, fill: '#e5e7eb' }), s('rect', { x: 290, y, width: 180 * r[2], height: 22, rx: 5, fill: r[3] })); });
    }),
};
export const DIAGRAM_FOR = { start: 'steps', seven: 'steps', cause: 'causeSet', colors: 'chain', chartuse: 'chain', leaf: 'leaf', evidence: 'tags', test: 'tests', status: 'status', rulecheck: 'status', coach: 'authority', localai: 'authority', actiontypes: 'actions', solutions: 'actions', gap: 'chain', first: 'steps' };

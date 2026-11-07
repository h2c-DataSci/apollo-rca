import { KB, KB_VERSION } from './help-kb.js?v=18';
import { DIAGRAMS, DIAGRAM_FOR } from './help-diagrams.js?v=18';
import './h2c-videos.js?v=18';
const SITE = 'https://www.haroldhenrycabanilla.com';
const css = document.createElement('style');
css.textContent = `
.h2ch-fab{position:fixed;left:16px;bottom:16px;z-index:9998;background:#043d2e;color:#f1d16b;border:2px solid #c9a227;border-radius:999px;padding:10px 16px;font:700 14px system-ui;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,.35)}
.h2ch-fab:focus-visible,.h2ch-x:focus-visible,.h2ch-item:focus-visible,.h2ch-s:focus-visible{outline:3px solid #c9a227;outline-offset:2px}
.h2ch-back{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:9998}
.h2ch-panel{position:fixed;top:0;right:0;bottom:0;width:min(480px,100vw);background:#fffdf8;z-index:9999;display:flex;flex-direction:column;border-left:3px solid #c9a227;box-shadow:-6px 0 24px rgba(0,0,0,.3);font:14px/1.5 system-ui;color:#1b2a24}
.h2ch-head{background:linear-gradient(180deg,#0a5c45,#043d2e);color:#f1d16b;padding:12px 14px;display:flex;align-items:center;gap:10px}
.h2ch-head h2{margin:0;font:700 17px Georgia,serif;flex:1}
.h2ch-x{background:#f1d16b;color:#043d2e;border:0;border-radius:6px;padding:6px 10px;font-weight:700;cursor:pointer}
.h2ch-s{margin:12px 14px 6px;padding:9px 10px;border:2px solid #c9a227;border-radius:8px;font-size:14px;background:#fff}
.h2ch-body{overflow:auto;padding:6px 14px 14px;flex:1}
.h2ch-cat{font:700 11px system-ui;letter-spacing:.08em;text-transform:uppercase;color:#8c6a1a;margin:14px 0 4px}
.h2ch-item{display:block;width:100%;text-align:left;background:#fff;border:1px solid #e6d7a8;border-radius:8px;padding:8px 10px;margin:4px 0;cursor:pointer;color:#043d2e;font-weight:600}
.h2ch-item small{display:block;font-weight:400;color:#4b5a53}
.h2ch-art h3{margin:6px 0;font:700 18px Georgia,serif;color:#043d2e}
.h2ch-art p{margin:8px 0}.h2ch-art button{margin-top:6px}
.h2ch-dev{border-top:3px solid #c9a227;background:#f4f1e6;padding:10px 14px;font-size:13px}
.h2ch-dev a{color:#0a5c45;font-weight:700}
.h2c-devfoot{background:linear-gradient(180deg,#0a5c45,#043d2e);color:#f1d16b;text-align:center;padding:12px 10px;font:14px system-ui;border-top:3px solid #c9a227}
.h2c-devfoot a{color:#f6dd7a;font-weight:700}`;

const el = (t, props = {}, ...kids) => { const n = Object.assign(document.createElement(t), props); n.append(...kids); return n; };
const devLine = () => { const d = el('span'); d.append('Developed by Engr. Harold Henry G. Cabanilla · ', el('a', { href: SITE, target: '_blank', rel: 'noopener noreferrer', textContent: 'www.haroldhenrycabanilla.com' })); return d; };

function ensureFoot() {
  if (document.querySelector('.h2c-devfoot') || !document.body) return;
  const f = el('footer', { className: 'h2c-devfoot' });
  const row1 = el('div', {}, 'H2C Root Cause Analyst · h2c_Creates · ', devLine());
  const row2 = el('div', { style: 'font-size: 11px; margin-top: 5px; color: #fdf6d8; line-height: 1.4;' },
    'Trademarks Notice: Apollo RCA™ & RealityCharting® are registered trademarks of Apollonian Publications, LLC / Dean L. Gano. ',
    'This vibe coded work is an independent educational prototype, not affiliated with or endorsed by them. ',
    'For the official certified enterprise software, visit: ',
    el('a', { href: 'https://realitycharting.com/home/', target: '_blank', rel: 'noopener noreferrer', style: 'color: #ffffff; font-weight: 700; text-decoration: underline;' }, 'realitycharting.com')
  );
  f.append(row1, row2);
  document.body.append(f);
}
let panel, back, fab, lastFocus;
const score = (a, terms) => { const h = (a.title + ' ' + a.tags).toLowerCase(), b = a.body.toLowerCase(); let s = 0; for (const t of terms) { if (h.includes(t)) s += 5; if (b.includes(t)) s += 1; else if (!h.includes(t)) return 0; } return s; };
function close() { panel?.remove(); back?.remove(); panel = back = null; lastFocus?.focus(); }
function open() {
  if (panel) return; lastFocus = document.activeElement;
  back = el('div', { className: 'h2ch-back' }); back.onclick = close;
  panel = el('aside', { className: 'h2ch-panel', role: 'dialog' }); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', 'Help and knowledge base');
  const x = el('button', { className: 'h2ch-x', type: 'button', textContent: 'Close' }); x.onclick = close;
  const head = el('div', { className: 'h2ch-head' }, el('h2', { textContent: 'Help · Knowledge' }), x);
  const s = el('input', { className: 'h2ch-s', type: 'search', placeholder: 'Search help (e.g. evidence, BLOCK, chart colors)' }); s.setAttribute('aria-label', 'Search help');
  const body = el('div', { className: 'h2ch-body', id: 'h2ch-body' }); body.setAttribute('aria-live', 'polite');
  const dev = el('div', { className: 'h2ch-dev' });
  const dNotice = el('div', { style: 'font-size: 11.5px; color: #991b1b; margin-top: 6px; font-weight: 600; line-height: 1.4;' },
    'Disclaimer: Apollo RCA™ and RealityCharting® are trademarks of Dean L. Gano / Apollonian Publications, LLC. Not affiliated with or endorsed by them. Official software: ',
    el('a', { href: 'https://realitycharting.com/home/', target: '_blank', rel: 'noopener noreferrer', style: 'color: #0a5c45; font-weight: 700; text-decoration: underline;' }, 'realitycharting.com')
  );
  dev.append(el('strong', { textContent: 'About the developer: ' }), devLine(), el('div', { textContent: 'Help text is original summary guidance (' + KB_VERSION + '), not a copy of any book.' }), dNotice);
  
  const vidBanner = el('button', {
    type: 'button',
    style: 'margin: 6px 14px 4px; padding: 8px 12px; background: linear-gradient(180deg, #fff5f5, #fee2e2); border: 1.5px solid #ef4444; border-radius: 8px; color: #b91c1c; font: 700 12.5px system-ui; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 8px; width: calc(100% - 28px);'
  });
  vidBanner.innerHTML = '<span>📺 <strong>Watch 7-Step Training Videos</strong></span><span style="font-size: 11px; background: #dc2626; color: #fff; padding: 2px 8px; border-radius: 4px;">▶ Open Videos</span>';
  vidBanner.onclick = () => { close(); window.h2cOpenVideoDrawer?.(); };
  panel.append(head, vidBanner, s, body, dev); document.body.append(back, panel); s.focus();
  const show = (a) => { body.replaceChildren(); const back2 = el('button', { className: 'h2ch-item', type: 'button', textContent: '← All topics' }); back2.onclick = () => list(s.value); body.append(back2, el('div', { className: 'h2ch-art' }, el('div', { className: 'h2ch-cat', textContent: a.cat }), el('h3', { textContent: a.title }), ...(DIAGRAMS[DIAGRAM_FOR[a.id]] ? [DIAGRAMS[DIAGRAM_FOR[a.id]]()] : []), el('p', { textContent: a.body }))); back2.focus(); };
  const list = (q) => { body.replaceChildren(); const terms = q.toLowerCase().split(/\s+/).filter(Boolean); let items = KB; if (terms.length) items = KB.map((a) => [a, score(a, terms)]).filter((r) => r[1] > 0).sort((a, b) => b[1] - a[1]).map((r) => r[0]);
    if (!items.length) { body.append(el('p', { textContent: 'No help topic matches "' + q + '". Try a shorter word.' })); return; }
    if (!terms.length) { body.append(el('div', { className: 'h2ch-cat', textContent: 'Visual quick start' }), DIAGRAMS.steps(), DIAGRAMS.causeSet()); }
    let cat = ''; for (const a of items) { if (!terms.length && a.cat !== cat) { cat = a.cat; body.append(el('div', { className: 'h2ch-cat', textContent: cat })); } const b = el('button', { className: 'h2ch-item', type: 'button' }, a.title, el('small', { textContent: a.body.slice(0, 90) + '…' })); b.onclick = () => show(a); body.append(b); } };
  s.oninput = () => list(s.value); list('');
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); if (e.key === 'Tab') { const f = [...panel.querySelectorAll('button,input,a')]; const i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f.at(-1).focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } } });
}

function mount() { if (!document.body) return; if (!fab || !fab.isConnected) { fab = el('button', { className: 'h2ch-fab', type: 'button', textContent: '? Help' }); fab.setAttribute('aria-label', 'Open help and knowledge base'); fab.onclick = open; document.body.append(fab); } ensureFoot(); }

// Toolbar Help button next to New analysis (reuses its styling), alongside the floating button.
function toolbar() { const nb = [...document.querySelectorAll('button')].find((b) => /^\s*New analysis\s*$/.test(b.textContent)); if (!nb || document.querySelector('.h2ch-tb')) return; const b = nb.cloneNode(false); b.className = nb.className.replace('h2c-new-prominent', '') + ' h2ch-tb'; b.type = 'button'; b.textContent = '? Help'; b.setAttribute('aria-label', 'Open help and knowledge base'); b.onclick = open; nb.parentNode.insertBefore(b, nb); }

function init() {
  if (!document.head.contains(css)) document.head.append(css);
  mount();
  toolbar();
  if (document.body) {
    new MutationObserver(() => {
      if (!fab?.isConnected || !document.querySelector('.h2c-devfoot')) mount();
      toolbar();
    }).observe(document.body, { childList: true, subtree: true });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 50));
} else {
  setTimeout(init, 50);
}
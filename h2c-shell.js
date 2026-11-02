// Thin shell around the Grok Build app: one-click "New analysis" with confirm + undo. Reuses the app's own reset (no second clear path).
const KEYS = ['realitychart-intake-v1', 'realitychart-hypotheses-v1', 'realitychart-raw-notes-v1'], BACKUP = 'h2c-last-cleared-v1';
let proceed = false;
const css = document.createElement('style');
css.textContent = `.h2c-new-prominent{background:linear-gradient(180deg,#f6dd7a,#c9a227)!important;color:#043d2e!important;border:2px solid #8c6a1a!important;font-weight:700!important}
.h2c-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:18px;z-index:10000;background:#043d2e;color:#f1d16b;border:2px solid #c9a227;border-radius:8px;padding:10px 14px;display:flex;gap:12px;align-items:center;font:600 14px system-ui;box-shadow:0 4px 14px rgba(0,0,0,.4)}
.h2c-toast button{background:#f1d16b;color:#043d2e;border:0;border-radius:6px;padding:6px 12px;font-weight:700;cursor:pointer}.h2c-toast button:focus-visible{outline:3px solid #fff}`;

const findBtn = () => [...document.querySelectorAll('button')].find((b) => /^\s*New analysis\s*$/.test(b.textContent));

function initShell() {
  if (!document.head.contains(css)) document.head.append(css);
  const applyProminent = () => {
    const b = findBtn();
    if (b && !b.classList.contains('h2c-new-prominent')) b.classList.add('h2c-new-prominent');
  };
  applyProminent();
  if (document.body) {
    new MutationObserver(applyProminent).observe(document.body, { childList: true, subtree: true });
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
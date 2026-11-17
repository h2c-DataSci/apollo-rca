// The draft stays in this browser tab. A reload restores it. Closing the tab drops it.
// It is not written to long-term browser storage.
const memory = new Map();
const TAB_PREFIX = 'h2c-tab:';
function tabStore() {
  try { return globalThis.sessionStorage || null; } catch { return null; }
}
function readTab(key) {
  try { return tabStore()?.getItem(TAB_PREFIX + key) ?? null; } catch { return null; }
}
function writeTab(key, value) {
  try { tabStore()?.setItem(TAB_PREFIX + key, value); } catch {}
}
function deleteTab(key) {
  try { tabStore()?.removeItem(TAB_PREFIX + key); } catch {}
}
export const SESSION_CHANGED = 'h2c-session-changed';
export const sessionStore = {
  getItem(key) {
    const name = String(key);
    if (memory.has(name)) return memory.get(name);
    const saved = readTab(name);
    if (saved != null) memory.set(name, saved);
    return saved;
  },
  setItem(key, value) {
    const name = String(key);
    const text = String(value);
    memory.set(name, text);
    writeTab(name, text);
  },
  removeItem(key) {
    const name = String(key);
    memory.delete(name);
    deleteTab(name);
  },
  clear() {
    const names = [...memory.keys()];
    memory.clear();
    for (const name of names) deleteTab(name);
    try {
      const store = tabStore();
      if (!store) return;
      for (let i = store.length - 1; i >= 0; i--) {
        const name = store.key(i);
        if (name && name.startsWith(TAB_PREFIX)) store.removeItem(name);
      }
    } catch {}
  },
  notify() {
    if (typeof globalThis.dispatchEvent === 'function') globalThis.dispatchEvent(new Event(SESSION_CHANGED));
  }
};

// Older browser storage is offered as a recovery download, then removed.
// The saved API-key record is never copied into that download.
export const LEGACY_KEYS = Object.freeze([
  'realitychart-intake-v1', 'realitychart-hypotheses-v1',
  'realitychart-raw-notes-v1', 'h2c-coach-notes-v1',
  'h2c-last-cleared-v1', 'h2c-local-ai-bridge-v1'
]);
function legacyStorage(provided) {
  try { return provided === undefined ? globalThis.localStorage : provided; } catch { return null; }
}
export function listLegacyData(provided) {
  const storage = legacyStorage(provided);
  const result = {};
  for (const key of LEGACY_KEYS) {
    try { const value = storage?.getItem(key); if (value != null) result[key] = value; } catch {}
  }
  return result;
}
export function legacyRecoveryPlan(legacy) {
  const data = {};
  let hadSecret = false;
  let present = false;
  for (const [key, value] of Object.entries(legacy || {})) {
    present = true;
    if (key === 'h2c-local-ai-bridge-v1') { hadSecret = true; continue; }
    data[key] = value;
  }
  return { offer: Object.keys(data).length > 0, data, hadSecret, clear: present };
}
export function removeLegacyData(provided) {
  const storage = legacyStorage(provided);
  const failed = [];
  for (const key of LEGACY_KEYS) {
    try { storage?.removeItem(key); } catch { failed.push(key); }
  }
  return failed;
}

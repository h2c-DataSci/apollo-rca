// Investigation data is held only in this page's memory. Reloading discards it.
const values = new Map();
export const SESSION_CHANGED = 'h2c-session-changed';
export const sessionStore = {
  getItem(key) { return values.has(String(key)) ? values.get(String(key)) : null; },
  setItem(key, value) { values.set(String(key), String(value)); },
  removeItem(key) { values.delete(String(key)); },
  clear() { values.clear(); },
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

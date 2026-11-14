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

// No legacy content is read, imported or deleted until a caller explicitly asks.
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
export function removeLegacyData(provided) {
  const storage = legacyStorage(provided);
  const failed = [];
  for (const key of LEGACY_KEYS) {
    try { storage?.removeItem(key); } catch { failed.push(key); }
  }
  return failed;
}

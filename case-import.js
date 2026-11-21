// Testable project-JSON import helpers. Keep in sync with the copies in routes-v13.js.

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
const SECRET_KEY_RE = /apiKey|api_key|authorization|secret|token|password/i;
const SECRET_VAL_RE = /\b(sk-[a-zA-Z0-9_-]{12,}|gsk_[a-zA-Z0-9_-]{12,}|AIza[0-9A-Za-z_-]{20,}|hf_[a-zA-Z0-9]{12,}|xai-[a-zA-Z0-9_-]{12,})\b/;

export function isProjectState(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  const intake = data.intake && typeof data.intake === 'object' ? data.intake : data;
  return (Array.isArray(intake.effects) && intake.effects.some((row) => row && typeof row === 'object' && ('what' in row || 'id' in row)))
    || Array.isArray(data.trees)
    || Array.isArray(data.analysis?.trees);
}

function validNode(node) {
  return !!(node && typeof node === 'object' && typeof node.id === 'string' && typeof node.title === 'string');
}

export function isValidAnalysis(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.trees) || !raw.trees.length) return false;
  if (!validNode(raw.root)) return false;
  return raw.trees.every((tree) => tree && typeof tree === 'object' && validNode(tree.root));
}

export function hasSecretKeys(value, found = []) {
  if (value == null || typeof value !== 'object') return found;
  if (Array.isArray(value)) {
    for (const item of value) hasSecretKeys(item, found);
    return found;
  }
  for (const [key, item] of Object.entries(value)) {
    if (SECRET_KEY_RE.test(key) && item) found.push(key);
    else if (typeof item === 'string' && SECRET_VAL_RE.test(item)) found.push(key);
    if (item && typeof item === 'object') hasSecretKeys(item, found);
  }
  return found;
}

export function stripSecretKeys(value) {
  if (value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => stripSecretKeys(item));
  const out = {};
  for (const [key, item] of Object.entries(value)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    if (SECRET_KEY_RE.test(key)) continue;
    if (typeof item === 'string' && SECRET_VAL_RE.test(item)) continue;
    out[key] = stripSecretKeys(item);
  }
  return out;
}

export function parseProjectFile(data, normalizeIntake = (value) => value) {
  if (!isProjectState(data)) {
    throw new Error('This JSON is not a saved case. Open a Cause Chart_Project_State.json export, or a file with an intake.effects list.');
  }
  const strippedSecrets = [...new Set(hasSecretKeys(data))];
  const clean = strippedSecrets.length ? stripSecretKeys(data) : data;
  const rawIntake = clean.intake && typeof clean.intake === 'object' ? clean.intake : clean;
  const rawAnalysis = clean.analysis && Array.isArray(clean.analysis.trees) ? clean.analysis : (Array.isArray(clean.trees) ? clean : null);
  const intake = normalizeIntake(rawIntake);
  const empty = !(intake.effects || []).some((row) => (row.what || '').trim())
    && !(intake.timeline || []).some((row) => (row.description || '').trim())
    && !(intake.evidence || []).length;
  if (empty) throw new Error('This JSON did not contain a case I can open.');
  const analysis = isValidAnalysis(rawAnalysis) ? rawAnalysis : null;
  return { intake, analysis, strippedSecrets };
}

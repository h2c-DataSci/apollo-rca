// Testable project-JSON import helpers. Keep in sync with the copies in routes-v13.js.

export function isProjectState(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  const intake = data.intake && typeof data.intake === 'object' ? data.intake : data;
  return (Array.isArray(intake.effects) && intake.effects.some((row) => row && typeof row === 'object' && ('what' in row || 'id' in row)))
    || Array.isArray(data.trees)
    || Array.isArray(data.analysis?.trees);
}

export function parseProjectFile(data, normalizeIntake = (value) => value) {
  if (!isProjectState(data)) {
    throw new Error('This JSON is not a saved case. Open a Cause Chart_Project_State.json export, or a file with an intake.effects list.');
  }
  const rawIntake = data.intake && typeof data.intake === 'object' ? data.intake : data;
  const rawAnalysis = data.analysis && Array.isArray(data.analysis.trees) ? data.analysis : (Array.isArray(data.trees) ? data : null);
  const intake = normalizeIntake(rawIntake);
  const empty = !(intake.effects || []).some((row) => (row.what || '').trim())
    && !(intake.timeline || []).some((row) => (row.description || '').trim())
    && !(intake.evidence || []).length;
  if (empty) throw new Error('This JSON did not contain a case I can open.');
  const analysis = rawAnalysis && Array.isArray(rawAnalysis.trees) && rawAnalysis.trees.length ? rawAnalysis : null;
  return { intake, analysis };
}

export function hasSecretKeys(value, found = []) {
  if (value == null || typeof value !== 'object') return found;
  for (const [key, item] of Object.entries(value)) {
    if (/apiKey|api_key|authorization|secret|token|password/i.test(key) && item) found.push(key);
    hasSecretKeys(item, found);
  }
  return found;
}

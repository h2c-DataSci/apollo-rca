// Export / import of an investigation with AI provenance. Pure; validates untrusted files.
import { VERSIONS } from './rca-principles.js';
export const FORMAT = 'h2c-rca-case-v1';
export function exportCase(state, notes, now = new Date()) { return { format: FORMAT, exportedAt: now.toISOString(), versions: VERSIONS, state, aiNotes: notes }; }
export function validateImport(text) {
  let o; try { o = JSON.parse(text); } catch { return { ok: false, error: 'Not valid JSON.' }; }
  if (!o || typeof o !== 'object' || o.format !== FORMAT) return { ok: false, error: 'Not an H2C Root Cause Analyst case file.' };
  const s = o.state; if (!s || typeof s !== 'object' || !Array.isArray(s.effects) || s.effects.length > 3) return { ok: false, error: 'Missing or invalid effects.' };
  if (s.timeline !== undefined && (!Array.isArray(s.timeline) || s.timeline.some((t) => !t || typeof t.id !== 'string'))) return { ok: false, error: 'Invalid timeline.' };
  const ev = s.evidence === undefined ? [] : s.evidence; if (!Array.isArray(ev) || ev.some((e) => !e || typeof e.id !== 'string' || typeof e.text !== 'string')) return { ok: false, error: 'Invalid evidence records.' };
  if (new Set(ev.map((e) => e.id)).size !== ev.length) return { ok: false, error: 'Duplicate evidence IDs.' };
  const n = o.aiNotes === undefined ? [] : o.aiNotes; if (!Array.isArray(n) || n.some((x) => !x || typeof x.text !== 'string' || typeof x.task !== 'string')) return { ok: false, error: 'Invalid AI notes.' };
  const notes = n.map((x) => ({ ...x, status: ['hypothesis', 'rejected'].includes(x.status) ? x.status : 'ai-assisted', origin: 'ai-assisted' })); // imported AI content never becomes a validated finding
  return { ok: true, state: s, notes };
}

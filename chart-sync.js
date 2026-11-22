// Two-way sync between the RealityChart trees and intake forms/tables.
// Evidence rows and node/PE fields share one set of facts. Chart-only marks
// (STOP, Need More Info, GOTO, And/Or) stay on the tree and in the inspector.

function walk(node, fn, parent = null, depth = 0) {
  if (!node) return;
  fn(node, parent, depth);
  for (const child of node.children || []) walk(child, fn, node, depth + 1);
}

export function collectNodes(analysis) {
  const out = [];
  for (const tree of analysis?.trees || []) {
    walk(tree.root, (node, parent, depth) => {
      out.push({ node, parent, depth, treeId: tree.id, code: tree.code });
    });
  }
  return out;
}

export function allEvidenceRows(intake) {
  return [
    ...(intake?.evidence || []),
    ...(intake?.effects || []).flatMap((effect) => effect.evidence || [])
  ];
}

function mapPools(intake, fn) {
  return {
    ...intake,
    evidence: (intake.evidence || []).map(fn),
    effects: (intake.effects || []).map((effect) => ({
      ...effect,
      evidence: (effect.evidence || []).map(fn)
    }))
  };
}

function filterPools(intake, fn) {
  return {
    ...intake,
    evidence: (intake.evidence || []).filter(fn),
    effects: (intake.effects || []).map((effect) => ({
      ...effect,
      evidence: (effect.evidence || []).filter(fn)
    }))
  };
}

export function syncChartToIntake(intake, analysis, opts = {}) {
  if (!intake) return intake;
  const nodes = collectNodes(analysis);
  const causes = nodes.filter((n) => n.node.kind !== 'primary');
  const ids = new Set(causes.map((n) => n.node.id));
  let next = { ...intake, effects: (intake.effects || []).map((effect) => ({ ...effect })) };

  const preferIntake = !!(opts && opts.preferIntake);
  for (const tree of analysis?.trees || []) {
    const pe = next.effects.find((effect) => effect.id === tree.id);
    if (pe && tree.root?.title && pe.what !== tree.root.title) {
      if (!preferIntake || !(pe.what || '').trim()) pe.what = tree.root.title;
    }
  }

  next = mapPools(next, (row) => {
    const byId = causes.find((n) => n.node.id === row.nodeId);
    const causeName = String(row.cause || '').trim().toLowerCase();
    const byCause = !row.nodeId && causeName
      ? causes.find((n) => String(n.node.title || '').trim().toLowerCase() === causeName)
      : null;
    const hit = byId || byCause;
    if (!hit) {
      if (row.nodeId && !ids.has(row.nodeId)) {
        const { nodeId, ...rest } = row;
        return rest;
      }
      return row;
    }
    const { node, parent, depth, treeId } = hit;
    const explains = parent && parent.kind !== 'primary' ? parent.title : (row.explains || '');
    return {
      ...row,
      nodeId: node.id,
      cause: preferIntake && (row.cause || '').trim() ? row.cause : node.title,
      kind: preferIntake && (row.kind === 'condition' || row.kind === 'action')
        ? row.kind
        : (node.kind === 'condition' ? 'condition' : (row.kind === 'condition' ? 'condition' : 'action')),
      pe: row.pe || treeId,
      layer: Number(row.layer) || Math.min(4, Math.max(1, depth)),
      explains: row.explains || explains
    };
  });
  return next;
}

export function applyIntakeToChart(analysis, intake) {
  if (!analysis) return analysis;
  const rows = allEvidenceRows(intake);
  const patch = (node, treeId, treeIndex) => {
    const titleKey = String(node.title || '').trim().toLowerCase();
    const mine = rows.filter((row) => {
      if (row.nodeId) return row.nodeId === node.id;
      return (row.cause || '').trim().toLowerCase() === titleKey;
    });
    const lead = mine.find((row) => (row.cause || '').trim()) || mine[0];
    let next = { ...node, children: (node.children || []).map((child) => patch(child, treeId, treeIndex)) };
    if (node.kind !== 'primary' && lead) {
      if ((lead.cause || '').trim()) next.title = String(lead.cause).trim();
      if (lead.kind === 'condition' || lead.kind === 'action') next.kind = lead.kind;
    }
    if (node.kind === 'primary') {
      const pe = (intake.effects || []).find((effect) => effect.id === treeId) || (intake.effects || [])[treeIndex];
      if (pe && (pe.what || '').trim()) next.title = pe.what.trim();
    }
    return next;
  };
  const trees = (analysis.trees || []).map((tree, treeIndex) => ({ ...tree, root: patch(tree.root, tree.id, treeIndex) }));
  return { ...analysis, trees, root: trees[0]?.root ?? analysis.root };
}

export function ensureNodesForRows(analysis, intake) {
  if (!analysis) return analysis;
  const trees = (analysis.trees || []).map((tree, index) => {
    const inTree = (row) => {
      if (row.nodeId) {
        let found = false;
        walk(tree.root, (node) => { if (node.id === row.nodeId) found = true; });
        if (found) return true;
      }
      if (row.pe) return row.pe === tree.id;
      return index === 0;
    };
    const rows = allEvidenceRows(intake).filter((row) => (row.cause || '').trim() && inTree(row));
    const titles = new Set();
    walk(tree.root, (node) => titles.add(String(node.title || '').trim().toLowerCase()));
    const root = structuredClone(tree.root);
    const find = (node, pred) => {
      if (pred(node)) return node;
      for (const child of node.children || []) {
        const hit = find(child, pred);
        if (hit) return hit;
      }
      return null;
    };
    const sorted = [...rows].sort((a, b) => (Number(a.layer) || 1) - (Number(b.layer) || 1));
    for (const row of sorted) {
      const key = row.cause.trim().toLowerCase();
      if (titles.has(key)) continue;
      const parentKey = String(row.explains || '').trim().toLowerCase();
      const parent = (parentKey && find(root, (n) => String(n.title || '').trim().toLowerCase() === parentKey)) || root;
      const kind = row.kind === 'condition' ? 'condition' : 'action';
      const id = row.nodeId || `${kind[0]}-sync-${Math.random().toString(36).slice(2, 8)}`;
      const placeholder = isPlaceholderTitle(row.cause);
      const child = {
        id,
        kind,
        title: row.cause.trim(),
        verified: !placeholder,
        evidence: placeholder ? [{ source: '?', missing: true }] : [],
        children: [],
        necessity: true,
        sufficiency: !placeholder,
        placeholder,
        ...(placeholder ? { terminator: { type: 'question', label: 'Need More Info' } } : {})
      };
      parent.children = [...(parent.children || []), child];
      titles.add(key);
    }
    return { ...tree, root };
  });
  return { ...analysis, trees, root: trees[0]?.root ?? analysis.root };
}

export function removeEvidenceRow(intake, evId) {
  if (!evId) return intake;
  return filterPools(intake, (row) => row.id !== evId);
}

export function addEvidenceForNode(intake, node, treeId) {
  const row = {
    id: (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : `ev-${Date.now()}`,
    text: '',
    source: '',
    tier: 'Inferred',
    nodeId: node.id,
    cause: node.title,
    kind: node.kind === 'condition' ? 'condition' : 'action',
    layer: 1,
    explains: '',
    pe: treeId
  };
  const pe = (intake.effects || []).find((effect) => effect.id === treeId);
  const peHasOwn = pe && (pe.evidence || []).some((e) => (e.text || '').trim() || (e.source || '').trim());
  const pool = peHasOwn ? (pe.evidence || []) : (intake.evidence || []);
  const hasBlank = pool.some((e) => e && e.nodeId === node.id && !(e.text || '').trim() && !(e.source || '').trim());
  if (hasBlank) return intake;
  if (peHasOwn) {
    return {
      ...intake,
      effects: intake.effects.map((effect) => effect.id === treeId
        ? { ...effect, evidence: [...(effect.evidence || []), row] }
        : effect)
    };
  }
  return { ...intake, evidence: [...(intake.evidence || []), row] };
}

export function patchPrimaryEffect(intake, treeId, fields) {
  return {
    ...intake,
    effects: (intake.effects || []).map((effect) => effect.id === treeId ? { ...effect, ...fields } : effect)
  };
}

export function refreshFromIntake(intake, analysis) {
  if (!analysis) return { intake, analysis };
  let anal = applyIntakeToChart(analysis, intake);
  anal = ensureNodesForRows(anal, intake);
  const nextIntake = syncChartToIntake(intake, anal, { preferIntake: true });
  anal = applyIntakeToChart(anal, nextIntake);
  return { intake: nextIntake, analysis: anal };
}

export function valueEvents(fn) {
  const go = (event) => {
    const el = event.currentTarget || event.target;
    const live = (el && el.h2cValFn) || fn;
    live(event);
  };
  return {
    onChange: go,
    onInput: go,
    onPaste: (event) => {
      const el = event.currentTarget || event.target;
      queueMicrotask(() => ((el && el.h2cValFn) || fn)(event));
    },
    ref: (el) => {
      if (!el) return;
      el.h2cValFn = fn;
      if (el.h2cValBound) return;
      el.h2cValBound = true;
      // Native change only (date pickers, programmatic). React already fires
      // onInput/onChange for typing; a one-shot native input listener would
      // keep the first render's closure and overwrite later state.
      el.addEventListener('change', (event) => (el.h2cValFn || fn)(event));
    }
  };
}

export function isPlaceholderTitle(title) {
  return /^(action needed|condition needed|new action(?: \d+)?|state exists(?: \d+)?)$/i.test(String(title || '').trim());
}

export function isPlaceholderNode(node) {
  return !!(node && (node.placeholder || isPlaceholderTitle(node.title)));
}

export function parentNodeId(root, id) {
  let found;
  walk(root, (node, parent) => {
    if (node.id === id) found = parent ? parent.id : null;
  });
  return found === undefined ? null : found;
}

export function isRequiredPlaceholder(root, node) {
  if (!isPlaceholderNode(node) || !root) return false;
  let parent = null;
  walk(root, (n, p) => {
    if (n.id === node.id) parent = p;
  });
  if (!parent) return false;
  const others = (parent.children || []).filter((child) => child.id !== node.id);
  if (node.kind === 'condition') return !others.some((child) => child.kind === 'condition');
  return !others.some((child) => child.kind === 'action');
}

function makePlaceholder(kind) {
  const id = (globalThis.crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${kind[0]}-ph-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    kind,
    title: kind === 'action' ? 'Action Needed' : 'Condition Needed',
    verified: false,
    evidence: [{ source: '?', missing: true }],
    children: [],
    necessity: true,
    sufficiency: true,
    placeholder: true,
    terminator: { type: 'question', label: 'Need More Info' }
  };
}

function replaceNode(root, id, fn) {
  if (!root) return root;
  if (root.id === id) return fn(root);
  return { ...root, children: (root.children || []).map((child) => replaceNode(child, id, fn)) };
}

// Remove a cause from one parent only. Required placeholders are left in place.
// Never walks the rest of the tree adding terminators, GOTO nodes, or placeholders.
export function removeCauseNode(root, id) {
  if (!root || root.id === id) {
    return { root, removed: false, selectedId: root ? root.id : null, requiredPlaceholder: false };
  }
  let target = null;
  let parent = null;
  walk(root, (node, p) => {
    if (node.id === id) {
      target = node;
      parent = p;
    }
  });
  if (!target || !parent) {
    return { root, removed: false, selectedId: id, requiredPlaceholder: false };
  }
  if (isPlaceholderNode(target) && isRequiredPlaceholder(root, target)) {
    return { root, removed: false, selectedId: id, requiredPlaceholder: true };
  }
  const nextChildren = (parent.children || []).filter((child) => child.id !== id);
  if (nextChildren.length) {
    if (!nextChildren.some((child) => child.kind === 'action')) nextChildren.unshift(makePlaceholder('action'));
    if (!nextChildren.some((child) => child.kind === 'condition')) nextChildren.push(makePlaceholder('condition'));
  }
  const patched = {
    ...parent,
    children: nextChildren,
    terminator: nextChildren.length
      ? undefined
      : (parent.kind === 'primary' ? parent.terminator : (parent.terminator || { type: 'question', label: 'Need More Info' }))
  };
  return {
    root: replaceNode(root, parent.id, () => patched),
    removed: true,
    selectedId: parent.id,
    requiredPlaceholder: false
  };
}

export function findNodeId(analysis, id) {
  return collectNodes(analysis).some((entry) => entry.node.id === id);
}

export function reselectNode(analysis, id, title) {
  if (id && findNodeId(analysis, id)) return id;
  const key = String(title || '').trim().toLowerCase();
  if (!key) return id || null;
  const hit = collectNodes(analysis).find((entry) => String(entry.node.title || '').trim().toLowerCase() === key);
  return hit ? hit.node.id : id || null;
}

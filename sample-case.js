// Finished fictional haul-truck showcase for "Load sample case".
// Everything here is invented. No real people, sites, or contact details.

function isoDateFromToday(offsetDays, base) {
  const d = new Date((base instanceof Date ? base : new Date()).getTime());
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + (Number(offsetDays) || 0));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function node(id, kind, title, extra = {}) {
  return {
    id,
    kind,
    title,
    verified: extra.verified !== false,
    evidence: extra.evidence || [],
    children: extra.children || [],
    necessity: extra.necessity !== false,
    sufficiency: extra.sufficiency !== false,
    ...(extra.code ? { code: extra.code } : {}),
    ...(extra.terminator ? { terminator: extra.terminator } : {})
  };
}

export const SAMPLE_HINT = 'This is a worked example — click any node to explore; press New analysis to start your own';

export const SAMPLE_BLAME_RE = /\b(operator continued|human error|operator error|failed to|forgot to|negligen|john doe|SMPC|@|who:)\b/i;
export const SAMPLE_PERSON_CAUSE_RE = /\b(operator|technician|employee|worker|john doe|human error|operator error|pilot error|who:)\b/i;

export function getSampleCase(now) {
  const today = now instanceof Date ? now : new Date();
  const when = (offset) => isoDateFromToday(offset, today);
  const incidentDate = when(-5);
  const reportDate = when(-4);
  const dueClamp = when(28);
  const dueShield = when(35);
  const duePm = when(42);
  const dueOil = when(49);

  const intake = {
    effects: [
      {
        id: 'pe-1',
        what: 'Haul Truck Fire',
        whenDate: incidentDate,
        whenTime: '14:20',
        phase: 'Steady operation',
        where: 'Pit 3 ramp, HT-07',
        safety: 'Fire on a haul ramp, no injuries',
        loss: '$169,000',
        frequency: 'First occurrence',
        frequencyNote: '',
        safetyTags: ['Fire', 'Evacuation'],
        severity: '4',
        likelihood: '3',
        costSplit: { direct: '120000', hours: '6', rate: '5000', response: '15000', inspection: '4000' },
        whereParts: { site: 'Fictional Mine', area: 'Pit 3', system: 'Haul fleet', equipment: 'Haul truck', asset: 'HT-07' },
        duration: '45 min',
        shift: 'Day',
        freeze: { heat: 'yes', fuel: 'yes', oxygen: 'yes', people: 'unknown', protection: 'no' },
        timeline: [
          { id: 'pe1-t1', time: '14:05', description: 'Hydraulic hose ruptured, oil sprayed' },
          { id: 'pe1-t2', time: '14:18', description: 'Smoke seen from the engine bay' }
        ],
        evidence: []
      },
      {
        id: 'pe-2',
        what: 'Production Lost',
        whenDate: incidentDate,
        whenTime: '14:20',
        phase: 'Steady operation',
        where: 'Pit 3 haul route',
        safety: 'Ramp blocked, evacuation of the immediate area',
        loss: '$24,000',
        frequency: 'Same event',
        frequencyNote: '',
        safetyTags: ['Evacuation'],
        severity: '3',
        likelihood: '3',
        costSplit: { direct: '24000', hours: '6', rate: '4000', response: '0', inspection: '0' },
        whereParts: { site: 'Fictional Mine', area: 'Pit 3', system: 'Haul route', equipment: 'Ramp', asset: 'Pit 3 ramp' },
        duration: '6 hours',
        shift: 'Day',
        timeline: [
          { id: 'pe2-t1', time: '14:20', description: 'Haul stopped, ramp blocked' },
          { id: 'pe2-t2', time: '20:20', description: 'Route restored' }
        ],
        evidence: []
      },
      {
        id: 'pe-3',
        what: 'Suppression Failed',
        whenDate: incidentDate,
        whenTime: '14:21',
        phase: 'Steady operation',
        where: 'HT-07 fire system',
        safety: 'On-board suppression did not knock down the fire',
        loss: 'Included in the fire loss',
        frequency: 'Same event',
        frequencyNote: '',
        safetyTags: ['Fire'],
        severity: '4',
        likelihood: '3',
        costSplit: { direct: '0', hours: '0', rate: '0', response: '0', inspection: '2000' },
        whereParts: { site: 'Fictional Mine', area: 'Pit 3', system: 'Fire suppression', equipment: 'On-board system', asset: 'HT-07' },
        duration: '45 min',
        shift: 'Day',
        timeline: [
          { id: 'pe3-t1', time: '14:19', description: 'Suppression pull handle used' },
          { id: 'pe3-t2', time: '14:21', description: 'Nozzle found blocked' }
        ],
        evidence: []
      }
    ],
    timeline: [
      { id: 't1', time: '13:50', description: 'Pre-use walkaround recorded no leak' },
      { id: 't2', time: '14:05', description: 'Hydraulic hose ruptured, oil sprayed' },
      { id: 't3', time: '14:10', description: 'Hydraulic alarm sounded in the cab' },
      { id: 't4', time: '14:18', description: 'Smoke seen from the engine bay' },
      { id: 't5', time: '14:19', description: 'Suppression pull handle used' },
      { id: 't6', time: '14:20', description: 'Fire reported; haul stopped and the ramp was blocked' },
      { id: 't7', time: '14:21', description: 'Nozzle found blocked' },
      { id: 't8', time: '20:20', description: 'Route restored' }
    ],
    evidence: [
      { id: 'ev-1', text: 'Photograph IMG-101 shows the hydraulic hose burst on the right frame rail, with oil sprayed across the engine deck.', tier: 'Sensed', source: 'Hose burst photo IMG-101', cause: 'Hydraulic Hose Ruptured', kind: 'action', layer: 1, explains: '', pe: 'pe-1' },
      { id: 'ev-2', text: 'A post-event thermal scan recorded 620 C on the turbo housing where the heat shield should sit.', tier: 'Inferred', source: 'Thermal scan 620C', cause: 'Hot Turbo Surface', kind: 'condition', layer: 1, explains: '', pe: 'pe-1' },
      { id: 'ev-3', text: 'Oil pooling and spray marks were present on the engine deck around the turbo.', tier: 'Sensed', source: 'Oil on engine deck', cause: 'Oil Present', kind: 'condition', layer: 1, explains: '', pe: 'pe-1' },
      { id: 'ev-4', text: 'The engine bay is open to air. Ambient oxygen was available at the turbo face.', tier: 'Inferred', source: 'Engine-bay layout', cause: 'Oxygen Present', kind: 'condition', layer: 1, explains: '', pe: 'pe-1' },
      { id: 'ev-5', text: 'The cab data logger shows HT-07 still in gear and moving for several minutes after the hydraulic alarm started.', tier: 'Inferred', source: 'Cab data logger', cause: 'Truck Kept Moving After Alarm', kind: 'action', layer: 1, explains: '', pe: 'pe-1' },
      { id: 'ev-6', text: 'Wear flats and rub marks match the frame edge where a clamp should have held the hose clear.', tier: 'Sensed', source: 'Wear marks on hose', cause: 'Hose Chafed Against Frame', kind: 'action', layer: 2, explains: 'Hydraulic Hose Ruptured', pe: 'pe-1' },
      { id: 'ev-7', text: 'The hose clamp at that frame point was missing during the isolation inspection.', tier: 'Sensed', source: 'Maintenance photo of missing clamp', cause: 'Clamp Missing', kind: 'condition', layer: 2, explains: 'Hydraulic Hose Ruptured', pe: 'pe-1' },
      { id: 'ev-8', text: 'The turbo heat shield was not on the engine after the recent rebuild. Mounting studs were bare.', tier: 'Sensed', source: 'Post-fire engine photo', cause: 'Heat Shield Left Off After Rebuild', kind: 'condition', layer: 2, explains: 'Hot Turbo Surface', pe: 'pe-1' },
      { id: 'ev-9', text: 'The rebuild pack list for this turbo job has not been located, so it is not yet known whether the shield was in the kit. That is a fact still to gather.', tier: 'Intuited', source: 'Open workshop question', cause: 'Rebuild Pack List Unknown', kind: 'condition', layer: 2, explains: 'Hot Turbo Surface', pe: 'pe-1' },
      { id: 'ev-10', text: 'The hydraulic alarm is visible on the cab log from 14:10 until shutdown, still in the alarm state.', tier: 'Inferred', source: 'Cab alarm log', cause: 'Hydraulic Alarm Remained Active', kind: 'condition', layer: 2, explains: 'Truck Kept Moving After Alarm', pe: 'pe-1' },
      { id: 'ev-11', text: 'Dispatch recorded HT-07 and the Pit 3 ramp out of service from 14:20 until 20:20.', tier: 'Sensed', source: 'Dispatch log', cause: 'Truck Unavailable For Hours', kind: 'condition', layer: 1, explains: '', pe: 'pe-2' },
      { id: 'ev-12', text: 'The haul was stopped and cones were placed at the ramp once the fire was reported.', tier: 'Sensed', source: 'Shift report', cause: 'Haul Route Blocked', kind: 'action', layer: 1, explains: '', pe: 'pe-2' },
      { id: 'ev-13', text: 'The pull handle was used at 14:19. The system discharged, but the fire kept burning.', tier: 'Sensed', source: 'Cab event log', cause: 'Suppression Handle Pulled', kind: 'action', layer: 1, explains: '', pe: 'pe-3' },
      { id: 'ev-14', text: 'The suppression nozzle facing the turbo was blocked by a shipping cap still in place.', tier: 'Sensed', source: 'Post-fire inspection', cause: 'Suppression Nozzle Blocked', kind: 'condition', layer: 1, explains: '', pe: 'pe-3' },
      { id: 'ev-15', text: 'The nozzle cap was still installed on the discharge tip after the event.', tier: 'Sensed', source: 'Nozzle close-up photo', cause: 'Nozzle Cap Left On', kind: 'action', layer: 2, explains: 'Suppression Nozzle Blocked', pe: 'pe-3' },
      { id: 'ev-16', text: 'The current PM checklist for HT-07 fire hardware does not include a nozzle-cap removal check.', tier: 'Inferred', source: 'PM checklist HT-07', cause: 'Cap Check Absent From PM', kind: 'condition', layer: 3, explains: 'Nozzle Cap Left On', pe: 'pe-3' }
    ],
    goals: 'Zero repeat haul truck fires in 12 months',
    maxCost: '$50,000',
    payback: '12 months',
    control: 'Not OEM engine design. Not weather.',
    investigator: 'Lead investigator (fictional role)',
    reportDate,
    solutionsOpen: true
  };

  const pe1 = node('p-1', 'primary', 'Haul Truck Fire', {
    code: 'PE-1',
    children: [
      node('a-2', 'action', 'Hydraulic Hose Ruptured', {
        children: [
          node('a-7', 'action', 'Hose Chafed Against Frame'),
          node('c-8', 'condition', 'Clamp Missing')
        ]
      }),
      node('c-3', 'condition', 'Hot Turbo Surface', {
        sufficiency: false,
        children: [
          node('c-9', 'condition', 'Heat Shield Left Off After Rebuild', { verified: false, sufficiency: false }),
          node('c-10', 'condition', 'Rebuild Pack List Unknown', {
            verified: false,
            sufficiency: false,
            terminator: { type: 'question', label: 'Need More Info', userSet: true }
          })
        ]
      }),
      node('c-4', 'condition', 'Oil Present'),
      node('c-5', 'condition', 'Oxygen Present', {
        terminator: { type: 'stop', reason: 'Desired Condition', userSet: true }
      }),
      node('a-6', 'action', 'Truck Kept Moving After Alarm', {
        children: [
          node('c-11', 'condition', 'Hydraulic Alarm Remained Active')
        ]
      })
    ]
  });

  const pe2 = node('p-15', 'primary', 'Production Lost', {
    code: 'PE-2',
    children: [
      node('a-16', 'action', 'Haul Route Blocked'),
      node('c-17', 'condition', 'Truck Unavailable For Hours')
    ]
  });

  const pe3 = node('p-18', 'primary', 'Suppression Failed', {
    code: 'PE-3',
    children: [
      node('a-19', 'action', 'Suppression Handle Pulled'),
      node('c-20', 'condition', 'Suppression Nozzle Blocked', {
        children: [
          node('a-21', 'action', 'Nozzle Cap Left On', {
            children: [
              node('c-22', 'condition', 'Cap Check Absent From PM')
            ]
          })
        ]
      })
    ]
  });

  const trees = [
    { id: 'pe-1', code: 'PE-1', root: pe1 },
    { id: 'pe-2', code: 'PE-2', root: pe2 },
    { id: 'pe-3', code: 'PE-3', root: pe3 }
  ];
  const nodeMeta = new Map();
  for (const tree of trees) {
    const walk = (nd) => {
      if (!nd) return;
      nodeMeta.set(nd.title, { targetId: nd.id, targetKind: nd.kind, effectCode: tree.code });
      for (const child of nd.children || []) walk(child);
    };
    walk(tree.root);
  }
  const metaFor = (title) => nodeMeta.get(title) || { targetId: '', targetKind: 'condition', effectCode: 'PE-1' };

  const selected = (id, targetTitle, action, owner, due, cost) => ({
    id,
    ...metaFor(targetTitle),
    targetTitle,
    action,
    owner,
    due,
    cost,
    include: true,
    preventsRecurrence: true,
    withinControl: true,
    meetsGoals: true,
    underCap: true,
    paybackOk: true,
    noNewProblems: true,
    blocked: false,
    blockReason: '',
    coveredBy: '',
    kind: 'corrective'
  });
  const unused = (id, targetTitle) => ({
    id,
    ...metaFor(targetTitle),
    targetTitle,
    action: '',
    owner: '',
    due: '',
    cost: '',
    include: false,
    preventsRecurrence: false,
    withinControl: false,
    meetsGoals: false,
    underCap: false,
    paybackOk: false,
    noNewProblems: false,
    blocked: false,
    blockReason: '',
    coveredBy: '',
    kind: 'corrective'
  });

  const analysis = {
    trees,
    root: pe1,
    solutions: [
      selected('CA-01', 'Clamp Missing', 'Install clamps every 2 m on hydraulic hoses that run beside the frame, and add the clamp to the hose-install standard.', 'Maintenance Supervisor', dueClamp, '$4,800'),
      unused('CA-02', 'Hose Chafed Against Frame'),
      unused('CA-03', 'Hydraulic Hose Ruptured'),
      selected('CA-04', 'Heat Shield Left Off After Rebuild', 'Add a heat-shield sign-off to the turbo rebuild job card and refit the shield on HT-07 before the truck returns to service.', 'Workshop Planner', dueShield, '$6,200'),
      unused('CA-05', 'Hot Turbo Surface'),
      selected('CA-06', 'Oil Present', 'Fit an oil-deflection shield above the turbo and add a weekly leak walk to the haul-truck standard.', 'Reliability Lead', dueOil, '$15,000'),
      unused('CA-07', 'Oxygen Present'),
      unused('CA-08', 'Hydraulic Alarm Remained Active'),
      unused('CA-09', 'Truck Kept Moving After Alarm'),
      unused('CA-10', 'Truck Unavailable For Hours'),
      unused('CA-11', 'Haul Route Blocked'),
      selected('CA-12', 'Cap Check Absent From PM', 'Add a nozzle-cap removal and free-path check to the HT-07 fire-system PM, then complete that check on the rest of the haul fleet.', 'Planning Supervisor', duePm, '$3,500'),
      unused('CA-13', 'Nozzle Cap Left On'),
      unused('CA-14', 'Suppression Nozzle Blocked'),
      unused('CA-15', 'Suppression Handle Pulled'),
      unused('CA-16', 'Rebuild Pack List Unknown')
    ],
    gaps: [],
    summary: `On ${incidentDate} at 14:20, haul truck HT-07 caught fire on the Pit 3 ramp at a fictional mine. A hydraulic hose had ruptured at 14:05 and sprayed oil onto a hot turbo surface. The turbo heat shield was not in place after a rebuild. The cab log shows the truck still moving after the hydraulic alarm started at 14:10. On-board suppression was activated at 14:19, but the nozzle facing the turbo was blocked by a shipping cap. The ramp was closed until 20:20. One fact is still open: the rebuild pack list has not been found, so it is not yet known whether the shield was in the kit. Air at the turbo face is a natural condition and is marked STOP as a desired condition. Selected actions are already in the solution matrix: clamps on the hose run, a heat-shield sign-off, an oil-deflection shield, and a nozzle-cap check on the fire-system PM.`,
    log: [
      'PE-1 is a verified And set: the fire needed the ruptured hose, a hot turbo surface, oil, and oxygen together.',
      'Hot Turbo Surface is an Or set: the missing shield is supported, and the rebuild pack list is still unknown.',
      'Oxygen Present ends in STOP — Desired Condition.',
      'Rebuild Pack List Unknown ends in Need More Info, to teach a fact still to gather.'
    ]
  };

  return { intake, analysis };
}

export function sampleMatchIntake(e, sample) {
  try {
    const ke = sample || getSampleCase().intake;
    return !!e && Array.isArray(e.effects) && e.effects.length === ke.effects.length
      && e.effects.every((row, i) => row.what === ke.effects[i].what && row.where === ke.effects[i].where)
      && (e.timeline || []).length === ke.timeline.length
      && e.timeline.every((row, i) => row.description === ke.timeline[i].description);
  } catch {
    return false;
  }
}

export { isoDateFromToday };

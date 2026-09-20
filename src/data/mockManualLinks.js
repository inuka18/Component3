// PM-authored overrides layered on top of the Network Map's automatic
// (Pathfinder-style) clustering and linking: a human explicitly saying
// "these two are related" when the algorithm hasn't inferred it. Kept as
// its own store, entirely separate from mockRequirements.js's own
// algorithmic `relatedIds`, so the automatic layer is never mutated by
// this feature: buildNetworkLayout() still computes the same edges from
// `relatedIds` it always has, and the Network Map simply draws these on
// top, visually distinct.
//
// Every entry here also produces a Traceability Ledger record (see
// mockLedger.js's appendManualLinkLedgerEntry) at the moment it's created
// or removed. This array is the live/current state, the ledger is the
// permanent audit trail of how it got that way.
export const mockManualLinks = [];

let linkSeq = 0;

export function getManualLinksForProject(projectId) {
  return mockManualLinks.filter((l) => l.projectId === projectId);
}

export function findManualLink(sourceId, targetId) {
  return (
    mockManualLinks.find(
      (l) => (l.sourceId === sourceId && l.targetId === targetId) || (l.sourceId === targetId && l.targetId === sourceId)
    ) ?? null
  );
}

export function addManualLink({ projectId, sourceId, targetId, reason, createdBy }) {
  linkSeq += 1;
  const link = {
    id: `manual-link-${Date.now()}-${linkSeq}`,
    projectId,
    sourceId,
    targetId,
    reason,
    createdBy,
    createdAt: new Date().toISOString(),
  };
  mockManualLinks.push(link);
  return link;
}

export function removeManualLink(id) {
  const idx = mockManualLinks.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  const [removed] = mockManualLinks.splice(idx, 1);
  return removed;
}

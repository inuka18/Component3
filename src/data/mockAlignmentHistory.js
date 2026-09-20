// Daily alignment-score history, keyed by project: how closely the
// formal requirements graph (mockRequirements.js's relationships) still
// matches what execution signals (mockSignals.js) currently imply about
// how those requirements relate to each other. `connectionsAdded` and
// `connectionsRemoved` are the two halves of `changedConnections`
// (added + removed === changed) rather than a separate, disconnected
// number, so the two never drift out of sync with each other.
//
// `driverSignalId` is set only on the day a single signal explains most
// of that day's drop. Most days have none, same as a real "what changed
// today" feed wouldn't always have a single headline cause.

export const mockAlignmentHistory = {
  "proj-novacart": [
    { date: "2026-08-12", alignmentScore: 88, connectionsAdded: 0, connectionsRemoved: 0, changedConnections: 0, driverSignalId: null },
    { date: "2026-08-13", alignmentScore: 86, connectionsAdded: 1, connectionsRemoved: 0, changedConnections: 1, driverSignalId: null },
    { date: "2026-08-14", alignmentScore: 84, connectionsAdded: 0, connectionsRemoved: 1, changedConnections: 1, driverSignalId: null },
    { date: "2026-08-15", alignmentScore: 85, connectionsAdded: 1, connectionsRemoved: 0, changedConnections: 1, driverSignalId: null },
    { date: "2026-08-16", alignmentScore: 83, connectionsAdded: 0, connectionsRemoved: 0, changedConnections: 0, driverSignalId: null },
    { date: "2026-08-17", alignmentScore: 58, connectionsAdded: 2, connectionsRemoved: 4, changedConnections: 6, driverSignalId: "SIG-2012" },
    { date: "2026-08-18", alignmentScore: 63, connectionsAdded: 1, connectionsRemoved: 1, changedConnections: 2, driverSignalId: null },
    { date: "2026-08-19", alignmentScore: 67, connectionsAdded: 1, connectionsRemoved: 0, changedConnections: 1, driverSignalId: null },
    { date: "2026-08-20", alignmentScore: 71, connectionsAdded: 0, connectionsRemoved: 1, changedConnections: 1, driverSignalId: null },
    { date: "2026-08-21", alignmentScore: 74, connectionsAdded: 1, connectionsRemoved: 1, changedConnections: 2, driverSignalId: null },
    { date: "2026-08-22", alignmentScore: 76, connectionsAdded: 0, connectionsRemoved: 0, changedConnections: 0, driverSignalId: null },
    { date: "2026-08-23", alignmentScore: 79, connectionsAdded: 1, connectionsRemoved: 0, changedConnections: 1, driverSignalId: null },
    { date: "2026-08-24", alignmentScore: 69, connectionsAdded: 1, connectionsRemoved: 2, changedConnections: 3, driverSignalId: "SIG-2015" },
    { date: "2026-08-25", alignmentScore: 73, connectionsAdded: 1, connectionsRemoved: 0, changedConnections: 1, driverSignalId: null },
    { date: "2026-08-26", alignmentScore: 77, connectionsAdded: 1, connectionsRemoved: 0, changedConnections: 1, driverSignalId: null },
    { date: "2026-08-27", alignmentScore: 80, connectionsAdded: 0, connectionsRemoved: 0, changedConnections: 0, driverSignalId: null },
    { date: "2026-08-28", alignmentScore: 82, connectionsAdded: 1, connectionsRemoved: 0, changedConnections: 1, driverSignalId: null },
    { date: "2026-08-29", alignmentScore: 84, connectionsAdded: 0, connectionsRemoved: 0, changedConnections: 0, driverSignalId: null },
  ],
  "proj-meridianpay": [
    { date: "2026-08-12", alignmentScore: 90, connectionsAdded: 0, connectionsRemoved: 0, changedConnections: 0, driverSignalId: null },
    { date: "2026-08-13", alignmentScore: 89, connectionsAdded: 1, connectionsRemoved: 0, changedConnections: 1, driverSignalId: null },
    { date: "2026-08-14", alignmentScore: 91, connectionsAdded: 0, connectionsRemoved: 0, changedConnections: 0, driverSignalId: null },
    { date: "2026-08-15", alignmentScore: 88, connectionsAdded: 0, connectionsRemoved: 1, changedConnections: 1, driverSignalId: null },
    { date: "2026-08-16", alignmentScore: 90, connectionsAdded: 0, connectionsRemoved: 0, changedConnections: 0, driverSignalId: null },
    { date: "2026-08-17", alignmentScore: 87, connectionsAdded: 1, connectionsRemoved: 1, changedConnections: 2, driverSignalId: null },
    { date: "2026-08-18", alignmentScore: 82, connectionsAdded: 1, connectionsRemoved: 1, changedConnections: 2, driverSignalId: null },
    { date: "2026-08-19", alignmentScore: 85, connectionsAdded: 1, connectionsRemoved: 0, changedConnections: 1, driverSignalId: null },
    { date: "2026-08-20", alignmentScore: 80, connectionsAdded: 0, connectionsRemoved: 2, changedConnections: 2, driverSignalId: null },
    { date: "2026-08-21", alignmentScore: 61, connectionsAdded: 1, connectionsRemoved: 4, changedConnections: 5, driverSignalId: "SIG-3011" },
    { date: "2026-08-22", alignmentScore: 66, connectionsAdded: 1, connectionsRemoved: 1, changedConnections: 2, driverSignalId: null },
    { date: "2026-08-23", alignmentScore: 70, connectionsAdded: 1, connectionsRemoved: 0, changedConnections: 1, driverSignalId: null },
    { date: "2026-08-24", alignmentScore: 74, connectionsAdded: 1, connectionsRemoved: 0, changedConnections: 1, driverSignalId: null },
    { date: "2026-08-25", alignmentScore: 78, connectionsAdded: 0, connectionsRemoved: 0, changedConnections: 0, driverSignalId: null },
    { date: "2026-08-26", alignmentScore: 82, connectionsAdded: 1, connectionsRemoved: 0, changedConnections: 1, driverSignalId: null },
    { date: "2026-08-27", alignmentScore: 85, connectionsAdded: 0, connectionsRemoved: 0, changedConnections: 0, driverSignalId: null },
    { date: "2026-08-28", alignmentScore: 87, connectionsAdded: 1, connectionsRemoved: 0, changedConnections: 1, driverSignalId: null },
    { date: "2026-08-29", alignmentScore: 89, connectionsAdded: 0, connectionsRemoved: 0, changedConnections: 0, driverSignalId: null },
  ],
};

export function getAlignmentHistoryForProject(projectId) {
  return mockAlignmentHistory[projectId] ?? [];
}

export function getLatestAlignment(projectId) {
  const history = getAlignmentHistoryForProject(projectId);
  return history[history.length - 1] ?? null;
}

// The breakdown row's three numbers, summed over the trailing 7 days of
// whatever history is loaded, not a separately-maintained figure.
export function getWeeklyAlignmentBreakdown(projectId) {
  const week = getAlignmentHistoryForProject(projectId).slice(-7);
  return week.reduce(
    (acc, day) => ({
      changedConnections: acc.changedConnections + day.changedConnections,
      connectionsAdded: acc.connectionsAdded + day.connectionsAdded,
      connectionsRemoved: acc.connectionsRemoved + day.connectionsRemoved,
    }),
    { changedConnections: 0, connectionsAdded: 0, connectionsRemoved: 0 }
  );
}

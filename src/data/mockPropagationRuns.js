// Persisted results of "Calculate Propagation Impact" runs (see the
// Workspace... actually the Propagation page's Dependency Ripple card).
// The Propagation page is "the engine": it computes a run and appends it
// here. The Assessment page is "the report": it only ever reads this
// array, never recomputes anything. Handing a run to Schedule happens the
// same moment it's recorded (see recordPropagationRun), so every run is
// sentToC3 by the time anything reads it. sentToC3At is what the
// Assessment page's "Sent to Schedule" line shows a relative time against.
// Two runs are pre-seeded (for the two gaps that already start life with
// status "Propagated" in mockGaps.js) so Assessment has real content on
// first visit, before anyone has run a calculation this session.

export const mockPropagationRuns = [
  {
    id: "run-nc-01",
    projectId: "proj-novacart",
    gapId: "gap-nc-06",
    timestamp: "2026-08-24T10:20:00+05:30",
    dayImpact: { affectedTasks: 2, workloadImpact: "+5h", expectedSlip: "0.5 days", risk: "Low" },
    weekImpact: { affectedTasks: 3, workloadImpact: "+14h", expectedSlip: "2 days", risk: "Medium" },
    sprintImpact: { affectedCommitments: 2, storyPointsAtRisk: 8, expectedSprintSlip: "3 days", risk: "Medium" },
    sentToC3: true,
    sentToC3At: "2026-08-24T10:20:00+05:30",
  },
  {
    id: "run-mp-01",
    projectId: "proj-meridianpay",
    gapId: "gap-mp-06",
    timestamp: "2026-08-19T09:25:00+05:30",
    dayImpact: { affectedTasks: 1, workloadImpact: "+2h", expectedSlip: "0.25 days", risk: "Low" },
    weekImpact: { affectedTasks: 1, workloadImpact: "+6h", expectedSlip: "1 day", risk: "Low" },
    sprintImpact: { affectedCommitments: 1, storyPointsAtRisk: 5, expectedSprintSlip: "1 day", risk: "Low" },
    sentToC3: true,
    sentToC3At: "2026-08-19T09:25:00+05:30",
  },
];

export function getPropagationRunsForProject(projectId) {
  return mockPropagationRuns
    .filter((r) => r.projectId === projectId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

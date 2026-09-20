// Every C2/C3 handoff Component 4 has made, in one shared place. Both
// the Learning Loop's per-item queue sends and the Reports page's
// whole-project aggregate send write here, so Reports' own "Feedback-Loop
// Status" section can show a complete picture regardless of which page a
// PM actually sent something from. Session-only (like every other mock
// mutation in this app), not persisted across a reload.
export const mockFeedbackLog = [];

let logSeq = 0;

export function appendFeedbackLogEntry({ projectId, scope, refId, refLabel, destinations, sentBy }) {
  logSeq += 1;
  const entry = {
    id: `fb-${Date.now()}-${logSeq}`,
    projectId,
    scope, // "item" (one cross-validation entry, from Learning Loop) | "report" (whole-project rollup, from Reports)
    refId: refId ?? null,
    refLabel,
    destinations, // ["component-2"], ["component-3"], or both
    sentAt: new Date().toISOString(),
    sentBy: sentBy ?? null,
  };
  mockFeedbackLog.push(entry);
  return entry;
}

export function getFeedbackLogForProject(projectId) {
  return mockFeedbackLog
    .filter((e) => e.projectId === projectId)
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
}

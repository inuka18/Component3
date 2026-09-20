// Time log entries keyed by task id, kept as its own small store rather
// than inline on each mockSchedulePhases.js task record, since logging
// time is an activity stream (append-only), not a scheduling field.
// Ported from mockSchedule.js's original Kanban board seed data for every
// task id that already had entries recorded there, so the restored
// Kanban Board (src/features/board/) and the Gantt-based Schedule feature
// show genuinely consistent history for any task that appears in both.
// mockSchedule.js itself is left untouched (Gap Detection, both
// dashboards, and the Team member detail dialog still depend on it
// directly).

export const mockTimeLogs = {
  "task-nc-06": [
    {
      id: "log-nc-06-1",
      hours: 4,
      date: "2026-08-18",
      note: "Investigated shared session SDK blocker with mobile platform team.",
      delayReason: "Dependency blocked",
    },
  ],
  "task-nc-07": [
    { id: "log-nc-07-1", hours: 5, date: "2026-08-19", note: "Implemented threshold check + manual review routing." },
  ],
  "task-nc-09": [
    {
      id: "log-nc-09-1",
      hours: 3,
      date: "2026-08-24",
      note: "Reworked schema again after new admin action was added mid-sprint.",
      delayReason: "Requirement unclear",
    },
  ],
  "task-nc-11": [
    { id: "log-nc-11-1", hours: 6, date: "2026-08-20", note: "Relaxed latency budget, re-ran ranking eval suite." },
  ],
  "task-nc-14": [
    { id: "log-nc-14-1", hours: 6, date: "2026-08-09", note: "Implemented and tested end-to-end OAuth flow." },
  ],
  "task-nc-15": [
    { id: "log-nc-15-1", hours: 10, date: "2026-08-10", note: "Migrated all card-storage paths to the vault provider." },
  ],
  "task-nc-18": [
    {
      id: "log-nc-18-1",
      hours: 12,
      date: "2026-08-09",
      note: "Shipped shadow-mode scoring, validating recall before go-live.",
    },
  ],
  "task-mp-04": [
    {
      id: "log-mp-04-1",
      hours: 3,
      date: "2026-08-19",
      note: "Waiting on fraud review queue changes before wiring the cap check in.",
      delayReason: "Dependency blocked",
    },
  ],
  "task-mp-06": [
    {
      id: "log-mp-06-1",
      hours: 2,
      date: "2026-08-23",
      note: "Agents keep skipping the reason field, reworking as a hard blocker on submit.",
      delayReason: "Technical complexity underestimated",
    },
  ],
  "task-mp-09": [
    { id: "log-mp-09-1", hours: 7, date: "2026-07-28", note: "Load tested SMS gateway at 3x expected peak volume." },
  ],
  "task-mp-11": [
    { id: "log-mp-11-1", hours: 9, date: "2026-08-01", note: "Integrated liveness SDK, passed accessibility testing." },
  ],
};

export function getTimeLogsForTask(taskId) {
  return mockTimeLogs[taskId] ?? [];
}

export function addTimeLog(taskId, entry) {
  const newEntry = { id: `log-${taskId}-${Date.now()}`, ...entry };
  if (!mockTimeLogs[taskId]) mockTimeLogs[taskId] = [];
  mockTimeLogs[taskId].push(newEntry);
  return newEntry;
}

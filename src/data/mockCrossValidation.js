// Component 4: Retrospective Intelligence & Accountability Engine.
// This is the cross-validation LAYER mockRetrospectives.js's own header
// comment calls out: it checks the structured `delayReason` a developer
// picked in the Log Time dialog (src/features/board/components/
// TaskDetailDialog.jsx, values from mockSchedule.js's DELAY_REASONS)
// against what NLP extraction would surface from that sprint's
// retrospective transcript, then checks THAT against the Traceability
// Ledger (mockLedger.js, built off mockRequirements.js statusHistory),
// three independent sources that should agree, but often don't.
//
// Every entry below is built on real, already-existing records rather
// than invented ones: `delayLogId` points at a real mockTimeLogs.js
// entry, `taskId` at a real mockSchedulePhases.js task, and
// `linkedRequirementId` at a real mockRequirements.js requirement whose
// statusHistory is what `ledgerResult` is actually checked against.

export const LEDGER_RESULTS = ["Confirmed", "Partially Supported", "Not Supported"];
// Only two real statuses: "bulk-accepted" is HOW an entry got
// reconciled (see `reconciledVia`), not a status of its own, so a
// bulk-accepted entry and a manually-reconciled one are indistinguishable
// to every other page that just checks `status !== "Pending"`.
export const CROSS_VALIDATION_STATUSES = ["Pending", "Reconciled"];

// Slugs for the sprints these comparisons were run against. This module
// doesn't have a pre-existing sprint-ID system to borrow, so these are
// its own, consistent within Component 4's own files (mockActions.js
// reuses the same slugs for sourceSprintId/targetSprintId).
// `meetingId`/`retroId`, where present, are the real link into
// mockMeetings.js / mockRetrospectives.js for that sprint's retrospective,
// omitted for sprints still in progress, which haven't had one yet.
export const SPRINT_LABELS = {
  "nc-sprint-3": { projectId: "proj-novacart", name: "Sprint 3: Checkout Foundations", retroId: "retro-nc-03" },
  "nc-sprint-4": { projectId: "proj-novacart", name: "Sprint 4: Payments & Wallet Kickoff", retroId: "retro-nc-04" },
  "nc-sprint-5": { projectId: "proj-novacart", name: "Sprint 5: Fraud & Search Hardening", meetingId: "mtg-nc-04", retroId: "retro-nc-05" },
  "nc-sprint-6": { projectId: "proj-novacart", name: "Sprint 6: Wallet & Fraud Hardening" },
  "nc-sprint-7": { projectId: "proj-novacart", name: "Sprint 7 (upcoming)" },
  "mp-sprint-1": { projectId: "proj-meridianpay", name: "Sprint 1: Foundations & Onboarding Kickoff", retroId: "retro-mp-01" },
  "mp-sprint-2": { projectId: "proj-meridianpay", name: "Sprint 2: Onboarding Ship & Device Binding", meetingId: "mtg-mp-04", retroId: "retro-mp-02" },
  "mp-sprint-3": { projectId: "proj-meridianpay", name: "Sprint 3: Onboarding & Compliance" },
};

// Every task with a `cause` record but no cross-validation entry yet:
// "Run NLP Simulation" draws its 1-2 new entries from here, so a
// simulated result still always points at a real task/requirement rather
// than an invented one. Keyed by projectId.
export const SIMULATION_CANDIDATES = {
  "proj-novacart": ["task-nc-07", "task-nc-08", "task-nc-11"],
  "proj-meridianpay": ["task-mp-05"],
};

// A task's `cause.type` maps to the delay-reason vocabulary a developer
// would most plausibly have picked in the Log Time dialog for that kind
// of slip, used both to seed a simulated entry's structuredCode and to
// score how well it agrees with the NLP-extracted cause.
export const CAUSE_TYPE_TO_DELAY_REASON = {
  "requirement-change": "Requirement unclear",
  "resource-disruption": "Resource unavailable",
  "ripple-propagation": "Dependency blocked",
};

export const mockCrossValidation = [
  {
    id: "cv-01",
    projectId: "proj-meridianpay",
    delayLogId: "log-mp-06-1",
    loggedDate: "2026-08-23",
    taskId: "task-mp-06",
    sprintId: "mp-sprint-2",
    structuredCode: "Technical complexity underestimated",
    nlpExtractedCause:
      "Regulator's CBSL reporting template changed mid-build, forcing a switch to the updated Q3 schema: a requirement change, not a technical difficulty.",
    semanticScore: 34,
    confidence: 88,
    evidenceExcerpt:
      "[00:13] Nuwan Karunaratne: Also flagging: the CBSL reporting template changed since we scoped the export. Switching to the updated Q3 schema now.",
    linkedRequirementId: "REQ-212",
    ledgerResult: "Confirmed",
    status: "Pending",
    originalCause: "Technical complexity underestimated",
    reconciledCause: null,
    reviewerNotes: null,
    reconciledVia: null,
    history: [{ status: "Pending", date: "2026-08-23T09:00:00+05:30", note: "Cross-validation run against Sprint 2's retrospective." }],
  },
  {
    id: "cv-02",
    projectId: "proj-meridianpay",
    delayLogId: "log-mp-04-1",
    loggedDate: "2026-08-19",
    taskId: "task-mp-04",
    sprintId: "mp-sprint-2",
    structuredCode: "Dependency blocked",
    nlpExtractedCause:
      "Fraud review flagged unlimited recurring transfers as a risk mid-sprint and capped standing orders at 5/account. The block traces back to that requirement change, not an independent dependency.",
    semanticScore: 81,
    confidence: 85,
    evidenceExcerpt:
      "[00:09] Yasodha Wijeratne: On standing orders: fraud flagged concerns about unlimited recurring transfers mid-sprint, so we capped it at 5 per account for v1.",
    linkedRequirementId: "REQ-204",
    ledgerResult: "Partially Supported",
    status: "Reconciled",
    originalCause: "Dependency blocked",
    reconciledCause: "Dependency blocked: root cause traces to REQ-204's mid-sprint standing-order cap",
    reviewerNotes: "Kept the logged code: it's technically accurate, just missing the upstream requirement-change trigger. Noted for the report.",
    reconciledVia: "manual",
    history: [
      { status: "Pending", date: "2026-08-19T09:00:00+05:30", note: "Cross-validation run against Sprint 2's retrospective." },
      {
        status: "Reconciled",
        date: "2026-08-21T09:00:00+05:30",
        note: "Reconciled by PM: Dependency blocked, root cause traces to REQ-204's mid-sprint standing-order cap.",
      },
    ],
  },
  {
    id: "cv-03",
    projectId: "proj-novacart",
    delayLogId: "log-nc-09-1",
    loggedDate: "2026-08-24",
    taskId: "task-nc-09",
    sprintId: "nc-sprint-5",
    structuredCode: "Requirement unclear",
    nlpExtractedCause:
      "New admin actions kept getting added mid-sprint, forcing repeated schema rework: a scope/requirement-change pattern rather than genuine ambiguity in what was asked for.",
    semanticScore: 58,
    confidence: 72,
    evidenceExcerpt: "RBAC permission schema churned twice as new admin actions were added mid-sprint.",
    linkedRequirementId: "REQ-124",
    ledgerResult: "Not Supported",
    status: "Pending",
    originalCause: "Requirement unclear",
    reconciledCause: null,
    reviewerNotes: null,
    reconciledVia: null,
    history: [{ status: "Pending", date: "2026-08-24T09:00:00+05:30", note: "Cross-validation run against Sprint 5's retrospective." }],
  },
  {
    id: "cv-04",
    projectId: "proj-novacart",
    delayLogId: "log-nc-06-1",
    loggedDate: "2026-08-18",
    taskId: "task-nc-06",
    sprintId: "nc-sprint-6",
    structuredCode: "Dependency blocked",
    nlpExtractedCause:
      "Session-timeout parity blocked on the shared mobile SDK owned by another workstream, which matches the logged reason exactly.",
    semanticScore: 95,
    confidence: 91,
    evidenceExcerpt: "Investigated shared session SDK blocker with mobile platform team.",
    linkedRequirementId: "REQ-103",
    ledgerResult: "Confirmed",
    status: "Pending",
    originalCause: "Dependency blocked",
    reconciledCause: null,
    reviewerNotes: null,
    reconciledVia: null,
    history: [{ status: "Pending", date: "2026-08-18T09:00:00+05:30", note: "Cross-validation run against Sprint 6's in-progress data." }],
  },
];

export function getCrossValidationForProject(projectId) {
  return mockCrossValidation.filter((cv) => cv.projectId === projectId);
}

export function getCrossValidationById(id) {
  return mockCrossValidation.find((cv) => cv.id === id) ?? null;
}

function pushHistory(entry, status, note) {
  entry.history.push({ status, date: new Date().toISOString(), note });
}

// Mutates the shared store directly, same pattern as
// retrospectivesService.js's action-item mutators, so a reconciliation
// made here is immediately visible anywhere else this entry is read.
// `originalCause` is never touched here or anywhere else. It's the
// as-logged record, permanently.
export function reconcileCrossValidation(id, { reconciledCause, reviewerNotes, via = "manual" }) {
  const entry = getCrossValidationById(id);
  if (!entry) return null;
  entry.status = "Reconciled";
  entry.reconciledCause = reconciledCause;
  entry.reviewerNotes = reviewerNotes ?? entry.reviewerNotes;
  entry.reconciledVia = via;
  pushHistory(entry, "Reconciled", via === "bulk" ? `Bulk-accepted: ${reconciledCause}` : `Reconciled by PM: ${reconciledCause}`);
  return entry;
}

// Auto-accepts every still-Pending entry at or above `threshold`, keeping
// the structured code as-logged (a high semantic score means it already
// agrees with the NLP-extracted cause, so there's nothing to correct).
// Returns only the ids actually affected, so the caller can toast an
// accurate count and offer to undo exactly this batch.
export function bulkAcceptCrossValidation(ids, threshold) {
  const affected = [];
  ids.forEach((id) => {
    const entry = getCrossValidationById(id);
    if (!entry || entry.status !== "Pending" || entry.semanticScore < threshold) return;
    reconcileCrossValidation(id, { reconciledCause: entry.structuredCode, reviewerNotes: null, via: "bulk" });
    affected.push(id);
  });
  return affected;
}

// The correction path: reopens a Reconciled entry (manually or
// bulk-accepted, no distinction) back to Pending. `reconciledCause` and
// `reviewerNotes` are left in place rather than cleared: the history log
// is the authoritative record of what happened, but the last reconciled
// value stays visible as context for whoever reviews it next.
export function reopenCrossValidation(id, note = "Reopened for re-review.") {
  const entry = getCrossValidationById(id);
  if (!entry) return null;
  entry.status = "Pending";
  pushHistory(entry, "Pending", note);
  return entry;
}

let cvSeq = mockCrossValidation.length;

// "Run NLP Simulation" generates 1-2 fresh entries from real,
// not-yet-checked tasks (SIMULATION_CANDIDATES) rather than fabricating
// disconnected data. The NLP-extracted cause reuses the task's own real
// `cause.description`; the ledger result is a genuine check against the
// linked requirement's real statusHistory, not a random pick.
export function runNlpSimulation(projectId, tasks, requirements) {
  const candidates = (SIMULATION_CANDIDATES[projectId] ?? []).filter(
    (taskId) => !mockCrossValidation.some((cv) => cv.taskId === taskId)
  );
  const picks = candidates.slice(0, Math.random() < 0.5 ? 1 : 2);

  const created = picks
    .map((taskId) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task?.cause) return null;
      const requirement = requirements.find((r) => r.id === task.cause.linkedRequirementId);
      const mappedCode = CAUSE_TYPE_TO_DELAY_REASON[task.cause.type] ?? "Other";
      // Most of the time the simulation finds agreement (the mapped code
      // really does match); sometimes it surfaces a genuine mismatch,
      // same as a real semantic-comparison pass would.
      const isMismatch = Math.random() < 0.4;
      const structuredCode = isMismatch
        ? Object.values(CAUSE_TYPE_TO_DELAY_REASON).find((c) => c !== mappedCode) ?? mappedCode
        : mappedCode;
      const semanticScore = isMismatch ? 25 + Math.floor(Math.random() * 30) : 78 + Math.floor(Math.random() * 20);
      const confidence = 65 + Math.floor(Math.random() * 28);
      const ledgerResult =
        requirement?.liveStatus === "Modified" ? "Confirmed" : requirement?.liveStatus === "At Risk" ? "Partially Supported" : "Not Supported";

      cvSeq += 1;
      const entry = {
        id: `cv-sim-${Date.now()}-${cvSeq}`,
        projectId,
        delayLogId: null,
        loggedDate: new Date().toISOString().slice(0, 10),
        taskId,
        sprintId: sprintIdForProject(projectId),
        structuredCode,
        nlpExtractedCause: task.cause.description,
        semanticScore,
        confidence,
        evidenceExcerpt: task.cause.description,
        linkedRequirementId: task.cause.linkedRequirementId,
        ledgerResult,
        status: "Pending",
        originalCause: structuredCode,
        reconciledCause: null,
        reviewerNotes: null,
        reconciledVia: null,
        history: [{ status: "Pending", date: new Date().toISOString(), note: "Generated by an on-demand NLP Simulation run." }],
      };
      mockCrossValidation.push(entry);
      return entry;
    })
    .filter(Boolean);

  return created;
}

function sprintIdForProject(projectId) {
  const inProgress = Object.entries(SPRINT_LABELS).find(([, s]) => s.projectId === projectId && !s.meetingId);
  return inProgress?.[0] ?? Object.keys(SPRINT_LABELS).find((id) => SPRINT_LABELS[id].projectId === projectId);
}

// The single source of truth for every action item in this app, whether
// it started as a suggestion in a sprint retrospective's discussion, as
// the fix for a reconciled cross-validation cause, or (occasionally) both
// at once. There used to be a second, lighter-weight action-item model
// living inline on each retrospective record (mockRetrospectives.js,
// Suggested/Assigned/Done). That model is gone; every one of those items
// now lives here instead, mapped onto this file's five-state model
// (Suggested → Open, Assigned → In Progress, Done → Verified) so an
// action looks and behaves identically no matter where it's viewed from.
// These track WORK OUTCOMES only: status, evidence, verification, never
// individual performance. No leaderboard, score, or comparative ranking
// of people is derived from this data anywhere in this feature.
import { TODAY } from "./mockSchedulePhases";

// The four states an action can actually be *set* to: what forms,
// drag-and-drop, and setActionStatus() work with.
export const ACTION_STATUSES = ["Open", "In Progress", "Evidence Submitted", "Verified"];

// The five columns the board actually shows. "Overdue" isn't a fifth
// stored status (see getDisplayStatus()); it's what an action's real
// status + dueDate compute to, so a card can never be stuck labeled
// Overdue after being verified, or after its due date moves.
export const BOARD_COLUMNS = ["Open", "In Progress", "Evidence Submitted", "Verified", "Overdue"];

export const mockActions = [
  {
    id: "action-01",
    title: "Re-scope the reason-code field work against the updated CBSL Q3 schema",
    reconciledCauseId: "cv-01",
    retroId: null,
    ownerId: "tm-17",
    sourceSprintId: "mp-sprint-2",
    targetSprintId: "mp-sprint-3",
    dueDate: "2026-09-01T18:00:00+05:30",
    successCriterion: "Reason-code required field ships wired to the updated Q3 CBSL export schema, not the original one.",
    status: "In Progress",
    evidenceIds: ["ev-03"],
    recurrenceFlag: false,
    history: [
      { status: "Open", date: "2026-08-20T10:00:00+05:30", note: "Created from cv-01's mismatch, logged cause didn't credit the schema change." },
      { status: "In Progress", date: "2026-08-23T09:15:00+05:30", note: "Chathurika started the schema-migration rework." },
    ],
  },
  {
    id: "action-02",
    title: "Trace ripple-propagation delay logs back to their originating requirement change",
    reconciledCauseId: "cv-02",
    retroId: null,
    ownerId: "tm-13",
    sourceSprintId: "mp-sprint-2",
    targetSprintId: "mp-sprint-2",
    dueDate: "2026-08-22T18:00:00+05:30",
    successCriterion: "Standing-order cap enforcement log cites REQ-204 as the originating cause, not just 'blocked'.",
    status: "Verified",
    evidenceIds: ["ev-02"],
    recurrenceFlag: false,
    history: [
      { status: "Open", date: "2026-08-15T11:00:00+05:30", note: "Created from cv-02's reconciliation." },
      { status: "Evidence Submitted", date: "2026-08-20T14:30:00+05:30", note: "Yasodha submitted the updated log entry as evidence." },
      { status: "Verified", date: "2026-08-21T09:00:00+05:30", note: "PM verified the citation traces cleanly to REQ-204." },
    ],
  },
  {
    id: "action-03",
    title: "Add a design buffer to sprint planning whenever a requirement is flagged Modified mid-sprint",
    reconciledCauseId: "cv-03",
    retroId: "retro-nc-05",
    ownerId: "tm-01",
    sourceSprintId: "nc-sprint-5",
    targetSprintId: "nc-sprint-6",
    dueDate: "2026-08-30T18:00:00+05:30",
    successCriterion: "Sprint 6 planning includes an explicit buffer line item for any requirement flagged Modified after lock-in.",
    status: "Evidence Submitted",
    evidenceIds: ["ev-01"],
    recurrenceFlag: true,
    history: [
      { status: "Open", date: "2026-08-16T15:30:00+05:30", note: "Suggested during Sprint 5's retrospective (retro-nc-05)." },
      { status: "In Progress", date: "2026-08-24T10:00:00+05:30", note: "Tharindu drafted the buffer policy for Sprint 6 planning." },
      { status: "Evidence Submitted", date: "2026-08-28T09:45:00+05:30", note: "Sprint 6 planning agenda submitted as evidence." },
    ],
  },
  {
    id: "action-04",
    title: "Unblock the shared session-timeout SDK dependency before Sprint 6 closes",
    reconciledCauseId: "cv-04",
    retroId: null,
    ownerId: "tm-04",
    sourceSprintId: "nc-sprint-6",
    targetSprintId: "nc-sprint-6",
    dueDate: "2026-08-28T18:00:00+05:30",
    successCriterion: "task-nc-06 reaches Done with the mobile platform team's SDK blocker fully resolved.",
    status: "Open",
    evidenceIds: [],
    recurrenceFlag: false,
    history: [{ status: "Open", date: "2026-08-19T10:00:00+05:30", note: "Created from cv-04, a strong (95%) match that didn't need manual reconciliation." }],
  },
  {
    id: "action-05",
    title: "Formalize a change log for admin-console permission additions",
    reconciledCauseId: "cv-03",
    retroId: null,
    ownerId: "tm-10",
    sourceSprintId: "nc-sprint-6",
    targetSprintId: "nc-sprint-7",
    dueDate: "2026-09-13T18:00:00+05:30",
    successCriterion: "Every new admin action added to REQ-124's scope is logged as a discrete, ledger-visible change rather than absorbed silently into ongoing rework.",
    status: "Open",
    evidenceIds: [],
    recurrenceFlag: true,
    history: [{ status: "Open", date: "2026-08-27T13:00:00+05:30", note: "Second action spawned from cv-03, the ledger gap itself needs its own fix." }],
  },

  // ---- Migrated from the old Retrospectives feature's inline action items
  // (mockRetrospectives.js, pre-unification). Every one of these still
  // traces back to the retro it was suggested in via retroId. They never
  // went through an evidence-submission step in the old model, so
  // evidenceIds is empty even for ones mapped to Verified; the history
  // notes say so plainly rather than inventing evidence that never existed.

  // retro-nc-03, Sprint 3: Checkout Foundations
  {
    id: "action-nc03-1",
    title: "Pad third-party OAuth provider review time into future estimates",
    reconciledCauseId: null,
    retroId: "retro-nc-03",
    ownerId: "tm-09",
    sourceSprintId: "nc-sprint-3",
    targetSprintId: "nc-sprint-4",
    dueDate: "2026-07-31T18:00:00+05:30",
    successCriterion: "Pad third-party OAuth provider review time into future estimates.",
    status: "Verified",
    evidenceIds: [],
    recurrenceFlag: false,
    history: [
      { status: "Open", date: "2026-07-19T15:00:00+05:30", note: "Suggested during Sprint 3's retrospective (retro-nc-03)." },
      { status: "Verified", date: "2026-08-01T09:00:00+05:30", note: "Marked complete, migrated from the legacy Retrospectives tracker, which didn't record evidence." },
    ],
  },
  {
    id: "action-nc03-2",
    title: "Add an oversell regression test to the CI suite",
    reconciledCauseId: null,
    retroId: "retro-nc-03",
    ownerId: "tm-06",
    sourceSprintId: "nc-sprint-3",
    targetSprintId: "nc-sprint-4",
    dueDate: "2026-07-31T18:00:00+05:30",
    successCriterion: "Add an oversell regression test to the CI suite.",
    status: "Verified",
    evidenceIds: [],
    recurrenceFlag: false,
    history: [
      { status: "Open", date: "2026-07-19T15:00:00+05:30", note: "Suggested during Sprint 3's retrospective (retro-nc-03)." },
      { status: "Verified", date: "2026-08-01T09:00:00+05:30", note: "Marked complete, migrated from the legacy Retrospectives tracker, which didn't record evidence." },
    ],
  },
  {
    id: "action-nc03-3",
    title: "Document the Apple ID review-time lesson in the estimation playbook",
    reconciledCauseId: null,
    retroId: "retro-nc-03",
    ownerId: null,
    sourceSprintId: "nc-sprint-3",
    targetSprintId: "nc-sprint-3",
    dueDate: "2026-09-08T18:00:00+05:30",
    successCriterion: "Document the Apple ID review-time lesson in the estimation playbook.",
    status: "Open",
    evidenceIds: [],
    recurrenceFlag: false,
    history: [{ status: "Open", date: "2026-07-19T15:00:00+05:30", note: "Suggested during Sprint 3's retrospective (retro-nc-03), not yet assigned." }],
  },

  // retro-nc-04, Sprint 4: Payments & Wallet Kickoff
  {
    id: "action-nc04-1",
    title: "Engage FX vendor procurement at least two sprints ahead of need",
    reconciledCauseId: null,
    retroId: "retro-nc-04",
    ownerId: "tm-02",
    sourceSprintId: "nc-sprint-4",
    targetSprintId: "nc-sprint-5",
    dueDate: "2026-08-14T18:00:00+05:30",
    successCriterion: "Engage FX vendor procurement at least two sprints ahead of need.",
    status: "In Progress",
    evidenceIds: [],
    recurrenceFlag: false,
    history: [
      { status: "Open", date: "2026-08-02T15:00:00+05:30", note: "Suggested during Sprint 4's retrospective (retro-nc-04)." },
      { status: "In Progress", date: "2026-08-05T10:00:00+05:30", note: "Assigned to Nadeesha, targeting Sprint 5: Fraud & Search Hardening." },
    ],
  },
  {
    id: "action-nc04-2",
    title: "Bring fraud review queue design into planning earlier, not after scoring ships",
    reconciledCauseId: null,
    retroId: "retro-nc-04",
    ownerId: "tm-07",
    sourceSprintId: "nc-sprint-4",
    targetSprintId: "nc-sprint-5",
    dueDate: "2026-08-14T18:00:00+05:30",
    successCriterion: "Bring fraud review queue design into planning earlier, not after scoring ships.",
    status: "In Progress",
    evidenceIds: [],
    recurrenceFlag: false,
    history: [
      { status: "Open", date: "2026-08-02T15:00:00+05:30", note: "Suggested during Sprint 4's retrospective (retro-nc-04)." },
      { status: "In Progress", date: "2026-08-05T10:00:00+05:30", note: "Assigned to Sanduni, targeting Sprint 5: Fraud & Search Hardening." },
    ],
  },
  {
    id: "action-nc04-3",
    title: "Share PCI audit results with the wider engineering team",
    reconciledCauseId: null,
    retroId: "retro-nc-04",
    ownerId: "tm-03",
    sourceSprintId: "nc-sprint-4",
    targetSprintId: "nc-sprint-5",
    dueDate: "2026-08-14T18:00:00+05:30",
    successCriterion: "Share PCI audit results with the wider engineering team.",
    status: "Verified",
    evidenceIds: [],
    recurrenceFlag: false,
    history: [
      { status: "Open", date: "2026-08-02T15:00:00+05:30", note: "Suggested during Sprint 4's retrospective (retro-nc-04)." },
      { status: "Verified", date: "2026-08-13T09:00:00+05:30", note: "Marked complete, migrated from the legacy Retrospectives tracker, which didn't record evidence." },
    ],
  },
  {
    id: "action-nc04-4",
    title: "Explore a secondary FX rate provider as a fallback option",
    reconciledCauseId: null,
    retroId: "retro-nc-04",
    ownerId: null,
    sourceSprintId: "nc-sprint-4",
    targetSprintId: "nc-sprint-4",
    dueDate: "2026-09-08T18:00:00+05:30",
    successCriterion: "Explore a secondary FX rate provider as a fallback option.",
    status: "Open",
    evidenceIds: [],
    recurrenceFlag: false,
    history: [{ status: "Open", date: "2026-08-02T15:00:00+05:30", note: "Suggested during Sprint 4's retrospective (retro-nc-04), not yet assigned." }],
  },

  // retro-nc-05, Sprint 5: Fraud & Search Hardening (ai-nc-05-1 is action-03 above)
  {
    id: "action-nc05-2",
    title: "Fast-track the fraud review queue design handoff to unblock REQ-111",
    reconciledCauseId: null,
    retroId: "retro-nc-05",
    ownerId: "tm-07",
    sourceSprintId: "nc-sprint-5",
    targetSprintId: "nc-sprint-6",
    dueDate: "2026-08-28T18:00:00+05:30",
    successCriterion: "Fast-track the fraud review queue design handoff to unblock REQ-111.",
    status: "Verified",
    evidenceIds: [],
    recurrenceFlag: false,
    history: [
      { status: "Open", date: "2026-08-16T15:00:00+05:30", note: "Suggested during Sprint 5's retrospective (retro-nc-05)." },
      { status: "Verified", date: "2026-08-27T09:00:00+05:30", note: "Marked complete, migrated from the legacy Retrospectives tracker, which didn't record evidence." },
    ],
  },
  {
    id: "action-nc05-3",
    title: "Re-estimate the KYC vendor spike before committing it to next sprint",
    reconciledCauseId: null,
    retroId: "retro-nc-05",
    ownerId: "tm-05",
    sourceSprintId: "nc-sprint-5",
    targetSprintId: "nc-sprint-6",
    dueDate: "2026-08-28T18:00:00+05:30",
    successCriterion: "Re-estimate the KYC vendor spike before committing it to next sprint.",
    status: "In Progress",
    evidenceIds: [],
    recurrenceFlag: false,
    history: [
      { status: "Open", date: "2026-08-16T15:00:00+05:30", note: "Suggested during Sprint 5's retrospective (retro-nc-05)." },
      { status: "In Progress", date: "2026-08-19T10:00:00+05:30", note: "Assigned to Dinithi, targeting Sprint 6: Wallet & Fraud Hardening." },
    ],
  },
  {
    id: "action-nc05-4",
    title: "Split the checkout review-step work into smaller, independently reviewable PRs",
    reconciledCauseId: null,
    retroId: "retro-nc-05",
    ownerId: "tm-04",
    sourceSprintId: "nc-sprint-5",
    targetSprintId: "nc-sprint-6",
    dueDate: "2026-08-28T18:00:00+05:30",
    successCriterion: "Split the checkout review-step work into smaller, independently reviewable PRs.",
    status: "In Progress",
    evidenceIds: [],
    recurrenceFlag: false,
    history: [
      { status: "Open", date: "2026-08-16T15:00:00+05:30", note: "Suggested during Sprint 5's retrospective (retro-nc-05)." },
      { status: "In Progress", date: "2026-08-19T10:00:00+05:30", note: "Assigned to Kavindu, targeting Sprint 6: Wallet & Fraud Hardening." },
    ],
  },
  {
    id: "action-nc05-5",
    title: "Introduce a mid-sprint requirement-change checkpoint to catch scope shifts earlier",
    reconciledCauseId: null,
    retroId: "retro-nc-05",
    ownerId: null,
    sourceSprintId: "nc-sprint-5",
    targetSprintId: "nc-sprint-5",
    dueDate: "2026-09-08T18:00:00+05:30",
    successCriterion: "Introduce a mid-sprint requirement-change checkpoint to catch scope shifts earlier.",
    status: "Open",
    evidenceIds: [],
    recurrenceFlag: false,
    history: [{ status: "Open", date: "2026-08-16T15:00:00+05:30", note: "Suggested during Sprint 5's retrospective (retro-nc-05), not yet assigned." }],
  },

  // retro-mp-01, Sprint 1: Foundations & Onboarding Kickoff
  {
    id: "action-mp01-1",
    title: "Evaluate SMS gateway vendors before estimating any OTP-dependent work",
    reconciledCauseId: null,
    retroId: "retro-mp-01",
    ownerId: "tm-12",
    sourceSprintId: "mp-sprint-1",
    targetSprintId: "mp-sprint-2",
    dueDate: "2026-07-31T18:00:00+05:30",
    successCriterion: "Evaluate SMS gateway vendors before estimating any OTP-dependent work.",
    status: "Verified",
    evidenceIds: [],
    recurrenceFlag: false,
    history: [
      { status: "Open", date: "2026-07-19T16:00:00+05:30", note: "Suggested during Sprint 1's retrospective (retro-mp-01)." },
      { status: "Verified", date: "2026-08-01T09:00:00+05:30", note: "Marked complete, migrated from the legacy Retrospectives tracker, which didn't record evidence." },
    ],
  },
  {
    id: "action-mp01-2",
    title: "Confirm the compliance sign-off cadence with legal at the start of each sprint",
    reconciledCauseId: null,
    retroId: "retro-mp-01",
    ownerId: "tm-11",
    sourceSprintId: "mp-sprint-1",
    targetSprintId: "mp-sprint-2",
    dueDate: "2026-07-31T18:00:00+05:30",
    successCriterion: "Confirm the compliance sign-off cadence with legal at the start of each sprint.",
    status: "Verified",
    evidenceIds: [],
    recurrenceFlag: false,
    history: [
      { status: "Open", date: "2026-07-19T16:00:00+05:30", note: "Suggested during Sprint 1's retrospective (retro-mp-01)." },
      { status: "Verified", date: "2026-08-01T09:00:00+05:30", note: "Marked complete, migrated from the legacy Retrospectives tracker, which didn't record evidence." },
    ],
  },
  {
    id: "action-mp01-3",
    title: "Write up the anomaly-scoring lock-in decision for the compliance runbook",
    reconciledCauseId: null,
    retroId: "retro-mp-01",
    ownerId: null,
    sourceSprintId: "mp-sprint-1",
    targetSprintId: "mp-sprint-1",
    dueDate: "2026-09-08T18:00:00+05:30",
    successCriterion: "Write up the anomaly-scoring lock-in decision for the compliance runbook.",
    status: "Open",
    evidenceIds: [],
    recurrenceFlag: false,
    history: [{ status: "Open", date: "2026-07-19T16:00:00+05:30", note: "Suggested during Sprint 1's retrospective (retro-mp-01), not yet assigned." }],
  },

  // retro-mp-02, Sprint 2: Onboarding Ship & Device Binding
  {
    id: "action-mp02-1",
    title: "Add an Android device-matrix smoke test to CI before merging auth changes",
    reconciledCauseId: null,
    retroId: "retro-mp-02",
    ownerId: "tm-12",
    sourceSprintId: "mp-sprint-2",
    targetSprintId: "mp-sprint-3",
    dueDate: "2026-08-26T18:00:00+05:30",
    successCriterion: "Add an Android device-matrix smoke test to CI before merging auth changes.",
    status: "In Progress",
    evidenceIds: [],
    recurrenceFlag: false,
    history: [
      { status: "Open", date: "2026-08-14T15:00:00+05:30", note: "Suggested during Sprint 2's retrospective (retro-mp-02)." },
      { status: "In Progress", date: "2026-08-17T10:00:00+05:30", note: "Assigned to Chamika, targeting Sprint 3: Onboarding & Compliance." },
    ],
  },
  {
    id: "action-mp02-2",
    title: "Confirm the standing-order cap decision with the fraud team before next planning",
    reconciledCauseId: null,
    retroId: "retro-mp-02",
    ownerId: "tm-11",
    sourceSprintId: "mp-sprint-2",
    targetSprintId: "mp-sprint-3",
    dueDate: "2026-08-26T18:00:00+05:30",
    successCriterion: "Confirm the standing-order cap decision with the fraud team before next planning.",
    status: "Verified",
    evidenceIds: [],
    recurrenceFlag: false,
    history: [
      { status: "Open", date: "2026-08-14T15:00:00+05:30", note: "Suggested during Sprint 2's retrospective (retro-mp-02)." },
      { status: "Verified", date: "2026-08-25T09:00:00+05:30", note: "Marked complete, migrated from the legacy Retrospectives tracker, which didn't record evidence." },
    ],
  },
  {
    id: "action-mp02-3",
    title: "Document the CBSL schema change process so it isn't a surprise next quarter",
    reconciledCauseId: null,
    retroId: "retro-mp-02",
    ownerId: "tm-18",
    sourceSprintId: "mp-sprint-2",
    targetSprintId: "mp-sprint-3",
    dueDate: "2026-08-26T18:00:00+05:30",
    successCriterion: "Document the CBSL schema change process so it isn't a surprise next quarter.",
    status: "In Progress",
    evidenceIds: [],
    recurrenceFlag: false,
    history: [
      { status: "Open", date: "2026-08-14T15:00:00+05:30", note: "Suggested during Sprint 2's retrospective (retro-mp-02)." },
      { status: "In Progress", date: "2026-08-17T10:00:00+05:30", note: "Assigned to Nuwan, targeting Sprint 3: Onboarding & Compliance." },
    ],
  },
  {
    id: "action-mp02-4",
    title: "Expand the device test matrix to cover older Android security-patch levels",
    reconciledCauseId: null,
    retroId: "retro-mp-02",
    ownerId: null,
    sourceSprintId: "mp-sprint-2",
    targetSprintId: "mp-sprint-2",
    dueDate: "2026-09-08T18:00:00+05:30",
    successCriterion: "Expand the device test matrix to cover older Android security-patch levels.",
    status: "Open",
    evidenceIds: [],
    recurrenceFlag: false,
    history: [{ status: "Open", date: "2026-08-14T15:00:00+05:30", note: "Suggested during Sprint 2's retrospective (retro-mp-02), not yet assigned." }],
  },
];

export function getActionById(id) {
  return mockActions.find((a) => a.id === id) ?? null;
}

export function getActionsForOwner(ownerId) {
  return mockActions.filter((a) => a.ownerId === ownerId);
}

// Every action suggested during one retrospective. The Retrospectives
// tab's per-retro action list is just this, filtered, never a separate
// dataset. Sorted so unassigned (Open) items surface first, same as the
// retro list itself surfaces drafts first.
export function getActionsForRetro(retroId) {
  return mockActions.filter((a) => a.retroId === retroId);
}

// The one place "Overdue" gets decided: never stored, always computed,
// so an action can't stay visually stuck Overdue after being verified or
// after its due date is pushed out.
export function getDisplayStatus(action, today = TODAY) {
  if (action.status !== "Verified" && new Date(action.dueDate) < today) return "Overdue";
  return action.status;
}

// Turns an unowned Open action (most often one suggested during a retro's
// discussion, never a brand-new record) into an owned, in-progress one:
// the CreateActionDialog's "assign" mode, same owner+target-sprint shape
// the old, now-deleted AssignActionItemDialog collected. Never touches
// title/successCriterion/retroId/reconciledCauseId, those already
// describe the work; assigning only ever adds who's doing it and when.
export function assignAction(id, { ownerId, targetSprintId }) {
  const action = getActionById(id);
  if (!action) return null;
  action.ownerId = ownerId;
  action.targetSprintId = targetSprintId;
  action.status = "In Progress";
  action.history.push({ status: "In Progress", date: new Date().toISOString(), note: `Assigned.` });
  return action;
}

export function setActionStatus(id, status, note) {
  const action = getActionById(id);
  if (!action) return null;
  action.status = status;
  action.history.push({ status, date: new Date().toISOString(), note: note ?? "" });
  return action;
}

export function attachEvidence(actionId, evidenceId) {
  const action = getActionById(actionId);
  if (!action) return null;
  if (!action.evidenceIds.includes(evidenceId)) action.evidenceIds.push(evidenceId);
  return action;
}

let actionSeq = mockActions.length;

// PM-only: turns a reconciled cross-validation entry and/or a retro's
// suggested item into a tracked action, the "create/assign actions" half
// of the PM's full access. reconciledCauseId and retroId are each
// independently optional (an action can originate from a retro
// discussion, a reconciled cause, or both), but at least one should be
// set by the caller. A cause or a retro can spawn more than one action
// (cv-03 and retro-nc-05 both already do, above), so this never checks
// for an existing one.
export function createAction({ title, reconciledCauseId, retroId, ownerId, sourceSprintId, targetSprintId, dueDate, successCriterion }) {
  actionSeq += 1;
  const action = {
    id: `action-${Date.now()}-${actionSeq}`,
    title,
    reconciledCauseId: reconciledCauseId || null,
    retroId: retroId || null,
    ownerId: ownerId || null,
    sourceSprintId,
    targetSprintId: targetSprintId || sourceSprintId,
    dueDate,
    successCriterion,
    status: "Open",
    evidenceIds: [],
    recurrenceFlag: false,
    history: [{ status: "Open", date: new Date().toISOString(), note: reconciledCauseId ? `Created from ${reconciledCauseId}.` : "Created." }],
  };
  mockActions.push(action);
  return action;
}

// Undo for "Create Action": removes it outright rather than archiving,
// since an action that's seconds old has no evidence or history worth
// preserving yet.
export function deleteAction(id) {
  const idx = mockActions.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  mockActions.splice(idx, 1);
  return true;
}

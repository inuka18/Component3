import { mockActions, getActionById, getActionsForOwner, getActionsForRetro, setActionStatus, attachEvidence, createAction, assignAction, deleteAction } from "../data/mockActions";
import { SPRINT_LABELS } from "../data/mockCrossValidation";
import { delay } from "./simulatedLatency";

// Actions are scoped through their sprintId rather than carrying
// projectId directly (same as mockCrossValidation). SPRINT_LABELS is
// the one place that slug maps back to a project.
export async function fetchActions(projectId) {
  await delay(450);
  if (!projectId) return mockActions;
  return mockActions.filter((a) => SPRINT_LABELS[a.sourceSprintId]?.projectId === projectId);
}

export async function fetchActionsForOwner(ownerId) {
  await delay(300);
  return getActionsForOwner(ownerId);
}

// A retrospective's own action list is a filtered view of this same
// data, never a separate dataset (see mockRetrospectives.js).
export async function fetchActionsForRetro(retroId) {
  await delay(300);
  return getActionsForRetro(retroId);
}

// PM-only: creates a new action, against a reconciled cross-validation
// entry, a retro discussion, or both, with an owner already assigned,
// "create/assign" in one step.
export async function createNewAction(payload) {
  await delay(350);
  return createAction(payload);
}

// PM-only: assigns an existing Open action (most often one suggested
// during a retro) an owner and a target sprint, moving it to In Progress.
export async function assignExistingAction(id, payload) {
  await delay(300);
  return assignAction(id, payload);
}

export async function updateActionStatus(id, status, note) {
  await delay(300);
  return setActionStatus(id, status, note);
}

// Undo for "Create Action".
export async function deleteActionEntry(id) {
  await delay(250);
  return deleteAction(id);
}

// Team-member-only: submitting evidence on an action they own moves it to
// Evidence Submitted (unless a PM has already verified/rejected further).
export async function submitActionEvidence(actionId, evidenceId) {
  await delay(350);
  attachEvidence(actionId, evidenceId);
  const action = getActionById(actionId);
  if (action && action.status !== "Verified") {
    setActionStatus(actionId, "Evidence Submitted", "Evidence submitted for review.");
  }
  return action;
}

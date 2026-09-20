import { mockEvidence, getEvidenceForAction, submitEvidence, reviewEvidence } from "../data/mockEvidence";
import { mockActions, setActionStatus, getActionById } from "../data/mockActions";
import { SPRINT_LABELS } from "../data/mockCrossValidation";
import { delay } from "./simulatedLatency";

export async function fetchEvidence(actionId) {
  await delay(350);
  if (!actionId) return mockEvidence;
  return getEvidenceForAction(actionId);
}

// Evidence doesn't carry projectId directly (it's scoped through its
// parent action's sprintId, same lookup mockActions/mockCrossValidation
// already use), needed by the Overview KPIs and the Learning Loop gate
// checklist, which both need every evidence item for a project at once.
export async function fetchEvidenceForProject(projectId) {
  await delay(350);
  const actionIds = new Set(
    mockActions.filter((a) => SPRINT_LABELS[a.sourceSprintId]?.projectId === projectId).map((a) => a.id)
  );
  return mockEvidence.filter((e) => actionIds.has(e.actionId));
}

// Team-member-only: submits new evidence against an action assigned to
// them, moving both the evidence and the parent action out of a bare
// "no evidence yet" state.
export async function createEvidence({ actionId, type, description, source, sprintId }) {
  await delay(400);
  const entry = submitEvidence({ actionId, type, description, source, sprintId });
  const action = getActionById(actionId);
  if (action && action.status !== "Verified") {
    setActionStatus(actionId, "Evidence Submitted", `Evidence submitted: ${type}.`);
  }
  return entry;
}

// PM-only: verify or reject a piece of evidence, optionally recording
// what the ledger fact-check turned up while reviewing it.
export async function reviewEvidenceEntry(id, { status, ledgerOutcome, actionId }) {
  await delay(300);
  const entry = reviewEvidence(id, { status, ledgerOutcome });
  if (status === "Verified" && actionId) {
    setActionStatus(actionId, "Verified", "Evidence verified by PM.");
  }
  return entry;
}

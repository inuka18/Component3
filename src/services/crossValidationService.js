import {
  mockCrossValidation,
  getCrossValidationForProject,
  reconcileCrossValidation,
  bulkAcceptCrossValidation,
  reopenCrossValidation,
  runNlpSimulation,
} from "../data/mockCrossValidation";
import { delay } from "./simulatedLatency";

export async function fetchCrossValidation(projectId) {
  await delay(450);
  if (!projectId) return mockCrossValidation;
  return getCrossValidationForProject(projectId);
}

// PM-only: Pending -> Reconciled, with the PM's final reconciled cause
// and reviewer notes. `originalCause` is never touched.
export async function reconcileMismatch(id, { reconciledCause, reviewerNotes }) {
  await delay(300);
  return reconcileCrossValidation(id, { reconciledCause, reviewerNotes, via: "manual" });
}

// PM-only: accepts every still-Pending entry at or above `threshold` as
// Reconciled, keeping its structured code verbatim. Returns the ids
// actually affected, for an accurate toast count and an "Undo" target.
export async function bulkAccept(ids, threshold) {
  await delay(400);
  return bulkAcceptCrossValidation(ids, threshold);
}

// PM-only: the correction path. Reopens one or more Reconciled entries
// back to Pending without losing their history. Used both by a single
// entry's "Re-review" action and by "Undo Bulk Accept".
export async function reopenMismatches(ids, note) {
  await delay(300);
  return ids.map((id) => reopenCrossValidation(id, note));
}

// PM-only: "Run NLP Simulation" adds a brief, deliberately visible delay so
// the animated sequence in the UI reads as a real pass, not an instant
// no-op.
export async function simulateNlpRun(projectId, tasks, requirements) {
  await delay(1600);
  return runNlpSimulation(projectId, tasks, requirements);
}

import { mockLedger, getLedgerEntriesForRequirement } from "../data/mockLedger";
import { mockCrossValidation, getCrossValidationById } from "../data/mockCrossValidation";
import { getActionById } from "../data/mockActions";
import { delay } from "./simulatedLatency";

export async function fetchLedgerEntries(projectId) {
  await delay(500);
  if (!projectId) return mockLedger;
  return mockLedger.filter((entry) => entry.projectId === projectId);
}

export async function fetchLedgerEntriesForRequirement(requirementId) {
  await delay(250);
  return getLedgerEntriesForRequirement(requirementId);
}

// The Evidence Ledger's lookup panel takes a requirement ID, an action ID,
// or a delay-log ID, but the ledger itself (mockLedger.js) only keys off
// requirementId. Action IDs and delay-log IDs aren't ledger keys, they're
// pointers into mockCrossValidation, which is where linkedRequirementId
// actually lives (see mockCrossValidation.js's header comment). This is
// the one place that three-way resolution happens, kept synchronous and
// exported on its own so a caller that already knows it has an action ID
// (e.g. the Claim Comparison for one evidence row) can resolve without a
// fake network round trip.
export function resolveLedgerQuery(query) {
  const q = (query ?? "").trim();
  if (!q) return null;

  if (/^req-/i.test(q)) {
    return { query: q, via: "requirement", requirementId: q.toUpperCase(), cv: null, action: null };
  }

  if (/^action-/i.test(q)) {
    const action = getActionById(q);
    if (!action) return { query: q, via: "action", requirementId: null, cv: null, action: null };
    const cv = getCrossValidationById(action.reconciledCauseId);
    return { query: q, via: "action", requirementId: cv?.linkedRequirementId ?? null, cv, action };
  }

  // Delay-log ID: find the cross-validation entry that cites it as its
  // delayLogId (the same field the Cross-Validation tab reads).
  const cv = mockCrossValidation.find((entry) => entry.delayLogId === q);
  if (cv) return { query: q, via: "delay-log", requirementId: cv.linkedRequirementId, cv, action: null };

  return { query: q, via: "unknown", requirementId: null, cv: null, action: null };
}

// Async wrapper for the lookup panel's search box, same simulated-latency
// shape as every other service call in this app.
export async function fetchLedgerLookup(query) {
  await delay(350);
  const resolved = resolveLedgerQuery(query);
  const entries = resolved?.requirementId ? getLedgerEntriesForRequirement(resolved.requirementId) : [];
  return { resolved, entries };
}

// Component 4's evidence store: the proof a team member submits against
// an Action, and a PM verifies (or rejects) before that action can be
// marked Verified. Every entry below points at something that already
// exists elsewhere in the mock data (a real meeting, a real sprint) so
// "evidence" here means an actual record, not a placeholder string.

export const EVIDENCE_TYPES = ["Document", "Repository", "Sprint Metric", "Test Result", "Meeting Reference"];
export const EVIDENCE_STATUSES = ["Pending Review", "Verified", "Rejected"];

export const mockEvidence = [
  {
    id: "ev-01",
    actionId: "action-03",
    type: "Meeting Reference",
    description: "Sprint 6 planning agenda includes a standing 'Modified-requirement buffer' line item.",
    source: "mtg-nc-01: Sprint 6 Planning",
    sprintId: "nc-sprint-6",
    status: "Pending Review",
    ledgerOutcome: null,
  },
  {
    id: "ev-02",
    actionId: "action-02",
    type: "Sprint Metric",
    description: "Ripple-propagation delay logs in Sprint 3 correctly cite REQ-204 as the root cause instead of a generic 'blocked'.",
    source: "Time Log Analytics: Sprint 3",
    sprintId: "mp-sprint-3",
    status: "Verified",
    ledgerOutcome: "Confirmed",
  },
  {
    id: "ev-03",
    actionId: "action-01",
    type: "Document",
    description: "Draft schema-migration notes submitted, but don't yet cover the reason-code field's new required validation.",
    source: "Confluence: CBSL Q3 Export Migration Notes",
    sprintId: "mp-sprint-3",
    status: "Rejected",
    ledgerOutcome: "Not Supported",
  },
];

export function getEvidenceById(id) {
  return mockEvidence.find((e) => e.id === id) ?? null;
}

export function getEvidenceForAction(actionId) {
  return mockEvidence.filter((e) => e.actionId === actionId);
}

let evidenceSeq = mockEvidence.length;

export function submitEvidence({ actionId, type, description, source, sprintId }) {
  evidenceSeq += 1;
  const entry = {
    id: `ev-${Date.now()}-${evidenceSeq}`,
    actionId,
    type,
    description,
    source,
    sprintId,
    status: "Pending Review",
    ledgerOutcome: null,
  };
  mockEvidence.push(entry);
  return entry;
}

export function reviewEvidence(id, { status, ledgerOutcome }) {
  const entry = getEvidenceById(id);
  if (!entry) return null;
  entry.status = status;
  entry.ledgerOutcome = ledgerOutcome ?? entry.ledgerOutcome;
  return entry;
}

// Mock "execution reality" records for Component 2: Gap Detection. Where
// mockRequirements.js/mockSignals.js capture what was formally approved,
// this file captures what actually happened during execution (task
// updates, time-log notes, standups, sprint reports, commits). Gap
// Detection's semantic comparison (see ComparisonPanel.jsx) is a
// side-by-side of a requirement's approved text against entries like
// these. Every record links back to a requirement and, where relevant, a
// task from mockSchedule.js.

export const EVIDENCE_SOURCES = [
  "Task Update",
  "Time Log Note",
  "Standup",
  "Sprint Report",
  "Code Commit",
];

export const mockExecutionEvidence = [
  // ---- NovaCart ----
  {
    id: "ev-nc-01",
    projectId: "proj-novacart",
    source: "Sprint Report",
    date: "2026-08-25T08:00:00+05:30",
    author: "Sprint Bot",
    text: "REQ-107 (Guest checkout) has zero linked tasks across the last two sprint boards. No branch, commit, or board activity found.",
    linkedRequirementId: "REQ-107",
    linkedTaskId: null,
  },
  {
    id: "ev-nc-02",
    projectId: "proj-novacart",
    source: "Standup",
    date: "2026-08-24T09:15:00+05:30",
    author: "Sanduni Rajapaksha",
    text: "Guest checkout designs are still just Figma frames. Nobody's picked up a build ticket for it yet.",
    linkedRequirementId: "REQ-107",
    linkedTaskId: null,
  },
  {
    id: "ev-nc-03",
    projectId: "proj-novacart",
    source: "Sprint Report",
    date: "2026-08-24T08:00:00+05:30",
    author: "Sprint Bot",
    text: "REQ-116 (Recommended for you rail) has no associated task in the current or prior sprint board.",
    linkedRequirementId: "REQ-116",
    linkedTaskId: null,
  },
  {
    id: "ev-nc-04",
    projectId: "proj-novacart",
    source: "Task Update",
    date: "2026-08-22T15:30:00+05:30",
    author: "Kavindu Silva",
    text: "Built out three screens for the checkout flow: address, order review, then payment. Review step turned into its own full screen, not just a summary card as originally worded.",
    linkedRequirementId: "REQ-108",
    linkedTaskId: "task-nc-08",
  },
  {
    id: "ev-nc-05",
    projectId: "proj-novacart",
    source: "Code Commit",
    date: "2026-08-23T10:05:00+05:30",
    author: "Kavindu Silva",
    text: "feat(checkout): add dedicated order-review route between cart and payment steps",
    linkedRequirementId: "REQ-108",
    linkedTaskId: "task-nc-08",
  },
  {
    id: "ev-nc-06",
    projectId: "proj-novacart",
    source: "Task Update",
    date: "2026-08-21T13:40:00+05:30",
    author: "Amaya Wijesinghe",
    text: "Implemented the LKR 25,000 threshold check. Anything above it now hard-blocks the instant refund and routes straight to the manual review queue, no partial auto-approval path.",
    linkedRequirementId: "REQ-105",
    linkedTaskId: "task-nc-07",
  },
  {
    id: "ev-nc-07",
    projectId: "proj-novacart",
    source: "Sprint Report",
    date: "2026-08-25T08:00:00+05:30",
    author: "Sprint Bot",
    text: "Amaya Wijesinghe logged at 110% of sprint capacity across 2 active tasks in the payments cluster.",
    linkedRequirementId: "REQ-106",
    linkedTaskId: "task-nc-02",
  },
  {
    id: "ev-nc-08",
    projectId: "proj-novacart",
    source: "Sprint Report",
    date: "2026-08-24T08:00:00+05:30",
    author: "Sprint Bot",
    text: "Kavindu Silva logged at 95% of sprint capacity across 2 active tasks spanning checkout and notifications.",
    linkedRequirementId: "REQ-108",
    linkedTaskId: "task-nc-08",
  },
  {
    id: "ev-nc-09",
    projectId: "proj-novacart",
    source: "Sprint Report",
    date: "2026-08-20T08:00:00+05:30",
    author: "Sprint Bot",
    text: "REQ-121 (Order status SMS + push) has carried zero linked tasks for 2 consecutive sprints.",
    linkedRequirementId: "REQ-121",
    linkedTaskId: null,
  },
  {
    id: "ev-nc-10",
    projectId: "proj-novacart",
    source: "Task Update",
    date: "2026-08-20T16:50:00+05:30",
    author: "Amaya Wijesinghe",
    text: "Re-ran the ranking eval suite against the relaxed budget. Acceptance checklist on the ticket still says '<200ms p95' in two places, need to update to 400ms.",
    linkedRequirementId: "REQ-115",
    linkedTaskId: "task-nc-11",
  },
  // ev-nc-11/12 deliberately back a requirement with no detected gap, the
  // "Strong Match" example on the Workspace page's comparison showcase.
  {
    id: "ev-nc-11",
    projectId: "proj-novacart",
    source: "Sprint Report",
    date: "2026-08-10T08:00:00+05:30",
    author: "Sprint Bot",
    text: "task-nc-15 (PCI vault tokenization rollout) closed as Done. Every card-storage path now routes through the PCI-compliant vault provider, matching REQ-112's requirement text exactly.",
    linkedRequirementId: "REQ-112",
    linkedTaskId: "task-nc-15",
  },
  {
    id: "ev-nc-12",
    projectId: "proj-novacart",
    source: "Code Commit",
    date: "2026-08-10T09:20:00+05:30",
    author: "Ruwan Jayasuriya",
    text: "feat(payments): remove last raw-PAN write path. All stored card data now tokenized through the vault provider, no PAN touches app servers or logs.",
    linkedRequirementId: "REQ-112",
    linkedTaskId: "task-nc-15",
  },

  // ---- Meridian Pay ----
  {
    id: "ev-mp-01",
    projectId: "proj-meridianpay",
    source: "Standup",
    date: "2026-08-25T09:00:00+05:30",
    author: "Malith Perera",
    text: "Step-up challenge UI design is still blocked, waiting on the mobile team's device-binding SDK before we can spec the biometric re-confirmation screen.",
    linkedRequirementId: "REQ-206",
    linkedTaskId: "task-mp-02",
  },
  {
    id: "ev-mp-02",
    projectId: "proj-meridianpay",
    source: "Sprint Report",
    date: "2026-08-25T08:00:00+05:30",
    author: "Sprint Bot",
    text: "task-mp-02 has remained in Backlog for 9 days while REQ-206 has carried an 'At Risk' status for 3 of those.",
    linkedRequirementId: "REQ-206",
    linkedTaskId: "task-mp-02",
  },
  {
    id: "ev-mp-03",
    projectId: "proj-meridianpay",
    source: "Sprint Report",
    date: "2026-08-23T08:00:00+05:30",
    author: "Sprint Bot",
    text: "task-mp-03 (CBSL Q3 schema mapping spike) has remained in Backlog since REQ-208 was modified to the updated schema 17 days ago.",
    linkedRequirementId: "REQ-208",
    linkedTaskId: "task-mp-03",
  },
  {
    id: "ev-mp-04",
    projectId: "proj-meridianpay",
    source: "Task Update",
    date: "2026-08-23T14:10:00+05:30",
    author: "Chathurika Abeywardena",
    text: "Agents kept skipping the reason-code field in testing, so we made it a hard blocker on submit. You literally cannot submit the form without it now. That's beyond 'logged' from the original ticket wording.",
    linkedRequirementId: "REQ-212",
    linkedTaskId: "task-mp-06",
  },
  {
    id: "ev-mp-05",
    projectId: "proj-meridianpay",
    source: "Standup",
    date: "2026-08-22T09:10:00+05:30",
    author: "Chamika Rathnayake",
    text: "Secure enclave storage is flaky on a chunk of older Android devices, so we're going to need a fallback key-storage path that isn't mentioned anywhere in the device-binding requirement.",
    linkedRequirementId: "REQ-202",
    linkedTaskId: "task-mp-01",
  },
  {
    id: "ev-mp-06",
    projectId: "proj-meridianpay",
    source: "Sprint Report",
    date: "2026-08-25T08:00:00+05:30",
    author: "Sprint Bot",
    text: "Chamika Rathnayake logged at 90% of sprint capacity across 2 active tasks in the fraud/security cluster.",
    linkedRequirementId: "REQ-205",
    linkedTaskId: "task-mp-05",
  },
  {
    id: "ev-mp-07",
    projectId: "proj-meridianpay",
    source: "Time Log Note",
    date: "2026-08-19T09:00:00+05:30",
    author: "Nuwan Karunaratne",
    text: "Aggregation query is basically done, just waiting for a second reviewer. Could pick up more this sprint if needed.",
    linkedRequirementId: "REQ-211",
    linkedTaskId: "task-mp-08",
  },
  // ev-mp-08/09 deliberately back a requirement with no detected gap, the
  // "Strong Match" example on the Workspace page's comparison showcase.
  {
    id: "ev-mp-08",
    projectId: "proj-meridianpay",
    source: "Sprint Report",
    date: "2026-07-30T08:00:00+05:30",
    author: "Sprint Bot",
    text: "task-mp-10 (P2P transfer instant settlement) closed as Done. Instant settlement between Meridian accounts verified end-to-end, matching REQ-203's requirement text exactly.",
    linkedRequirementId: "REQ-203",
    linkedTaskId: "task-mp-10",
  },
  {
    id: "ev-mp-09",
    projectId: "proj-meridianpay",
    source: "Code Commit",
    date: "2026-07-30T10:15:00+05:30",
    author: "Yasodha Wijeratne",
    text: "feat(transfers): finalize instant-settlement path for P2P transfers between Meridian Pay accounts",
    linkedRequirementId: "REQ-203",
    linkedTaskId: "task-mp-10",
  },
];

export function getExecutionEvidenceForProject(projectId) {
  return mockExecutionEvidence.filter((e) => e.projectId === projectId);
}

export function getExecutionEvidenceByIds(ids) {
  return mockExecutionEvidence.filter((e) => ids?.includes(e.id));
}

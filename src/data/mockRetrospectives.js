// Past sprint retrospectives, the base record Retrospective Intelligence
// (src/features/retro-intelligence/) builds its cross-validation layer on
// top of. It compares the `delayReason` values logged on tasks
// (mockTimeLogs.js) against what NLP extraction would surface from this
// same sprint's retrospective transcript (mockCrossValidation.js), then
// checks that against the Traceability Ledger. This file's own
// `discussionNotes` are left exactly as they were, read-only from Retro
// Intelligence's side.
//
// Action items suggested during a retro's discussion are NOT stored here.
// They live in mockActions.js like every other action, linked back to
// their retro via `retroId`. Use getActionsForRetro(retro.id) to read
// them; there is no second, retro-local action-item model anymore.

export const mockRetrospectives = [
  // ---- NovaCart ----
  {
    id: "retro-nc-03",
    status: "completed",
    projectId: "proj-novacart",
    sprintName: "Sprint 3: Checkout Foundations",
    sprintNumber: 3,
    date: "2026-07-19T15:00:00+05:30",
    highlights: [
      "Guest checkout and one-page checkout both shipped ahead of schedule.",
      "The inventory hold logic caught two oversell incidents during load testing before launch.",
      "OAuth2 login rollout took longer than estimated due to Apple ID review delays.",
    ],
    discussionNotes:
      "A strong sprint for the checkout foundation. Guest checkout and one-page checkout both landed early, and the inventory hold logic proved itself under load testing by catching two oversell scenarios before they reached production. The one drag on the sprint was the OAuth2 rollout: the team underestimated how long Apple's app review cycle would take for the Sign in with Apple entitlement, which pushed REQ-101 close to the sprint boundary.",
  },
  {
    id: "retro-nc-04",
    status: "completed",
    projectId: "proj-novacart",
    sprintName: "Sprint 4: Payments & Wallet Kickoff",
    sprintNumber: 4,
    date: "2026-08-02T15:00:00+05:30",
    highlights: [
      "Wallet top-up via bank transfer reached feature-complete.",
      "The PCI tokenization audit passed with zero findings.",
      "Multi-currency display slipped after the FX rate vendor's SLA fell through mid-sprint.",
      "Team flagged that fraud scoring needs an earlier design pass next time.",
    ],
    discussionNotes:
      "Wallet top-up hit feature-complete and the PCI audit came back clean, which the team was glad to close out before the fraud-scoring work ramps up. The multi-currency wallet display didn't make it. The FX rate feed vendor never confirmed an SLA, and by the time that became clear there wasn't a fallback plan. The team also flagged, ahead of actually building it, that the fraud review queue needs its design work pulled forward rather than started once scoring is already live.",
  },
  {
    id: "retro-nc-05",
    status: "completed",
    projectId: "proj-novacart",
    // Links to the real meeting record for this same sprint boundary
    // (src/data/mockMeetings.js). Retro Intelligence reads its transcript
    // (generating one via the same mechanism as any other meeting, if
    // it hasn't been generated yet) rather than building a second
    // transcript source just for retrospectives.
    meetingId: "mtg-nc-04",
    sprintName: "Sprint 5: Fraud & Search Hardening",
    sprintNumber: 5,
    date: "2026-08-16T14:00:00+05:30",
    highlights: [
      "Fraud velocity scoring shipped to shadow mode, precision tracking well ahead of recall validation.",
      "Search relevance target was relaxed from 200ms to 400ms after ranking-quality testing.",
      "Checkout review-step redesign absorbed more design cycles than planned.",
      "RBAC permission schema churned twice as new admin actions were added mid-sprint.",
    ],
    discussionNotes:
      "Team reviewed velocity (38 of 45 committed points completed). The checkout review-step change from REQ-108 absorbed more design cycles than expected once user testing pushed back on a single-page flow. The fraud review queue UI is now the critical path blocking REQ-110/REQ-111 go-live. General sentiment: the sprint felt reactive because two requirements changed mid-sprint after planning had already locked in estimates.",
  },

  // ---- Meridian Pay ----
  {
    id: "retro-mp-01",
    status: "completed",
    projectId: "proj-meridianpay",
    sprintName: "Sprint 1: Foundations & Onboarding Kickoff",
    sprintNumber: 1,
    date: "2026-07-19T16:00:00+05:30",
    highlights: [
      "P2P transfer and KYC onboarding both reached design sign-off ahead of schedule.",
      "The anomaly-scoring compliance requirement was locked in early, avoiding late rework.",
      "The OTP login estimate ran short once SMS gateway vendor evaluation was factored in.",
    ],
    discussionNotes:
      "A confident opening sprint. Both P2P transfer and KYC onboarding reached design sign-off with room to spare, and getting the anomaly-scoring compliance requirement locked in early meant the fraud work downstream wouldn't need to be re-scoped. The one miss was OTP login: the original estimate didn't account for the time needed to evaluate SMS gateway vendors, which the team folded into the next sprint's planning instead.",
  },
  {
    id: "retro-mp-02",
    status: "completed",
    projectId: "proj-meridianpay",
    meetingId: "mtg-mp-04",
    sprintName: "Sprint 2: Onboarding Ship & Device Binding",
    sprintNumber: 2,
    date: "2026-08-14T15:00:00+05:30",
    highlights: [
      "OTP login and KYC liveness check both shipped this sprint.",
      "Device-binding uncovered an Android secure-enclave compatibility gap late in the sprint.",
      "Standing orders scope was trimmed after a fraud-review capacity concern from the risk team.",
    ],
    discussionNotes:
      "Team reviewed onboarding flow completion. Both KYC and OTP login shipped this sprint. Device-binding surfaced an unexpected Android compatibility gap late in the sprint, which wasn't caught earlier because the device test matrix doesn't include older Android security-patch levels. Standing-orders scope was trimmed mid-sprint after a fraud-review capacity concern from the risk team, which the team agreed should have been raised during planning instead.",
  },
];

export function getRetrospectivesForProject(projectId) {
  return mockRetrospectives
    .filter((r) => r.projectId === projectId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getRetroById(id) {
  return mockRetrospectives.find((r) => r.id === id) ?? null;
}

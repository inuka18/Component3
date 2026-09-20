// Meeting scheduler data. `attendeeIds` reference rows in mockTeam.js for
// the same project. Past meetings may carry `notes` + `actionItems`; this
// is exactly the kind of record Component 4 (Retrospective Intelligence)
// will eventually cross-validate against logged delay reasons.

export const MEETING_TYPES = ["Standup", "Planning", "Review", "Retrospective", "Sync"];

export const mockMeetings = [
  // ---- NovaCart ----
  {
    id: "mtg-nc-01",
    projectId: "proj-novacart",
    title: "Sprint 6 Planning",
    type: "Planning",
    dateTime: "2026-08-28T10:00:00+05:30",
    durationMins: 60,
    attendeeIds: ["tm-01", "tm-02", "tm-03", "tm-04", "tm-05", "tm-06", "tm-07", "tm-09"],
    status: "upcoming",
  },
  {
    id: "mtg-nc-02",
    projectId: "proj-novacart",
    title: "Fraud Review Queue Design Walkthrough",
    type: "Sync",
    dateTime: "2026-08-27T15:30:00+05:30",
    durationMins: 30,
    attendeeIds: ["tm-01", "tm-07", "tm-10"],
    status: "upcoming",
  },
  {
    id: "mtg-nc-03",
    projectId: "proj-novacart",
    title: "Wallet Compliance Check-in",
    type: "Sync",
    dateTime: "2026-08-31T11:00:00+05:30",
    durationMins: 45,
    attendeeIds: ["tm-01", "tm-03", "tm-05", "tm-09"],
    status: "upcoming",
  },
  {
    id: "mtg-nc-04",
    projectId: "proj-novacart",
    title: "Sprint 5 Retrospective",
    type: "Retrospective",
    dateTime: "2026-08-16T14:00:00+05:30",
    durationMins: 60,
    attendeeIds: ["tm-01", "tm-02", "tm-03", "tm-04", "tm-05", "tm-06", "tm-07", "tm-08", "tm-09", "tm-10"],
    status: "past",
    notes:
      "Team reviewed velocity (38/45 points completed). The checkout review-step change from REQ-108 absorbed more design cycles than expected. The fraud review queue UI is now the critical path blocking REQ-110/REQ-111 go-live. General sentiment: the sprint felt reactive because two requirements changed mid-sprint after planning.",
    actionItems: [
      {
        id: "ai-nc-04-1",
        text: "Add a design buffer to sprint planning whenever a requirement is flagged Modified mid-sprint",
        owner: "Tharindu Bandara",
        status: "Open",
      },
      {
        id: "ai-nc-04-2",
        text: "Fast-track the fraud review queue design handoff to unblock REQ-111",
        owner: "Sanduni Rajapaksha",
        status: "Done",
      },
      {
        id: "ai-nc-04-3",
        text: "Re-estimate the KYC vendor spike before committing it to next sprint",
        owner: "Dinithi Perera",
        status: "Open",
      },
      {
        id: "ai-nc-04-4",
        text: "Split the checkout review-step work into a smaller first PR to unblock QA sooner",
        owner: "Kavindu Silva",
        status: "Open",
      },
    ],
    transcript: null,
  },

  // ---- Meridian Pay ----
  {
    id: "mtg-mp-01",
    projectId: "proj-meridianpay",
    title: "Sprint 3 Planning",
    type: "Planning",
    dateTime: "2026-08-28T14:00:00+05:30",
    durationMins: 60,
    attendeeIds: ["tm-11", "tm-12", "tm-13", "tm-14", "tm-17", "tm-18"],
    status: "upcoming",
  },
  {
    id: "mtg-mp-02",
    projectId: "proj-meridianpay",
    title: "Compliance Sync: CBSL Schema",
    type: "Sync",
    dateTime: "2026-08-27T16:00:00+05:30",
    durationMins: 30,
    attendeeIds: ["tm-11", "tm-17", "tm-18"],
    status: "upcoming",
  },
  {
    id: "mtg-mp-03",
    projectId: "proj-meridianpay",
    title: "Mobile Device-Binding Design Review",
    type: "Sync",
    dateTime: "2026-08-29T10:00:00+05:30",
    durationMins: 45,
    attendeeIds: ["tm-11", "tm-12", "tm-15"],
    status: "upcoming",
  },
  {
    id: "mtg-mp-04",
    projectId: "proj-meridianpay",
    title: "Sprint 2 Retrospective",
    type: "Retrospective",
    dateTime: "2026-08-14T15:00:00+05:30",
    durationMins: 60,
    attendeeIds: ["tm-11", "tm-12", "tm-13", "tm-14", "tm-15", "tm-16", "tm-17", "tm-18"],
    status: "past",
    notes:
      "Team reviewed onboarding flow completion. Both KYC and OTP login shipped this sprint. Device-binding surfaced an unexpected Android compatibility gap late in the sprint. Standing-orders scope was trimmed mid-sprint after a fraud-review capacity concern from the risk team.",
    actionItems: [
      {
        id: "ai-mp-04-1",
        text: "Add an Android device-matrix smoke test to CI before merging auth changes",
        owner: "Chamika Rathnayake",
        status: "Open",
      },
      {
        id: "ai-mp-04-2",
        text: "Confirm the standing-order cap decision with the fraud team before next planning",
        owner: "Tharindu Bandara",
        status: "Done",
      },
      {
        id: "ai-mp-04-3",
        text: "Document the CBSL schema change process so it isn't a surprise next quarter",
        owner: "Nuwan Karunaratne",
        status: "Open",
      },
    ],
    transcript:
      "[00:01] Tharindu Bandara: Let's start with onboarding: KYC and OTP login, where are we?\n" +
      "[00:02] Chamika Rathnayake: Both shipped this sprint. KYC liveness check passed accessibility testing, OTP is load-tested at 3x peak.\n" +
      "[00:04] Chathurika Abeywardena: Good news there, but device-binding hit a snag: secure enclave storage is inconsistent on older Android security patch levels. We didn't catch it because our test matrix skips those.\n" +
      "[00:07] Tharindu Bandara: Noted, let's get a device-matrix smoke test into CI so this doesn't repeat.\n" +
      "[00:09] Yasodha Wijeratne: On standing orders: fraud flagged concerns about unlimited recurring transfers mid-sprint, so we capped it at 5 per account for v1.\n" +
      "[00:11] Tharindu Bandara: That should've come up in planning, not mid-sprint. Let's tighten that loop with fraud going forward.\n" +
      "[00:13] Nuwan Karunaratne: Also flagging: the CBSL reporting template changed since we scoped the export. Switching to the updated Q3 schema now.\n" +
      "[00:15] Tharindu Bandara: Good catch. Let's document that change process so it's not a surprise again next quarter. Good sprint overall, team.",
  },
];

export function getMeetingsForProject(projectId) {
  return mockMeetings.filter((m) => m.projectId === projectId);
}

export function getMeetingById(id) {
  return mockMeetings.find((m) => m.id === id) ?? null;
}

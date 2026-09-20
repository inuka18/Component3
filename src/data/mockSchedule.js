// Kanban board data for the Schedule section. This is the seed for what
// Component 3 (Adaptive Schedule Re-Optimization) will eventually read and
// re-optimize, and the `delayReason` captured on a time log is exactly the
// signal Component 4 (Retrospective Intelligence) will later cross-check
// against what gets said in a retrospective.
//
// KANBAN_COLUMNS is the seed/default lane set. The board itself keeps its
// live column list in SchedulePage's state so a PM can add lanes during
// the session, JIRA-board style.

export const KANBAN_COLUMNS = [
  { id: "backlog", label: "Backlog" },
  { id: "in-progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];

export const DELAY_REASONS = [
  "Requirement unclear",
  "Dependency blocked",
  "Resource unavailable",
  "Client feedback late",
  "Technical complexity underestimated",
  "Other",
];

export const PRIORITIES = ["Low", "Medium", "High"];

export const mockTasks = [
  // ---- NovaCart : Backlog ----
  {
    id: "task-nc-01",
    projectId: "proj-novacart",
    title: "Implement Apple ID OAuth provider",
    description:
      "Add Sign in with Apple as an OAuth2 provider alongside Google, including the entitlement and App Review requirements Apple imposes on top of standard OAuth2.",
    column: "backlog",
    assigneeId: "tm-05",
    priority: "High",
    storyPoints: 5,
    requirementId: "REQ-101",
    timeLogs: [],
  },
  {
    id: "task-nc-02",
    projectId: "proj-novacart",
    title: "Build FX rate feed integration for wallet display",
    description:
      "Integrate a live FX rate feed so wallet balances can render in the customer's selected display currency alongside the settlement currency.",
    column: "backlog",
    assigneeId: "tm-09",
    priority: "Medium",
    storyPoints: 8,
    requirementId: "REQ-106",
    timeLogs: [],
  },
  {
    id: "task-nc-03",
    projectId: "proj-novacart",
    title: "Design admin fraud review queue UI",
    description:
      "Design the internal queue risk analysts will use to approve, hold, or reject orders flagged by the fraud scoring engine.",
    column: "backlog",
    assigneeId: "tm-07",
    priority: "High",
    storyPoints: 5,
    requirementId: "REQ-111",
    timeLogs: [],
  },
  {
    id: "task-nc-04",
    projectId: "proj-novacart",
    title: "Spike: KYC vendor alternatives",
    description:
      "Evaluate alternative KYC verification vendors now that the original integration timeline has slipped past the wallet v1 launch window.",
    column: "backlog",
    assigneeId: "tm-05",
    priority: "Low",
    storyPoints: 3,
    requirementId: "REQ-113",
    timeLogs: [],
  },
  {
    id: "task-nc-05",
    projectId: "proj-novacart",
    title: "Draft loyalty tier badge motion spec",
    description:
      "Specify the animation for the loyalty tier progress ring shown on the customer profile and at checkout.",
    column: "backlog",
    assigneeId: "tm-07",
    priority: "Low",
    storyPoints: 2,
    requirementId: "REQ-118",
    timeLogs: [],
  },

  // ---- NovaCart : In Progress ----
  {
    id: "task-nc-06",
    projectId: "proj-novacart",
    title: "Session timeout parity: mobile SDK",
    description:
      "Align the mobile app's idle-session timeout behavior with the web app's 15-minute timeout and 60-second warning modal.",
    column: "in-progress",
    assigneeId: "tm-04",
    priority: "High",
    storyPoints: 8,
    requirementId: "REQ-103",
    timeLogs: [
      {
        id: "log-nc-06-1",
        hours: 4,
        date: "2026-08-18",
        note: "Investigated shared session SDK blocker with mobile platform team.",
        delayReason: "Dependency blocked",
      },
    ],
  },
  {
    id: "task-nc-07",
    projectId: "proj-novacart",
    title: "Wallet refund cap logic (LKR 25,000 threshold)",
    description:
      "Implement the LKR 25,000 cap on instant wallet refunds, routing anything above it to manual risk review instead.",
    column: "in-progress",
    assigneeId: "tm-09",
    priority: "High",
    storyPoints: 5,
    requirementId: "REQ-105",
    timeLogs: [
      { id: "log-nc-07-1", hours: 5, date: "2026-08-19", note: "Implemented threshold check + manual review routing." },
    ],
  },
  {
    id: "task-nc-08",
    projectId: "proj-novacart",
    title: "Checkout review-step UI (two-step flow)",
    description:
      "Build the order-review step between cart and payment that UX testing showed customers want before placing an order.",
    column: "in-progress",
    assigneeId: "tm-04",
    priority: "Medium",
    storyPoints: 5,
    requirementId: "REQ-108",
    timeLogs: [],
  },
  {
    id: "task-nc-09",
    projectId: "proj-novacart",
    title: "RBAC permission schema v2",
    description:
      "Rework the admin console's role-based permission schema to accommodate newly added admin actions without another rewrite.",
    column: "in-progress",
    assigneeId: "tm-10",
    priority: "High",
    storyPoints: 8,
    requirementId: "REQ-124",
    timeLogs: [
      {
        id: "log-nc-09-1",
        hours: 3,
        date: "2026-08-24",
        note: "Reworked schema again after new admin action was added mid-sprint.",
        delayReason: "Requirement unclear",
      },
    ],
  },
  {
    id: "task-nc-10",
    projectId: "proj-novacart",
    title: "Carrier delay webhook listener",
    description:
      "Listen for carrier delay events so the fulfillment engine can re-evaluate its SLA-based carrier selection mid-shipment.",
    column: "in-progress",
    assigneeId: "tm-05",
    priority: "Medium",
    storyPoints: 5,
    requirementId: "REQ-119",
    timeLogs: [],
  },

  // ---- NovaCart : Review ----
  {
    id: "task-nc-11",
    projectId: "proj-novacart",
    title: "Search relevance tuning (400ms target)",
    description:
      "Tune catalog search ranking to hit the relaxed 400ms latency budget without regressing relevance quality.",
    column: "review",
    assigneeId: "tm-09",
    priority: "Medium",
    storyPoints: 5,
    requirementId: "REQ-115",
    timeLogs: [{ id: "log-nc-11-1", hours: 6, date: "2026-08-20", note: "Relaxed latency budget, re-ran ranking eval suite." }],
  },
  {
    id: "task-nc-12",
    projectId: "proj-novacart",
    title: "Notification preference center: promo-only toggle",
    description:
      "Rebuild the notification preference center so only promotional notifications remain toggleable, per support's feedback on missed order alerts.",
    column: "review",
    assigneeId: "tm-04",
    priority: "Medium",
    storyPoints: 3,
    requirementId: "REQ-122",
    timeLogs: [],
  },
  {
    id: "task-nc-13",
    projectId: "proj-novacart",
    title: "Settlement reconciliation dashboard v1",
    description:
      "Build the daily dashboard that reconciles payment gateway settlements against internal order and refund records.",
    column: "review",
    assigneeId: "tm-02",
    priority: "High",
    storyPoints: 8,
    requirementId: "REQ-123",
    timeLogs: [],
  },

  // ---- NovaCart : Done ----
  {
    id: "task-nc-14",
    projectId: "proj-novacart",
    title: "Google OAuth provider integration",
    description:
      "Add Google as an OAuth2 login provider alongside email/password to reduce signup friction at checkout.",
    column: "done",
    assigneeId: "tm-05",
    priority: "High",
    storyPoints: 5,
    requirementId: "REQ-101",
    timeLogs: [{ id: "log-nc-14-1", hours: 6, date: "2026-08-09", note: "Implemented and tested end-to-end OAuth flow." }],
  },
  {
    id: "task-nc-15",
    projectId: "proj-novacart",
    title: "PCI vault tokenization rollout",
    description:
      "Migrate all stored card data to the PCI-compliant vault provider so raw PAN never touches application servers or logs.",
    column: "done",
    assigneeId: "tm-03",
    priority: "High",
    storyPoints: 8,
    requirementId: "REQ-112",
    timeLogs: [{ id: "log-nc-15-1", hours: 10, date: "2026-08-10", note: "Migrated all card-storage paths to the vault provider." }],
  },
  {
    id: "task-nc-16",
    projectId: "proj-novacart",
    title: "Faceted filter backend endpoints",
    description:
      "Build the backend endpoints powering price, brand, rating, and availability filters on the catalog search page.",
    column: "done",
    assigneeId: "tm-06",
    priority: "Medium",
    storyPoints: 5,
    requirementId: "REQ-114",
    timeLogs: [],
  },
  {
    id: "task-nc-17",
    projectId: "proj-novacart",
    title: "Delivery tracking map component",
    description:
      "Build the live delivery tracking map showing the courier's estimated location and ETA on the order tracking page.",
    column: "done",
    assigneeId: "tm-04",
    priority: "Medium",
    storyPoints: 5,
    requirementId: "REQ-120",
    timeLogs: [],
  },
  {
    id: "task-nc-18",
    projectId: "proj-novacart",
    title: "Fraud velocity scoring model v2 (shadow mode)",
    description:
      "Ship the velocity-based fraud scoring model to shadow mode to validate recall before it goes live for real checkout decisions.",
    column: "done",
    assigneeId: "tm-03",
    priority: "High",
    storyPoints: 8,
    requirementId: "REQ-110",
    timeLogs: [{ id: "log-nc-18-1", hours: 12, date: "2026-08-09", note: "Shipped shadow-mode scoring, validating recall before go-live." }],
  },

  // ---- Meridian Pay : Backlog ----
  {
    id: "task-mp-01",
    projectId: "proj-meridianpay",
    title: "Fallback path for enclave key storage",
    description:
      "Add a fallback key-storage path for Android devices whose secure enclave doesn't support the primary device-binding approach.",
    column: "backlog",
    assigneeId: "tm-12",
    priority: "High",
    storyPoints: 5,
    requirementId: "REQ-202",
    timeLogs: [],
  },
  {
    id: "task-mp-02",
    projectId: "proj-meridianpay",
    title: "Design step-up challenge UI",
    description:
      "Design the step-up authentication challenge shown before high-risk actions like large transfers or new payee setup.",
    column: "backlog",
    assigneeId: "tm-14",
    priority: "Medium",
    storyPoints: 5,
    requirementId: "REQ-206",
    timeLogs: [],
  },
  {
    id: "task-mp-03",
    projectId: "proj-meridianpay",
    title: "CBSL Q3 schema mapping spike",
    description:
      "Map the updated CBSL Q3 regulatory reporting schema against the current settlement export format.",
    column: "backlog",
    assigneeId: "tm-18",
    priority: "Medium",
    storyPoints: 3,
    requirementId: "REQ-208",
    timeLogs: [],
  },

  // ---- Meridian Pay : In Progress ----
  {
    id: "task-mp-04",
    projectId: "proj-meridianpay",
    title: "Standing order cap enforcement (5/account)",
    description:
      "Enforce the 5-standing-order-per-account cap the risk team requested after flagging unlimited recurring transfers as a fraud exposure.",
    column: "in-progress",
    assigneeId: "tm-13",
    priority: "High",
    storyPoints: 5,
    requirementId: "REQ-204",
    timeLogs: [
      {
        id: "log-mp-04-1",
        hours: 3,
        date: "2026-08-19",
        note: "Waiting on fraud review queue changes before wiring the cap check in.",
        delayReason: "Dependency blocked",
      },
    ],
  },
  {
    id: "task-mp-05",
    projectId: "proj-meridianpay",
    title: "Anomaly scoring: real-time inference pipeline",
    description:
      "Build the real-time inference pipeline that scores transactions against the anomaly-detection model as they happen.",
    column: "in-progress",
    assigneeId: "tm-12",
    priority: "High",
    storyPoints: 8,
    requirementId: "REQ-205",
    timeLogs: [],
  },
  {
    id: "task-mp-06",
    projectId: "proj-meridianpay",
    title: "Reason-code required field on admin console",
    description:
      "Make the reason-code field mandatory on the admin console so agents can no longer submit an action without documenting why.",
    column: "in-progress",
    assigneeId: "tm-17",
    priority: "High",
    storyPoints: 5,
    requirementId: "REQ-212",
    timeLogs: [
      {
        id: "log-mp-06-1",
        hours: 2,
        date: "2026-08-23",
        note: "Agents keep skipping the reason field, reworking as a hard blocker on submit.",
        delayReason: "Technical complexity underestimated",
      },
    ],
  },

  // ---- Meridian Pay : Review ----
  {
    id: "task-mp-07",
    projectId: "proj-meridianpay",
    title: "Balance push notification service",
    description:
      "Build the push notification service that alerts customers to balance changes and low-balance thresholds.",
    column: "review",
    assigneeId: "tm-14",
    priority: "Medium",
    storyPoints: 5,
    requirementId: "REQ-209",
    timeLogs: [],
  },
  {
    id: "task-mp-08",
    projectId: "proj-meridianpay",
    title: "Spend-category aggregation query",
    description:
      "Build the aggregation query powering the spend-category dashboard's 30/60/90 day rolling windows.",
    column: "review",
    assigneeId: "tm-18",
    priority: "Medium",
    storyPoints: 5,
    requirementId: "REQ-211",
    timeLogs: [],
  },

  // ---- Meridian Pay : Done ----
  {
    id: "task-mp-09",
    projectId: "proj-meridianpay",
    title: "OTP login flow (SMS gateway integration)",
    description:
      "Integrate the SMS gateway for OTP-based login, load-tested at 3x expected peak volume.",
    column: "done",
    assigneeId: "tm-12",
    priority: "High",
    storyPoints: 5,
    requirementId: "REQ-201",
    timeLogs: [{ id: "log-mp-09-1", hours: 7, date: "2026-07-28", note: "Load tested SMS gateway at 3x expected peak volume." }],
  },
  {
    id: "task-mp-10",
    projectId: "proj-meridianpay",
    title: "P2P transfer instant settlement",
    description:
      "Implement instant settlement for peer-to-peer transfers between Meridian Pay accounts.",
    column: "done",
    assigneeId: "tm-13",
    priority: "High",
    storyPoints: 8,
    requirementId: "REQ-203",
    timeLogs: [],
  },
  {
    id: "task-mp-11",
    projectId: "proj-meridianpay",
    title: "KYC liveness check integration",
    description:
      "Integrate the liveness-check SDK into the KYC onboarding flow, including accessibility testing.",
    column: "done",
    assigneeId: "tm-12",
    priority: "High",
    storyPoints: 8,
    requirementId: "REQ-207",
    timeLogs: [{ id: "log-mp-11-1", hours: 9, date: "2026-08-01", note: "Integrated liveness SDK, passed accessibility testing." }],
  },
  {
    id: "task-mp-12",
    projectId: "proj-meridianpay",
    title: "Device-binding QA pass",
    description:
      "Run the full QA pass on device-binding across the supported Android and iOS device matrix.",
    column: "done",
    assigneeId: "tm-15",
    priority: "Medium",
    storyPoints: 3,
    requirementId: "REQ-202",
    timeLogs: [],
  },
];

export function getTasksForProject(projectId) {
  return mockTasks.filter((tk) => tk.projectId === projectId);
}

// Mock requirements data spanning both demo projects: "NovaCart" (an
// e-commerce + fintech-wallet case study) and "Meridian Pay" (a digital
// banking case study). This is the single source of truth for requirement
// records. Status history entries here are also used to generate the
// traceability ledger (see mockLedger.js), so the two stay perfectly
// cross-consistent. Every requirement carries a `projectId` so the data
// layer can scope it to whichever project is active (see
// services/requirementsService.js).

export const STATUSES = ["Confirmed", "At Risk", "Modified", "Dropped"];

export const CLUSTERS = [
  { id: "auth", label: "Authentication & Identity", color: "#6366f1" },
  { id: "payments", label: "Payments & Wallet", color: "#0ea5e9" },
  { id: "checkout", label: "Checkout & Cart", color: "#8b5cf6" },
  { id: "fraud", label: "Fraud & Risk", color: "#ef4444" },
  { id: "compliance", label: "Compliance & KYC", color: "#14b8a6" },
  { id: "catalog", label: "Catalog & Search", color: "#f59e0b" },
  { id: "loyalty", label: "Loyalty & Rewards", color: "#ec4899" },
  { id: "fulfillment", label: "Shipping & Fulfillment", color: "#84cc16" },
  { id: "notifications", label: "Notifications", color: "#06b6d4" },
  { id: "reporting", label: "Admin & Reporting", color: "#a855f7" },
];

export const RESOURCE_ROLES = [
  "Backend Developer",
  "Frontend Developer",
  "Mobile Developer",
  "QA Engineer",
  "UX/UI Designer",
  "DevOps Engineer",
  "Security Engineer",
  "Data Analyst",
  "Product Manager",
];

export const GRANULARITY_LEVELS = [
  "Daily Task",
  "Weekly Workload",
  "Sprint Commitment",
];

// Helper kept tiny and dependency-free: real backend will send ISO timestamps.
const t = (iso) => iso;

export const mockRequirements = [
  {
    id: "REQ-101",
    projectId: "proj-novacart",
    title: "OAuth2 login via Google and Apple ID",
    description:
      "Shoppers can authenticate using Google or Apple ID via OAuth2, in addition to email/password, to reduce account-creation drop-off during checkout.",
    liveStatus: "Confirmed",
    resourceRole: "Backend Developer",
    granularity: "Sprint Commitment",
    cluster: "auth",
    relatedIds: ["REQ-102", "REQ-103", "REQ-107"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-04T09:12:00+05:30"),
        signal:
          "\"Let's lock in Google + Apple OAuth for v1. Email/password alone is killing our signup conversion.\" (Product kickoff workshop notes)",
      },
    ],
  },
  {
    id: "REQ-102",
    projectId: "proj-novacart",
    title: "Biometric re-authentication for saved cards",
    description:
      "Mobile app must prompt Face ID / fingerprint re-authentication before autofilling a saved card at checkout, per updated PCI guidance.",
    liveStatus: "Confirmed",
    resourceRole: "Mobile Developer",
    granularity: "Sprint Commitment",
    cluster: "auth",
    relatedIds: ["REQ-101", "REQ-108"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-05T14:20:00+05:30"),
        signal:
          "\"Compliance flagged saved-card autofill, so we need biometric confirmation before we populate PAN fields.\" (Email from Security Engineer to #eng-payments)",
      },
    ],
  },
  {
    id: "REQ-103",
    projectId: "proj-novacart",
    title: "Session timeout aligned across web and mobile",
    description:
      "Idle session timeout must be unified to 15 minutes across the web app and mobile app, with a 60-second warning modal before forced logout.",
    liveStatus: "At Risk",
    resourceRole: "Frontend Developer",
    granularity: "Weekly Workload",
    cluster: "auth",
    relatedIds: ["REQ-101"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-06T10:00:00+05:30"),
        signal:
          "\"Security review requires matching idle-timeout behavior on web and mobile before GA.\" (Sprint planning notes)",
      },
      {
        status: "At Risk",
        timestamp: t("2026-08-18T16:45:00+05:30"),
        signal:
          "\"Mobile team is blocked on the shared session SDK, so we won't hit the timeout parity work this sprint.\" (Daily standup, Mobile Developer)",
      },
    ],
  },
  {
    id: "REQ-104",
    projectId: "proj-novacart",
    title: "Tokenized wallet top-up via bank transfer",
    description:
      "Customers can top up their NovaPay wallet balance directly from a linked bank account using tokenized ACH/UPI transfer, without re-entering bank details each time.",
    liveStatus: "Confirmed",
    resourceRole: "Backend Developer",
    granularity: "Sprint Commitment",
    cluster: "payments",
    relatedIds: ["REQ-105", "REQ-106", "REQ-112"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-03T11:30:00+05:30"),
        signal:
          "\"Wallet top-up via saved bank token is a must-have for the wallet launch. Don't cut this.\" (Product Manager, roadmap review email)",
      },
    ],
  },
  {
    id: "REQ-105",
    projectId: "proj-novacart",
    title: "Instant refund-to-wallet for cancelled orders",
    description:
      "When an order is cancelled within 10 minutes of placement, the refund should credit the customer's NovaPay wallet instantly instead of routing through the original payment method.",
    liveStatus: "Modified",
    resourceRole: "Backend Developer",
    granularity: "Sprint Commitment",
    cluster: "payments",
    relatedIds: ["REQ-104", "REQ-113"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-04T09:45:00+05:30"),
        signal:
          "\"Instant wallet refunds for quick cancellations: this is a top customer complaint driver.\" (Product kickoff workshop notes)",
      },
      {
        status: "Modified",
        timestamp: t("2026-08-15T13:10:00+05:30"),
        signal:
          "\"Let's cap instant wallet refunds at orders under LKR 25,000. Anything above needs a manual risk check first.\" (Slack #eng-payments, Data Analyst)",
      },
    ],
  },
  {
    id: "REQ-106",
    projectId: "proj-novacart",
    title: "Multi-currency display for wallet balance",
    description:
      "Wallet balance and transaction history should display in the customer's selected display currency, with the settlement currency shown as a secondary line.",
    liveStatus: "At Risk",
    resourceRole: "Frontend Developer",
    granularity: "Weekly Workload",
    cluster: "payments",
    relatedIds: ["REQ-104"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-07T10:15:00+05:30"),
        signal:
          "\"We committed to multi-currency wallet display for the regional launch.\" (Sprint planning notes)",
      },
      {
        status: "At Risk",
        timestamp: t("2026-08-20T09:30:00+05:30"),
        signal:
          "\"FX rate feed vendor hasn't confirmed an SLA yet, and this could slip past the sprint if procurement drags.\" (Daily standup, Backend Developer)",
      },
    ],
  },
  {
    id: "REQ-107",
    projectId: "proj-novacart",
    title: "Guest checkout with post-purchase account creation",
    description:
      "Shoppers can complete checkout without creating an account, then be offered a one-tap account creation using the order's shipping and payment details already on file.",
    liveStatus: "Confirmed",
    resourceRole: "Frontend Developer",
    granularity: "Sprint Commitment",
    cluster: "checkout",
    relatedIds: ["REQ-101", "REQ-108", "REQ-109"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-03T15:00:00+05:30"),
        signal:
          "\"Guest checkout is non-negotiable for launch. We're losing 30% of carts to forced signup.\" (Product kickoff workshop notes)",
      },
    ],
  },
  {
    id: "REQ-108",
    projectId: "proj-novacart",
    title: "One-page checkout with saved address autofill",
    description:
      "Consolidate shipping, billing, and payment into a single scrollable checkout page, with saved addresses and cards auto-filled for returning customers.",
    liveStatus: "Modified",
    resourceRole: "Frontend Developer",
    granularity: "Sprint Commitment",
    cluster: "checkout",
    relatedIds: ["REQ-102", "REQ-107"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-04T12:20:00+05:30"),
        signal:
          "\"One-page checkout is scoped in for this quarter, saved-address autofill included.\" (Sprint planning notes)",
      },
      {
        status: "Modified",
        timestamp: t("2026-08-16T11:05:00+05:30"),
        signal:
          "\"UX testing showed users want a review step before placing the order: splitting into two steps, not fully single-page.\" (Email from UX/UI Designer to Product Manager)",
      },
    ],
  },
  {
    id: "REQ-109",
    projectId: "proj-novacart",
    title: "Real-time inventory hold during checkout",
    description:
      "Reserve cart items against live inventory for a 7-minute window once checkout begins, releasing the hold automatically if payment isn't completed in time.",
    liveStatus: "Confirmed",
    resourceRole: "Backend Developer",
    granularity: "Sprint Commitment",
    cluster: "checkout",
    relatedIds: ["REQ-107", "REQ-115"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-05T10:40:00+05:30"),
        signal:
          "\"We need an inventory hold or we'll keep overselling flash-sale items during checkout.\" (Jira comment, Product Manager)",
      },
    ],
  },
  {
    id: "REQ-110",
    projectId: "proj-novacart",
    title: "Velocity-based fraud scoring at checkout",
    description:
      "Score each checkout attempt in real time using purchase velocity, device fingerprint, and shipping/billing mismatch signals; route high-risk orders to manual review.",
    liveStatus: "Confirmed",
    resourceRole: "Security Engineer",
    granularity: "Sprint Commitment",
    cluster: "fraud",
    relatedIds: ["REQ-111", "REQ-105"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-04T16:00:00+05:30"),
        signal:
          "\"Fraud scoring at checkout is a hard launch requirement per the risk committee.\" (Email from Security Engineer to leadership)",
      },
    ],
  },
  {
    id: "REQ-111",
    projectId: "proj-novacart",
    title: "Manual review queue for flagged high-risk orders",
    description:
      "Provide an internal admin queue where risk analysts can approve, hold, or reject orders flagged by the fraud scoring engine, with full signal context per order.",
    liveStatus: "At Risk",
    resourceRole: "Data Analyst",
    granularity: "Weekly Workload",
    cluster: "fraud",
    relatedIds: ["REQ-110"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-06T09:00:00+05:30"),
        signal:
          "\"Risk analysts need a review queue before fraud scoring goes live. Can't flag orders with nowhere to send them.\" (Sprint planning notes)",
      },
      {
        status: "At Risk",
        timestamp: t("2026-08-21T14:30:00+05:30"),
        signal:
          "\"The admin queue UI is still waiting on design handoff. We're two days behind and it's a hard dependency for fraud go-live.\" (Daily standup, Data Analyst)",
      },
    ],
  },
  {
    id: "REQ-112",
    projectId: "proj-novacart",
    title: "PCI-DSS tokenization for stored card data",
    description:
      "All stored card data must be tokenized through the PCI-compliant vault provider; raw PAN must never touch application servers or logs.",
    liveStatus: "Confirmed",
    resourceRole: "Security Engineer",
    granularity: "Sprint Commitment",
    cluster: "compliance",
    relatedIds: ["REQ-104", "REQ-113"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-02T09:00:00+05:30"),
        signal:
          "\"PCI tokenization is table stakes: no exceptions, no raw PAN storage anywhere.\" (Product kickoff workshop notes)",
      },
    ],
  },
  {
    id: "REQ-113",
    projectId: "proj-novacart",
    title: "KYC document verification for wallet activation",
    description:
      "Customers must submit and pass automated ID document verification before their NovaPay wallet can hold a balance above the unverified-tier limit.",
    liveStatus: "Dropped",
    resourceRole: "Backend Developer",
    granularity: "Sprint Commitment",
    cluster: "compliance",
    relatedIds: ["REQ-104", "REQ-112"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-05T11:15:00+05:30"),
        signal:
          "\"KYC verification is required before wallet balances can exceed the unverified limit: regulatory requirement.\" (Email from Compliance Officer)",
      },
      {
        status: "At Risk",
        timestamp: t("2026-08-14T10:00:00+05:30"),
        signal:
          "\"Our KYC vendor integration got pushed to Q3, so this won't make the wallet v1 launch window.\" (Slack #eng-payments, Backend Developer)",
      },
      {
        status: "Dropped",
        timestamp: t("2026-08-22T15:40:00+05:30"),
        signal:
          "\"Confirmed with legal: we're launching wallet v1 with a hard balance cap instead of KYC, revisit verification next quarter.\" (Email from Product Manager to engineering leads)",
      },
    ],
  },
  {
    id: "REQ-114",
    projectId: "proj-novacart",
    title: "Faceted search filters for product catalog",
    description:
      "Shoppers can filter catalog search results by price range, brand, rating, and availability, with filters combinable and reflected in the shareable URL.",
    liveStatus: "Confirmed",
    resourceRole: "Frontend Developer",
    granularity: "Weekly Workload",
    cluster: "catalog",
    relatedIds: ["REQ-115", "REQ-116"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-06T13:00:00+05:30"),
        signal:
          "\"Faceted filtering is scoped for this sprint, filters need to be shareable via URL.\" (Sprint planning notes)",
      },
    ],
  },
  {
    id: "REQ-115",
    projectId: "proj-novacart",
    title: "Search-as-you-type with typo tolerance",
    description:
      "Catalog search should return ranked suggestions as the user types, tolerating common typos and partial matches, with results updating within 200ms.",
    liveStatus: "Modified",
    resourceRole: "Backend Developer",
    granularity: "Sprint Commitment",
    cluster: "catalog",
    relatedIds: ["REQ-114", "REQ-109"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-05T09:30:00+05:30"),
        signal:
          "\"Search-as-you-type with typo tolerance is committed for the catalog revamp.\" (Product kickoff workshop notes)",
      },
      {
        status: "Modified",
        timestamp: t("2026-08-19T12:15:00+05:30"),
        signal:
          "\"Search relevance testing came back rough. We're relaxing the 200ms target to 400ms so ranking quality doesn't suffer.\" (Slack #eng-catalog, Backend Developer)",
      },
    ],
  },
  {
    id: "REQ-116",
    projectId: "proj-novacart",
    title: "Personalized 'Recommended for you' rail",
    description:
      "Homepage should surface a personalized product rail driven by browsing and purchase history, falling back to trending items for new or logged-out users.",
    liveStatus: "Confirmed",
    resourceRole: "Data Analyst",
    granularity: "Sprint Commitment",
    cluster: "catalog",
    relatedIds: ["REQ-114", "REQ-118"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-07T09:00:00+05:30"),
        signal:
          "\"Personalized recommendations rail is greenlit for the homepage redesign.\" (Sprint planning notes)",
      },
    ],
  },
  {
    id: "REQ-117",
    projectId: "proj-novacart",
    title: "Tiered loyalty points on wallet-funded purchases",
    description:
      "Purchases paid using the NovaPay wallet earn 1.5x loyalty points compared to card payments, to encourage wallet adoption; points reflect in real time post-purchase.",
    liveStatus: "Dropped",
    resourceRole: "Product Manager",
    granularity: "Sprint Commitment",
    cluster: "loyalty",
    relatedIds: ["REQ-118", "REQ-104"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-04T10:30:00+05:30"),
        signal:
          "\"1.5x loyalty points for wallet payments: this is our wedge to drive wallet adoption at launch.\" (Product kickoff workshop notes)",
      },
      {
        status: "Dropped",
        timestamp: t("2026-08-17T15:20:00+05:30"),
        signal:
          "\"Finance flagged the 1.5x multiplier as margin-negative until wallet top-up fees are live. Pulling this from v1 scope.\" (Email from Product Manager to finance)",
      },
    ],
  },
  {
    id: "REQ-118",
    projectId: "proj-novacart",
    title: "Loyalty tier badges on customer profile",
    description:
      "Display the customer's current loyalty tier (Silver / Gold / Platinum) as a badge on their profile and at checkout, with progress toward the next tier shown.",
    liveStatus: "Confirmed",
    resourceRole: "UX/UI Designer",
    granularity: "Weekly Workload",
    cluster: "loyalty",
    relatedIds: ["REQ-117", "REQ-116"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-08T11:00:00+05:30"),
        signal:
          "\"Tier badges on profile and checkout are in scope for the loyalty program soft launch.\" (Sprint planning notes)",
      },
    ],
  },
  {
    id: "REQ-119",
    projectId: "proj-novacart",
    title: "SLA-based carrier selection for order fulfillment",
    description:
      "Fulfillment engine should auto-select the shipping carrier that meets the customer's promised delivery SLA at the lowest cost, re-evaluating if a carrier reports a delay.",
    liveStatus: "At Risk",
    resourceRole: "Backend Developer",
    granularity: "Sprint Commitment",
    cluster: "fulfillment",
    relatedIds: ["REQ-120"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-06T14:00:00+05:30"),
        signal:
          "\"SLA-based carrier auto-selection is committed for this quarter's fulfillment work.\" (Sprint planning notes)",
      },
      {
        status: "At Risk",
        timestamp: t("2026-08-23T10:20:00+05:30"),
        signal:
          "\"Two of our three carrier APIs don't expose real-time delay events yet, so auto re-evaluation may need to be scoped down.\" (Daily standup, Backend Developer)",
      },
    ],
  },
  {
    id: "REQ-120",
    projectId: "proj-novacart",
    title: "Real-time delivery tracking map for customers",
    description:
      "Order tracking page shows a live map with the delivery courier's estimated location and updated ETA, refreshing at least every 60 seconds.",
    liveStatus: "Confirmed",
    resourceRole: "Frontend Developer",
    granularity: "Weekly Workload",
    cluster: "fulfillment",
    relatedIds: ["REQ-119"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-07T15:30:00+05:30"),
        signal:
          "\"Live delivery tracking map is confirmed for the post-purchase experience revamp.\" (Product kickoff workshop notes)",
      },
    ],
  },
  {
    id: "REQ-121",
    projectId: "proj-novacart",
    title: "SMS + push notification for order status changes",
    description:
      "Customers receive an SMS and/or push notification (per their notification preferences) whenever their order status changes: confirmed, shipped, out for delivery, delivered.",
    liveStatus: "Confirmed",
    resourceRole: "Backend Developer",
    granularity: "Weekly Workload",
    cluster: "notifications",
    relatedIds: ["REQ-120", "REQ-122"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-05T13:45:00+05:30"),
        signal:
          "\"Order status notifications via SMS and push are committed for this sprint.\" (Sprint planning notes)",
      },
    ],
  },
  {
    id: "REQ-122",
    projectId: "proj-novacart",
    title: "Configurable notification preference center",
    description:
      "Customers can independently toggle SMS, push, and email notifications per category (order updates, promotions, price drops, wallet activity) from account settings.",
    liveStatus: "Modified",
    resourceRole: "Frontend Developer",
    granularity: "Weekly Workload",
    cluster: "notifications",
    relatedIds: ["REQ-121"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-06T09:20:00+05:30"),
        signal:
          "\"Granular per-category notification preferences are in scope for the account settings revamp.\" (Sprint planning notes)",
      },
      {
        status: "Modified",
        timestamp: t("2026-08-20T16:00:00+05:30"),
        signal:
          "\"Support is getting complaints about missed order alerts, so order-update notifications will no longer be toggleable, only promotional ones.\" (Slack #eng-notifications, Product Manager)",
      },
    ],
  },
  {
    id: "REQ-123",
    projectId: "proj-novacart",
    title: "Daily settlement reconciliation dashboard",
    description:
      "Finance and ops teams need a daily dashboard reconciling gateway settlements against internal order and refund records, flagging mismatches over a configurable threshold.",
    liveStatus: "Confirmed",
    resourceRole: "Data Analyst",
    granularity: "Sprint Commitment",
    cluster: "reporting",
    relatedIds: ["REQ-124", "REQ-105"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-03T10:00:00+05:30"),
        signal:
          "\"Daily settlement reconciliation dashboard is a hard requirement before we can scale payment volume.\" (Email from Finance to Product Manager)",
      },
    ],
  },
  {
    id: "REQ-124",
    projectId: "proj-novacart",
    title: "Role-based access control for admin console",
    description:
      "Admin console actions (refunds, catalog edits, fraud review, user data access) must be gated by role-based permissions, with an audit log of every privileged action.",
    liveStatus: "At Risk",
    resourceRole: "Security Engineer",
    granularity: "Sprint Commitment",
    cluster: "reporting",
    relatedIds: ["REQ-123", "REQ-111"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-08-04T11:00:00+05:30"),
        signal:
          "\"RBAC for the admin console is mandatory before we onboard more ops staff.\" (Sprint planning notes)",
      },
      {
        status: "At Risk",
        timestamp: t("2026-08-24T13:00:00+05:30"),
        signal:
          "\"The permissions schema keeps changing as new admin actions get added, so audit logging work is falling behind.\" (Daily standup, Security Engineer)",
      },
    ],
  },

  // ================= Meridian Pay (proj-meridianpay) =================
  {
    id: "REQ-201",
    projectId: "proj-meridianpay",
    title: "Passwordless login via one-time SMS code",
    description:
      "Customers can log in using a one-time SMS code sent to their registered mobile number, as the primary authentication method alongside an optional PIN for returning sessions.",
    liveStatus: "Confirmed",
    resourceRole: "Backend Developer",
    granularity: "Sprint Commitment",
    cluster: "auth",
    relatedIds: ["REQ-202", "REQ-207"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-07-09T10:00:00+05:30"),
        signal:
          "\"OTP-first login is our onboarding differentiator: no passwords to remember at launch.\" (Product kickoff workshop notes)",
      },
    ],
  },
  {
    id: "REQ-202",
    projectId: "proj-meridianpay",
    title: "Device-binding for repeat login sessions",
    description:
      "Once a device completes OTP verification, it can be bound to the account so subsequent logins on that device skip SMS OTP and use a local biometric/PIN check instead.",
    liveStatus: "At Risk",
    resourceRole: "Mobile Developer",
    granularity: "Sprint Commitment",
    cluster: "auth",
    relatedIds: ["REQ-201", "REQ-206"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-07-10T11:00:00+05:30"),
        signal:
          "\"Device binding is required so we're not sending an SMS OTP on every single login. Cost and friction both suffer otherwise.\" (Sprint planning notes)",
      },
      {
        status: "At Risk",
        timestamp: t("2026-08-20T09:15:00+05:30"),
        signal:
          "\"Secure enclave key storage on older Android devices is behaving inconsistently, so we may need a fallback path before this ships.\" (Daily standup, Chamika Rathnayake)",
      },
    ],
  },
  {
    id: "REQ-203",
    projectId: "proj-meridianpay",
    title: "Instant peer-to-peer transfers between Meridian accounts",
    description:
      "Customers can transfer funds instantly to another Meridian Pay account using just a mobile number or account tag, with funds available to the recipient within seconds.",
    liveStatus: "Confirmed",
    resourceRole: "Backend Developer",
    granularity: "Sprint Commitment",
    cluster: "payments",
    relatedIds: ["REQ-204", "REQ-205"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-07-08T09:30:00+05:30"),
        signal:
          "\"Instant P2P transfer between Meridian accounts is the core value prop for launch. This cannot slip.\" (Product kickoff workshop notes)",
      },
    ],
  },
  {
    id: "REQ-204",
    projectId: "proj-meridianpay",
    title: "Scheduled recurring transfers (standing orders)",
    description:
      "Customers can set up recurring transfers (e.g. monthly rent, savings sweep) that execute automatically on a chosen schedule, with a notification before each execution.",
    liveStatus: "Modified",
    resourceRole: "Backend Developer",
    granularity: "Weekly Workload",
    cluster: "payments",
    relatedIds: ["REQ-203"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-07-14T10:00:00+05:30"),
        signal:
          "\"Standing orders are scoped for this quarter: rent and savings-sweep are the two most requested use cases.\" (Sprint planning notes)",
      },
      {
        status: "Modified",
        timestamp: t("2026-08-18T14:20:00+05:30"),
        signal:
          "\"Let's cap standing orders at 5 per account for v1. Unlimited recurring transfers complicates the fraud review queue.\" (Slack #eng-payments, Yasodha Wijeratne)",
      },
    ],
  },
  {
    id: "REQ-205",
    projectId: "proj-meridianpay",
    title: "Real-time transaction anomaly scoring",
    description:
      "Every outgoing transfer is scored in real time for anomalous behavior (unusual amount, new recipient, atypical time-of-day) before funds are released.",
    liveStatus: "Confirmed",
    resourceRole: "Security Engineer",
    granularity: "Sprint Commitment",
    cluster: "fraud",
    relatedIds: ["REQ-203", "REQ-206", "REQ-209"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-07-11T09:00:00+05:30"),
        signal:
          "\"Real-time anomaly scoring on every transfer is a hard compliance requirement before we can process real money.\" (Email from Security Engineer to leadership)",
      },
    ],
  },
  {
    id: "REQ-206",
    projectId: "proj-meridianpay",
    title: "Step-up authentication for high-risk transfers",
    description:
      "Transfers flagged as high-risk by the anomaly scoring engine require a step-up authentication challenge (biometric re-confirmation) before they are released.",
    liveStatus: "At Risk",
    resourceRole: "Security Engineer",
    granularity: "Sprint Commitment",
    cluster: "fraud",
    relatedIds: ["REQ-205", "REQ-202"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-07-15T10:30:00+05:30"),
        signal:
          "\"High-risk transfers need a step-up challenge, not just a score and a silent block.\" (Sprint planning notes)",
      },
      {
        status: "At Risk",
        timestamp: t("2026-08-22T11:45:00+05:30"),
        signal:
          "\"The step-up challenge SDK integration is blocked on the mobile team finishing device-binding first. Same root dependency as REQ-202.\" (Daily standup, Chathurika Abeywardena)",
      },
    ],
  },
  {
    id: "REQ-207",
    projectId: "proj-meridianpay",
    title: "Digital KYC onboarding with liveness check",
    description:
      "New customers complete identity verification during onboarding using a government ID scan plus a liveness-detection selfie check, before their account is activated.",
    liveStatus: "Confirmed",
    resourceRole: "Backend Developer",
    granularity: "Sprint Commitment",
    cluster: "compliance",
    relatedIds: ["REQ-201", "REQ-208"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-07-08T14:00:00+05:30"),
        signal:
          "\"Digital KYC with liveness check is non-negotiable. We can't open an account without it under current regulation.\" (Product kickoff workshop notes)",
      },
    ],
  },
  {
    id: "REQ-208",
    projectId: "proj-meridianpay",
    title: "Regulatory transaction reporting export (CBSL format)",
    description:
      "Compliance can export a full transaction report in the format required by the Central Bank reporting template, on demand or on a scheduled basis.",
    liveStatus: "Modified",
    resourceRole: "Data Analyst",
    granularity: "Sprint Commitment",
    cluster: "compliance",
    relatedIds: ["REQ-207", "REQ-212"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-07-16T09:00:00+05:30"),
        signal:
          "\"We need the CBSL export ready before go-live, not after. Compliance won't sign off otherwise.\" (Email from Compliance Officer)",
      },
      {
        status: "Modified",
        timestamp: t("2026-08-19T10:10:00+05:30"),
        signal:
          "\"The regulator's template changed since we scoped this. Switching to the updated Q3 schema before we build the export.\" (Teams: Compliance Sync, Nuwan Karunaratne)",
      },
    ],
  },
  {
    id: "REQ-209",
    projectId: "proj-meridianpay",
    title: "Real-time balance change push alerts",
    description:
      "Customers receive an immediate push notification whenever their account balance changes, showing the amount, counterparty, and resulting balance.",
    liveStatus: "Confirmed",
    resourceRole: "Frontend Developer",
    granularity: "Weekly Workload",
    cluster: "notifications",
    relatedIds: ["REQ-205", "REQ-210"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-07-12T09:45:00+05:30"),
        signal:
          "\"Real-time balance push is table stakes for a banking app. Committing this for the onboarding sprint.\" (Sprint planning notes)",
      },
    ],
  },
  {
    id: "REQ-210",
    projectId: "proj-meridianpay",
    title: "Low-balance and unusual-activity SMS alerts",
    description:
      "Customers below a configurable balance threshold, or on an account flagged for unusual activity, receive an SMS alert in addition to the in-app notification.",
    liveStatus: "Dropped",
    resourceRole: "Backend Developer",
    granularity: "Weekly Workload",
    cluster: "notifications",
    relatedIds: ["REQ-209"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-07-17T11:00:00+05:30"),
        signal:
          "\"Low-balance SMS alerts were requested by the pilot user group, so let's include it.\" (Sprint planning notes)",
      },
      {
        status: "Dropped",
        timestamp: t("2026-08-21T15:30:00+05:30"),
        signal:
          "\"SMS gateway costs for balance alerts at our projected volume aren't justified yet. Push notifications cover this for now, revisit post-launch.\" (Email from Product Manager to finance)",
      },
    ],
  },
  {
    id: "REQ-211",
    projectId: "proj-meridianpay",
    title: "Personal spend-category analytics dashboard",
    description:
      "Customers can view a breakdown of their spending by category (bills, transfers, subscriptions, etc.) over the past 30/60/90 days, with simple trend charts.",
    liveStatus: "Confirmed",
    resourceRole: "Data Analyst",
    granularity: "Sprint Commitment",
    cluster: "reporting",
    relatedIds: ["REQ-212"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-07-18T10:15:00+05:30"),
        signal:
          "\"Spend-category analytics is a key retention feature for the budgeting-app segment, so keep it in scope.\" (Product kickoff workshop notes)",
      },
    ],
  },
  {
    id: "REQ-212",
    projectId: "proj-meridianpay",
    title: "Admin console audit trail for support access",
    description:
      "Every time a support agent views a customer's account details in the admin console, the access is logged with agent identity, timestamp, and reason code, visible to compliance.",
    liveStatus: "At Risk",
    resourceRole: "Security Engineer",
    granularity: "Sprint Commitment",
    cluster: "reporting",
    relatedIds: ["REQ-208", "REQ-211"],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: t("2026-07-19T09:00:00+05:30"),
        signal:
          "\"Support agent access to customer accounts must be fully audited. This is a licensing condition.\" (Sprint planning notes)",
      },
      {
        status: "At Risk",
        timestamp: t("2026-08-23T13:20:00+05:30"),
        signal:
          "\"Reason-code capture keeps getting skipped by agents in testing, so we may need to make it a blocking field, which pushes the timeline.\" (Daily standup, Anjali Fonseka)",
      },
    ],
  },
];

let requirementSeq = mockRequirements.length;

// PM-only: turns one item from the SRS onboarding upload (see
// DetectRequirementsDialog) into a real, tracked requirement, the same
// shape as every hand-written record above (plus an optional `category`
// none of the seed data carries, since it's a newer field only that flow
// populates). Unlike Signal Feed uploads, which only ever produce signals
// mapped against requirements that already exist, this is how a project
// gets its very first requirements.
export function createRequirement({ projectId, title, description, resourceRole, granularity, cluster, category, sourceLabel }) {
  requirementSeq += 1;
  const requirement = {
    id: `req-srs-${Date.now()}-${requirementSeq}`,
    projectId,
    title,
    description,
    liveStatus: "Confirmed",
    resourceRole,
    granularity,
    cluster,
    category: category ?? null,
    relatedIds: [],
    statusHistory: [
      {
        status: "Confirmed",
        timestamp: new Date().toISOString(),
        signal: sourceLabel,
      },
    ],
  };
  mockRequirements.push(requirement);
  return requirement;
}

export function getRequirementById(id) {
  return mockRequirements.find((r) => r.id === id);
}

export function getRequirementsForProject(projectId) {
  return mockRequirements.filter((r) => r.projectId === projectId);
}

export function getClusterMeta(clusterId) {
  return CLUSTERS.find((c) => c.id === clusterId);
}

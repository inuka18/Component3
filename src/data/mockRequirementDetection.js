// Mock requirement detection over an uploaded SRS (Software Requirements
// Specification) document, for DetectRequirementsDialog. Deliberately
// separate from mockDocumentExtraction.js: that module detects CHANGE
// SIGNALS against requirements that already exist, this one detects the
// requirements THEMSELVES, for a project that has none yet. A real
// backend would run a document-level requirements-extraction pass here;
// this simulates its output as a fixed pool a PM reviews and edits
// before any of it becomes a real record.
const REQUIREMENT_POOL = [
  {
    title: "Password reset via time-limited email link",
    description:
      "Users must be able to reset their password through a verified email link that expires 30 minutes after it is sent.",
    category: "Functional",
    cluster: "auth",
  },
  {
    title: "Account lockout after repeated failed logins",
    description:
      "The system must lock an account for 15 minutes after five consecutive failed login attempts.",
    category: "Non-Functional",
    cluster: "auth",
  },
  {
    title: "Two-factor authentication for admin accounts",
    description:
      "All admin-level accounts must require a second authentication factor in addition to a password before sign-in completes.",
    category: "Non-Functional",
    cluster: "auth",
  },
  {
    title: "Redundant payment gateway failover",
    description:
      "The system must support at least two payment gateways so checkout can fail over automatically if the primary gateway is unavailable.",
    category: "Non-Functional",
    cluster: "payments",
  },
  {
    title: "Refunds settle within 5 business days",
    description:
      "Refunds must be processed back to the customer's original payment method within 5 business days of approval.",
    category: "Functional",
    cluster: "payments",
  },
  {
    title: "Guest checkout without account creation",
    description:
      "The checkout flow must allow a guest user to complete a purchase without being required to create an account first.",
    category: "Functional",
    cluster: "checkout",
  },
  {
    title: "Cart persists across sessions",
    description:
      "The cart must persist across sessions for logged-in users for at least 30 days, so an abandoned cart survives a return visit.",
    category: "Functional",
    cluster: "checkout",
  },
  {
    title: "Manual review queue for high-value transactions",
    description:
      "Transactions above a configurable value threshold must be flagged and held for manual review before settlement completes.",
    category: "Functional",
    cluster: "fraud",
  },
  {
    title: "Velocity checks on repeated card attempts",
    description:
      "The system must flag an account that attempts more than three distinct payment cards within a single hour as a fraud-review candidate.",
    category: "Non-Functional",
    cluster: "fraud",
  },
  {
    title: "PII encrypted at rest",
    description:
      "All personally identifiable information must be encrypted at rest, in line with the data-protection policy referenced in the SRS's compliance appendix.",
    category: "Non-Functional",
    cluster: "compliance",
  },
  {
    title: "Immutable audit log of status changes",
    description:
      "The system must retain an audit log of every status change to a tracked record, immutable once written, for compliance review.",
    category: "Non-Functional",
    cluster: "compliance",
  },
  {
    title: "Sub-500ms product search",
    description: "Product search must return relevant results within 500ms for catalogs of up to 100,000 SKUs.",
    category: "Non-Functional",
    cluster: "catalog",
  },
  {
    title: "Loyalty points credited within 24 hours",
    description: "Customers must earn loyalty points on every completed purchase, credited to their balance within 24 hours.",
    category: "Functional",
    cluster: "loyalty",
  },
  {
    title: "Automatic order-status updates from carrier webhooks",
    description:
      "Order status must update automatically the moment a shipping carrier's webhook reports a status change, without waiting for a manual sync.",
    category: "Functional",
    cluster: "fulfillment",
  },
  {
    title: "Independent opt-out for promotional notifications",
    description:
      "Users must be able to opt out of promotional notifications independently of transactional ones, so disabling marketing never silences order updates.",
    category: "Functional",
    cluster: "notifications",
  },
  {
    title: "Filtered activity export as CSV",
    description: "Admins must be able to export a filtered report of all activity within a given date range as a CSV file.",
    category: "Functional",
    cluster: "reporting",
  },
];

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function detectRequirementsFromSRS({ projectId }) {
  const count = 8 + Math.floor(Math.random() * 5); // 8-12 items
  const picks = shuffle(REQUIREMENT_POOL).slice(0, count);
  const now = Date.now();

  return picks.map((item, i) => ({
    id: `det-item-${now}-${i}`,
    projectId,
    title: item.title,
    description: item.description,
    category: item.category,
    resourceRole: "Unassigned",
    cluster: item.cluster,
  }));
}

// Mock NLP extraction over an uploaded document. A real backend would run
// the same pipeline that classifies chat/email signals over the document's
// text, splitting it into individually-classified requirement-relevant
// snippets rather than treating the whole file as one signal. This module
// simulates that output so the UI never has to ask a human to pick a
// single classification for a multi-requirement document.
import { getRequirementsForProject } from "./mockRequirements";
import { determineReviewStatus } from "../lib/signalReview";

const SNIPPET_POOL = [
  {
    text: "The system must support multi-factor authentication for all admin-level accounts before general availability.",
    classification: "Expectation",
  },
  {
    text: "Payment retries are capped at three attempts within a 24-hour window to reduce card-network decline penalties.",
    classification: "Constraint",
  },
  {
    text: "Section 4.2 of the vendor SOW confirms the KYC integration has passed UAT and is ready for production rollout.",
    classification: "Completion",
  },
  {
    text: "Legal has flagged that the proposed data-retention period conflicts with the updated privacy policy draft.",
    classification: "Conflict",
  },
  {
    text: "Given budget constraints this quarter, the loyalty-tier rewards expansion will not be pursued for this release.",
    classification: "Conflict",
    proposedStatus: "Dropped",
  },
  {
    text: "All customer-facing error messages must be localized into at least three languages at launch.",
    classification: "Expectation",
  },
  {
    text: "The mobile checkout flow cannot exceed three steps, per the UX research findings referenced in Appendix B.",
    classification: "Constraint",
  },
  {
    text: "Database migration for the new notification preferences schema completed successfully in staging.",
    classification: "Completion",
  },
  {
    text: "Procurement was unable to finalize the SMS gateway contract in time, creating a conflict with the committed launch date.",
    classification: "Conflict",
  },
  {
    text: "Per the revised roadmap, biometric step-up authentication is deprioritized and dropped from this phase.",
    classification: "Conflict",
    proposedStatus: "Dropped",
  },
  {
    text: "The reporting dashboard must refresh settlement data at least every 15 minutes during business hours.",
    classification: "Expectation",
  },
  {
    text: "Security review sign-off was received for the updated session-timeout implementation.",
    classification: "Completion",
  },
  {
    text: "Fraud review capacity constraints mean manual review SLAs cannot be reduced below four business hours.",
    classification: "Constraint",
  },
  {
    text: "There is a conflict between finance's settlement-cadence requirement and the current batch-processing window.",
    classification: "Conflict",
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

function randomConfidence(proposedStatus) {
  // Mostly high-confidence extractions, occasionally a lower-confidence one
  // so the pending-review path is reliably exercised in the demo. A Dropped
  // proposal still gets a plausible confidence, it lands in review because
  // of the status, not because the extraction itself was uncertain.
  if (proposedStatus === "Dropped") return 70 + Math.floor(Math.random() * 20); // 70-89
  return Math.random() < 0.72
    ? 78 + Math.floor(Math.random() * 20) // 78-97, high confidence
    : 45 + Math.floor(Math.random() * 20); // 45-64, low confidence
}

export async function extractSignalsFromDocument({ fileName, projectId, author = "Document Extraction" }) {
  const count = 4 + Math.floor(Math.random() * 3); // 4-6 items
  const picks = shuffle(SNIPPET_POOL).slice(0, count);
  const candidateRequirements = getRequirementsForProject(projectId);
  const now = Date.now();

  return picks.map((snippet, i) => {
    const confidence = randomConfidence(snippet.proposedStatus);
    // Roughly half the extracted items resolve to an existing requirement;
    // the rest surface as genuinely new, unmatched signals.
    const mapped =
      candidateRequirements.length > 0 && Math.random() < 0.55
        ? candidateRequirements[Math.floor(Math.random() * candidateRequirements.length)]
        : null;

    return {
      id: `sig-doc-${now}-${i}`,
      projectId,
      source: "Document Upload",
      channel: `Document: ${fileName}`,
      author,
      timestamp: new Date().toISOString(),
      text: snippet.text,
      classification: snippet.classification,
      confidence,
      mappedRequirementId: mapped?.id ?? null,
      proposedStatus: snippet.proposedStatus,
      reviewStatus: determineReviewStatus({ confidence, proposedStatus: snippet.proposedStatus }),
    };
  });
}

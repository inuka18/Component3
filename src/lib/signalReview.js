// Confidence-based auto-review rule, shared by every flow that produces new
// signals (document extraction, generated transcripts, and, implicitly,
// the seed data in mockSignals.js): anything below the high-confidence
// threshold, or proposing to Drop a requirement, is held in Pending Review
// for a PM to Accept/Reject rather than being auto-applied to the record.
export const HIGH_CONFIDENCE_THRESHOLD = 70;

export function determineReviewStatus({ confidence, proposedStatus }) {
  if (proposedStatus === "Dropped") return "pending";
  if (confidence < HIGH_CONFIDENCE_THRESHOLD) return "pending";
  return "accepted";
}

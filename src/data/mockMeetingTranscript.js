// Meeting-transcript generation. This lives in the data layer, not inside
// either feature's components, so there is exactly one place that creates
// transcript-derived signals. The Meetings feature (MeetingDetailDialog)
// is the only UI entry point that calls this; the Requirements feature
// only ever displays whatever lands in mockSignals as a result.
import { mockSignals } from "./mockSignals";
import { getRequirementsForProject } from "./mockRequirements";
import { determineReviewStatus } from "../lib/signalReview";

const TRANSCRIPT_TEMPLATE =
  "[00:00] The team reviewed progress since the last sync.\n" +
  "[00:03] Blockers and dependencies were discussed, with owners assigned to follow up.\n" +
  "[00:08] Next steps and timing for the following check-in were agreed.";

const SNIPPET_POOL = [
  {
    text: "We should revisit the rollout timeline once the pending items from this sprint are cleared.",
    classification: "Expectation",
  },
  {
    text: "There's a risk the current approach won't scale, flagging it for follow-up next sync.",
    classification: "Conflict",
  },
  {
    text: "The team confirmed current scope is on track and no changes are needed before the next review.",
    classification: "Completion",
  },
  {
    text: "We can't commit to the original deadline without additional QA capacity this sprint.",
    classification: "Constraint",
  },
];

function randomConfidence() {
  return Math.random() < 0.6 ? 78 + Math.floor(Math.random() * 18) : 45 + Math.floor(Math.random() * 20);
}

export function generateMeetingTranscript() {
  return TRANSCRIPT_TEMPLATE;
}

// Produces a couple of new signals derived from the meeting's transcript
// and appends them straight into the shared mockSignals store, so the
// Signal Feed picks them up the next time it fetches, the same way a real
// pipeline listening to a transcript source would surface them.
export function extractSignalsFromMeeting({ meeting, projectId }) {
  const picks = [...SNIPPET_POOL].sort(() => Math.random() - 0.5).slice(0, 2);
  const candidateRequirements = getRequirementsForProject(projectId);
  const now = new Date().toISOString();

  const generated = picks.map((snippet, i) => {
    const confidence = randomConfidence();
    const mapped =
      candidateRequirements.length > 0 && Math.random() < 0.4
        ? candidateRequirements[Math.floor(Math.random() * candidateRequirements.length)]
        : null;

    return {
      id: `sig-meeting-${meeting.id}-${Date.now()}-${i}`,
      projectId,
      source: "Teams",
      channel: `Meeting: ${meeting.title}`,
      author: "Meeting Transcript",
      timestamp: now,
      text: snippet.text,
      classification: snippet.classification,
      confidence,
      mappedRequirementId: mapped?.id ?? null,
      reviewStatus: determineReviewStatus({ confidence }),
    };
  });

  mockSignals.push(...generated);
  return generated;
}

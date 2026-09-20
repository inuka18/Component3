import { mockMeetings, getMeetingsForProject, getMeetingById } from "../data/mockMeetings";
import { generateMeetingTranscript } from "../data/mockMeetingTranscript";
import { delay } from "./simulatedLatency";

export async function fetchMeetings(projectId) {
  await delay(450);
  const scoped = projectId ? getMeetingsForProject(projectId) : mockMeetings;
  return [...scoped].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
}

// Used by Component 4 (Retrospective Intelligence) to generate a
// retrospective's transcript straight off the linked meeting record,
// the exact same generateMeetingTranscript() call MeetingDetailDialog
// uses, but persisted to the shared mockMeetings store (rather than
// MeetingsPage's local-state-only copy) so the transcript sticks around
// for NLP extraction/cross-validation to keep reading across navigation.
export async function generateTranscriptForMeeting(meetingId) {
  await delay(500);
  const meeting = getMeetingById(meetingId);
  if (!meeting) return null;
  meeting.transcript = generateMeetingTranscript();
  return meeting;
}

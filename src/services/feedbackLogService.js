import { appendFeedbackLogEntry, getFeedbackLogForProject } from "../data/mockFeedbackLog";
import { delay } from "./simulatedLatency";

export async function fetchFeedbackLog(projectId) {
  await delay(250);
  return getFeedbackLogForProject(projectId);
}

export async function sendFeedback({ projectId, scope, refId, refLabel, destinations, sentBy }) {
  await delay(400);
  return appendFeedbackLogEntry({ projectId, scope, refId, refLabel, destinations, sentBy });
}

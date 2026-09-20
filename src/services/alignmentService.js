import { getAlignmentHistoryForProject } from "../data/mockAlignmentHistory";
import { delay } from "./simulatedLatency";

export async function fetchAlignmentHistory(projectId) {
  await delay(400);
  return getAlignmentHistoryForProject(projectId);
}

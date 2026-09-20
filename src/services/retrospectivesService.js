import { mockRetrospectives, getRetrospectivesForProject } from "../data/mockRetrospectives";
import { delay } from "./simulatedLatency";

export async function fetchRetrospectives(projectId) {
  await delay(450);
  if (!projectId) return mockRetrospectives;
  return getRetrospectivesForProject(projectId);
}

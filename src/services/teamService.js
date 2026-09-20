import { mockTeam, getTeamForProject } from "../data/mockTeam";
import { delay } from "./simulatedLatency";

export async function fetchTeam(projectId) {
  await delay(450);
  if (!projectId) return mockTeam;
  return getTeamForProject(projectId);
}

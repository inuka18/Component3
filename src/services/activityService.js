import { mockActivity, getActivityForProject } from "../data/mockActivity";
import { delay } from "./simulatedLatency";

export async function fetchActivity(projectId) {
  await delay(350);
  if (!projectId) return mockActivity;
  return getActivityForProject(projectId);
}

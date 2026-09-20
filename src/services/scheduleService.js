import { mockTasks, getTasksForProject } from "../data/mockSchedule";
import { delay } from "./simulatedLatency";

export async function fetchTasks(projectId) {
  await delay(450);
  if (!projectId) return mockTasks;
  return getTasksForProject(projectId);
}

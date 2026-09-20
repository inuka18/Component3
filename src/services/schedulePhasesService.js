// Data-access layer for Component 3: Schedule's phase/Gantt data model.
// Deliberately a separate file from scheduleService.js (which still backs
// the flat task list mockDashboard/Team/Gap Detection read via
// mockSchedule.js). This one is phase-shaped and reused across every
// Schedule view (Day/Week/Sprint/Project Timeline), same separation as
// requirementsService.js vs gapDetectionService.js.
import { getPhasesForProject, getScheduleTaskById, TODAY } from "../data/mockSchedulePhases";
import { delay } from "./simulatedLatency";

export async function fetchSchedulePhases(projectId) {
  await delay(500);
  return getPhasesForProject(projectId);
}

export async function fetchScheduleTask(projectId, taskId) {
  await delay(250);
  return getScheduleTaskById(projectId, taskId);
}

export { TODAY };

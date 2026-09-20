// Data-access layer for the base-product Kanban Board
// (src/features/board/). Reads and writes the exact same task records
// Component 3's Gantt-based Schedule feature does (src/data/
// mockSchedulePhases.js), so a status change made on either one is
// visible on the other immediately. Deliberately its own service file,
// separate from src/services/schedulePhasesService.js, so the board never
// has to import anything from inside src/features/schedule/.
import { getPhasesForProject, addTaskToProject, TODAY } from "../data/mockSchedulePhases";
import { delay } from "./simulatedLatency";

// Flattens WITHOUT cloning task objects, unlike flattenTasks (src/lib/
// taskStatus.js) which spreads a phaseId/phaseName onto a *copy* for
// read-only chart display. The board needs the real references so a
// drag-and-drop status change or a logged time entry mutates the exact
// same object every other view reads.
export async function fetchBoardTasks(projectId) {
  await delay(400);
  return getPhasesForProject(projectId).flatMap((phase) => phase.tasks);
}

let boardTaskSeq = 0;

export async function createBoardTask(projectId, { title, description, assigneeId, storyPoints, status }) {
  await delay(300);
  boardTaskSeq += 1;
  const points = Number(storyPoints) || 0;
  const days = Math.max(2, Math.round(points * 1.5) || 3);
  const start = TODAY.toISOString();
  const end = new Date(TODAY.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
  const initialStatus = status || "not-started";
  const task = {
    id: `task-board-${Date.now()}-${boardTaskSeq}`,
    name: title,
    description: description || "",
    assigneeId: assigneeId || null,
    start,
    end,
    baselineStart: start,
    baselineEnd: end,
    storyPoints: points,
    progress: initialStatus === "done" ? 100 : initialStatus === "review" ? 80 : initialStatus === "in-progress" ? 20 : 0,
    status: initialStatus,
    critical: false,
    milestone: false,
    dependencies: [],
    requirementId: null,
    cause: null,
  };
  addTaskToProject(projectId, task);
  return task;
}

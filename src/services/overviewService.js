// Cross-project rollup for the Global Dashboard. Everything here is scoped
// twice over: first to the projects the caller can see (already filtered by
// ProjectContext), then, for a Team Member, down to just their own rows,
// their own meetings, and their own activity. A PM gets the unscoped view
// of that same already-project-filtered data.
import { getTasksForProject } from "../data/mockSchedule";
import { getMeetingsForProject } from "../data/mockMeetings";
import { getActivityForProject } from "../data/mockActivity";
import { getTeamForProject } from "../data/mockTeam";
import { delay } from "./simulatedLatency";

export async function fetchGlobalOverview({ projects, currentUser, isPM, extraTeamForProject }) {
  await delay(450);

  const sprints = projects.map((p) => {
    const tasks = getTasksForProject(p.id);
    const done = tasks.filter((t) => t.column === "done").length;
    return {
      project: p,
      sprintName: p.activeSprint?.name,
      sprintEnd: p.activeSprint?.endDate,
      progressPct: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
      done,
      total: tasks.length,
    };
  });

  const teamRowsByProject = projects.map((p) => ({
    project: p,
    rows: [...getTeamForProject(p.id), ...extraTeamForProject(p.id)],
  }));
  const allTeamRows = teamRowsByProject.flatMap((g) => g.rows);

  const capacity = isPM
    ? teamRowsByProject
    : teamRowsByProject
        .map((g) => ({ ...g, rows: g.rows.filter((r) => r.name === currentUser.name) }))
        .filter((g) => g.rows.length > 0);

  let meetings = projects.flatMap((p) =>
    getMeetingsForProject(p.id)
      .filter((m) => m.status === "upcoming")
      .map((m) => ({ ...m, projectName: p.name, projectColor: p.colorTag }))
  );
  if (!isPM) {
    meetings = meetings.filter((m) => {
      const myRow = allTeamRows.find((t) => t.projectId === m.projectId && t.name === currentUser.name);
      return myRow && m.attendeeIds.includes(myRow.id);
    });
  }
  meetings.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  let activity = projects.flatMap((p) =>
    getActivityForProject(p.id).map((a) => ({ ...a, projectName: p.name, projectColor: p.colorTag }))
  );
  if (!isPM) {
    activity = activity.filter((a) => a.actorName === currentUser.name);
  }
  activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return { sprints, capacity, meetings: meetings.slice(0, 6), activity };
}

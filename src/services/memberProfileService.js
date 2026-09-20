// A team member's "profile" spans every project they're staffed on, not
// just whichever project the Team page happens to be scoped to right now.
// this mirrors the same team-row-membership logic ProjectContext uses to
// decide which projects a persona can see, just applied to an arbitrary
// member instead of the logged-in user.
import { mockTeam } from "../data/mockTeam";
import { getActivityForProject } from "../data/mockActivity";
import { getActionsForOwner } from "../data/mockActions";
import { delay } from "./simulatedLatency";

export async function fetchMemberProfile({ member, allProjects, extraTeamForProject }) {
  await delay(300);
  if (!member) return { projects: [], activity: [], actionItems: [] };

  const allTeamRows = [...mockTeam, ...allProjects.flatMap((p) => extraTeamForProject(p.id))];
  const projects = allProjects.filter((p) =>
    allTeamRows.some((t) => t.projectId === p.id && t.name === member.name)
  );

  const activity = projects
    .flatMap((p) =>
      getActivityForProject(p.id)
        .filter((a) => a.actorName === member.name)
        .map((a) => ({ ...a, projectName: p.name, projectColor: p.colorTag }))
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  // ownerId is a per-project team-row id (the same person has a different
  // one on each project they're staffed on, see mockTeam.js), so this
  // has to look up that row per project rather than reusing `member.id`.
  const actionItems = projects.flatMap((p) => {
    const rowInProject = allTeamRows.find((t) => t.projectId === p.id && t.name === member.name);
    if (!rowInProject) return [];
    return getActionsForOwner(rowInProject.id).map((a) => ({ ...a, projectId: p.id }));
  });

  return { projects, activity, actionItems };
}

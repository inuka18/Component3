import { useMemo } from "react";
import { mockTeam } from "../data/mockTeam";
import { useProject } from "../context/ProjectContext";
import { useRole } from "../context/RoleContext";

// Resolves the current persona's own team row for a given project: the
// thing every "is this MY task / MY action item" role check needs, since
// team rows (not RoleContext personas) are the unit of project membership.
export function useCurrentMember(projectId) {
  const { currentUser } = useRole();
  const { extraTeamForProject } = useProject();

  return useMemo(() => {
    if (!currentUser || !projectId) return null;
    const rows = [...mockTeam, ...extraTeamForProject(projectId)];
    return rows.find((t) => t.projectId === projectId && t.name === currentUser.name) ?? null;
  }, [currentUser, projectId, extraTeamForProject]);
}

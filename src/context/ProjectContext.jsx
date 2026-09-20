import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { mockProjects as seedProjects } from "../data/mockProjects";
import { mockTeam } from "../data/mockTeam";
import { useRole } from "./RoleContext";

const PROJECT_COLORS = ["#6366f1", "#0ea5e9", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6"];
const ProjectContext = createContext(null);

function initialsFor(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProjectProvider({ children }) {
  const { currentUser } = useRole();
  // There is deliberately no "active project" state here. It's driven
  // entirely by the /projects/:projectId route (see ProjectScopedLayout +
  // useActiveProject), which keeps it always in sync with the URL with no
  // separate state to fall out of sync on first paint.
  const [allProjectsState, setAllProjectsState] = useState(seedProjects);
  // Team rows for projects created live in this session via "Create
  // Project", kept alongside (not merged into) the static mockTeam import
  // so the mock data module itself stays a pure fixture. See addProject().
  const [extraTeam, setExtraTeam] = useState([]);

  // A project is "visible" to the current persona if they have a team row
  // on it. This is what makes "team members only see projects they're
  // part of" true, and it applies uniformly to the PM persona too (Tharindu
  // Bandara has a PM row on every project, so he sees all of them without
  // any special-cased admin bypass).
  const projects = useMemo(() => {
    if (!currentUser) return [];
    const allTeamRows = [...mockTeam, ...extraTeam];
    return allProjectsState.filter((p) =>
      allTeamRows.some((t) => t.projectId === p.id && t.name === currentUser.name)
    );
  }, [currentUser, allProjectsState, extraTeam]);

  // PM-only "Create Project" flow. Adds the project, gives the current PM
  // persona a membership row on it (so it's immediately visible), and
  // parses the free-text invitee list into lightweight team rows.
  const addProject = useCallback(
    ({ name, description, startDate, inviteesRaw }) => {
      if (!currentUser) return null;
      const id = `proj-${slugify(name) || Date.now()}`;
      const color = PROJECT_COLORS[allProjectsState.length % PROJECT_COLORS.length];

      const newProject = {
        id,
        name,
        colorTag: color,
        shortDescription: description?.slice(0, 140) || "Newly created project.",
        description: description || "Newly created project.",
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        activeSprint: {
          name: "Sprint 1: Kickoff",
          number: 1,
          startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        health: "on-track",
      };

      const invitees = (inviteesRaw || "")
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const newTeamRows = [
        {
          id: `tm-new-${id}-pm`,
          projectId: id,
          name: currentUser.name,
          initials: currentUser.initials,
          email: currentUser.email,
          jobTitle: currentUser.title,
          appRole: "pm",
          workloadPercent: 40,
          assignedTasksCount: 0,
        },
        ...invitees.map((invitee, idx) => ({
          id: `tm-new-${id}-${idx}`,
          projectId: id,
          name: invitee,
          initials: initialsFor(invitee),
          email: invitee.includes("@") ? invitee : "",
          jobTitle: "Team Member",
          appRole: "member",
          workloadPercent: 0,
          assignedTasksCount: 0,
        })),
      ];

      setAllProjectsState((prev) => [...prev, newProject]);
      setExtraTeam((prev) => [...prev, ...newTeamRows]);
      return newProject;
    },
    [currentUser, allProjectsState.length]
  );

  const extraTeamForProject = useCallback(
    (projectId) => extraTeam.filter((t) => t.projectId === projectId),
    [extraTeam]
  );

  // Invites a person onto one or more projects at once: one team row per
  // selected project, sharing the same identity. Lives alongside addProject
  // in the same extraTeam store so every page that already reads
  // extraTeamForProject() (Team, member profiles, dashboards) picks the
  // invite up automatically, on whichever project it was added to.
  const inviteMember = useCallback(({ name, email, jobTitle, projectIds }) => {
    const initials = initialsFor(name);
    const newRows = (projectIds || []).map((projectId) => ({
      id: `tm-invite-${Date.now()}-${projectId}`,
      projectId,
      name,
      email,
      jobTitle: jobTitle || "Team Member",
      initials,
      appRole: "member",
      workloadPercent: 0,
      assignedTasksCount: 0,
    }));
    setExtraTeam((prev) => [...prev, ...newRows]);
  }, []);

  const removeExtraTeamMember = useCallback((id) => {
    setExtraTeam((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        allProjects: allProjectsState,
        addProject,
        extraTeamForProject,
        inviteMember,
        removeExtraTeamMember,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within a ProjectProvider");
  return ctx;
}

import { mockRequirements, STATUSES } from "../data/mockRequirements";
import { getTasksForProject } from "../data/mockSchedule";
import { getTeamForProject } from "../data/mockTeam";
import { getRetrospectivesForProject } from "../data/mockRetrospectives";
import { mockActions, getDisplayStatus } from "../data/mockActions";
import { SPRINT_LABELS } from "../data/mockCrossValidation";
import { delay } from "./simulatedLatency";

export async function fetchRequirementsStatusBreakdown(projectId) {
  await delay(400);
  const scoped = projectId
    ? mockRequirements.filter((r) => r.projectId === projectId)
    : mockRequirements;
  return STATUSES.map((status) => ({
    status,
    count: scoped.filter((r) => r.liveStatus === status).length,
  }));
}

export async function fetchDashboardSummary(projectId) {
  await delay(400);

  const requirements = projectId
    ? mockRequirements.filter((r) => r.projectId === projectId)
    : mockRequirements;
  const atRisk = requirements.filter((r) => r.liveStatus === "At Risk").length;

  const tasks = projectId ? getTasksForProject(projectId) : [];
  const done = tasks.filter((tk) => tk.column === "done").length;
  const inProgress = tasks.filter((tk) => tk.column === "in-progress").length;

  const team = projectId ? getTeamForProject(projectId) : [];
  const avgWorkload = team.length
    ? Math.round(team.reduce((sum, m) => sum + m.workloadPercent, 0) / team.length)
    : 0;

  const retros = projectId ? getRetrospectivesForProject(projectId) : [];
  const openActionItems = mockActions.filter(
    (a) => SPRINT_LABELS[a.sourceSprintId]?.projectId === projectId && getDisplayStatus(a) === "Open"
  ).length;

  return [
    {
      id: "requirements",
      title: "Requirements Engine",
      description:
        "NLP + blockchain pipeline that detects requirement changes from team communication and keeps a live, tamper-proof record.",
      metricLabel: `${requirements.length} requirements tracked`,
      subMetricLabel: `${atRisk} currently at risk`,
      to: `/projects/${projectId}/requirements/list`,
    },
    {
      id: "schedule",
      title: "Schedule",
      description:
        "Sprint kanban board tracking task progress and logged delay reasons, the seed data for adaptive schedule re-optimization.",
      metricLabel: `${done}/${tasks.length} tasks complete this sprint`,
      subMetricLabel: `${inProgress} in progress`,
      to: `/projects/${projectId}/schedule`,
    },
    {
      id: "team",
      title: "Team",
      description: "Roster, roles, and current workload for everyone staffed on this project.",
      metricLabel: `${team.length} team members`,
      subMetricLabel: `${avgWorkload}% avg capacity`,
      to: `/projects/${projectId}/team`,
    },
    {
      id: "retrospectives",
      title: "Retrospectives",
      description:
        "Sprint-boundary retrospectives, cross-validated against logged delay reasons and tracked through to verified evidence.",
      metricLabel: `${retros.length} retrospectives logged`,
      subMetricLabel: `${openActionItems} open action items`,
      to: `/projects/${projectId}/retro-intelligence/retrospectives`,
    },
  ];
}

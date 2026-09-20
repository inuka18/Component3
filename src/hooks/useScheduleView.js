import { useOutletContext } from "react-router-dom";

// Reads the active project and the Insights drawer's open/close from
// ScheduleLayout's own Outlet context: the nearest ancestor Outlet to
// every Schedule sub-page, same "no separate state, always in sync"
// pattern as useActiveProject(). Pages that don't care about Insights
// (Overview/Project Timeline) can keep using useActiveProject() directly;
// it reads the same `project` key. Calendar view is no longer part of
// this context; it's a full alternate view ScheduleLayout renders
// instead of the Outlet, not a per-page toggle.
export function useScheduleView() {
  const ctx = useOutletContext();
  return {
    activeProject: ctx?.project ?? null,
    activeProjectId: ctx?.project?.id ?? null,
    insightsOpen: ctx?.insightsOpen ?? false,
    openInsights: ctx?.openInsights ?? (() => {}),
    closeInsights: ctx?.closeInsights ?? (() => {}),
  };
}

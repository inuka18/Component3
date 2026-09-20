import { useOutletContext } from "react-router-dom";

// Reads the active project from the route tree via React Router's Outlet
// context, set once by ProjectScopedLayout from the :projectId URL param.
// This is synchronous and always in sync with the current route (no
// separate context state to keep in sync, so no first-render staleness).
export function useActiveProject() {
  const ctx = useOutletContext();
  return { activeProject: ctx?.project ?? null, activeProjectId: ctx?.project?.id ?? null };
}

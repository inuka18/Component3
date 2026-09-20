import { Link, Navigate, Outlet, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useProject } from "../../context/ProjectContext";

// Wraps every /projects/:projectId/* route. Resolves the active project
// straight from the URL param each render (no separate context state to
// keep in sync, that indirection is exactly what caused stale/empty data
// on first paint) and hands it down to nested routes via Outlet context,
// read with useActiveProject(). Unknown/invisible project ids redirect to
// the Projects list.
export function ProjectScopedLayout() {
  const { projectId } = useParams();
  const { projects } = useProject();
  const project = projects.find((p) => p.id === projectId) ?? null;

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-border bg-muted/30 px-4 py-2.5">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Projects
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: project.colorTag }} />
        <span className="text-sm font-semibold text-foreground">{project.name}</span>
      </div>

      <Outlet context={{ project }} />
    </div>
  );
}

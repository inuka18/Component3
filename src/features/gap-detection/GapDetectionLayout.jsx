import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Workflow, ListTree, GitBranch, ClipboardCheck } from "lucide-react";
import { cn } from "../../lib/utils";
import { useActiveProject } from "../../hooks/useActiveProject";

const SUB_NAV = [
  { to: "overview", label: "Overview", icon: LayoutDashboard },
  { to: "workspace", label: "Workspace", icon: Workflow },
  { to: "inventory", label: "Inventory", icon: ListTree },
  { to: "propagation", label: "Propagation", icon: GitBranch },
  { to: "assessment", label: "Assessment", icon: ClipboardCheck },
];

export function GapDetectionLayout() {
  const { activeProject } = useActiveProject();

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Gap Detection</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Compares approved requirements with execution reality, classifies requirement and resource
          gaps, and propagates their scheduling consequences
          {activeProject ? ` for ${activeProject.name}` : ""}.
        </p>

        <div className="mt-5 flex gap-1 overflow-x-auto border-b border-border scrollbar-thin">
          {SUB_NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Outlet context does not auto-forward through nested layouts, pass
          the active project along explicitly so overview/workspace/etc.
          pages can still read it via useActiveProject(). */}
      <Outlet context={{ project: activeProject }} />
    </div>
  );
}

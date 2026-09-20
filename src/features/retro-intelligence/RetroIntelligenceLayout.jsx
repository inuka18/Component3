import { NavLink, Outlet } from "react-router-dom";
import { History, LayoutDashboard, GitCompareArrows, ListChecks, FileCheck2, Repeat2, FileBarChart2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { useActiveProject } from "../../hooks/useActiveProject";

const SUB_NAV = [
  { to: "retrospectives", label: "Retrospectives", icon: History },
  { to: "overview", label: "Overview", icon: LayoutDashboard },
  { to: "cross-validation", label: "Cross-Validation", icon: GitCompareArrows },
  { to: "actions", label: "Actions", icon: ListChecks },
  { to: "evidence", label: "Evidence", icon: FileCheck2 },
  { to: "learning-loop", label: "Learning Loop", icon: Repeat2 },
  { to: "reports", label: "Reports", icon: FileBarChart2 },
];

export function RetroIntelligenceLayout() {
  const { activeProject } = useActiveProject();

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Retrospectives</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Sprint retrospectives, cross-validated against what teams logged and what the ledger recorded, with
          every resulting action tracked through to verified evidence
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
          the active project along explicitly, same as every other nested
          feature layout in this app. */}
      <Outlet context={{ project: activeProject }} />
    </div>
  );
}

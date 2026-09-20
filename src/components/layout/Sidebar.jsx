import { NavLink, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  FileStack,
  Radar,
  Columns3,
  Kanban,
  Users2,
  CalendarDays,
  History,
  Settings,
  SlidersHorizontal,
} from "lucide-react";
import { Logo } from "./Logo";
import { useProject } from "../../context/ProjectContext";
import { useRole, ROLES } from "../../context/RoleContext";
import { cn } from "../../lib/utils";

const GLOBAL_NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/projects", label: "Projects", icon: FolderKanban },
];

function navLinkClass({ isActive }) {
  return cn(
    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
    isActive
      ? "bg-sidebar-primary text-white shadow-sm"
      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
  );
}

export function Sidebar({ className, onNavigate }) {
  const { projectId } = useParams();
  const { projects } = useProject();
  const { role } = useRole();
  const project = projectId ? projects.find((p) => p.id === projectId) : null;

  const projectNav = project
    ? [
        { to: `/projects/${project.id}`, label: "Dashboard", icon: LayoutDashboard, end: true },
        { to: `/projects/${project.id}/requirements`, label: "Requirements", icon: FileStack },
        { to: `/projects/${project.id}/gap-detection`, label: "Gap Detection", icon: Radar },
        { to: `/projects/${project.id}/schedule`, label: "Schedule", icon: Columns3 },
        { to: `/projects/${project.id}/board`, label: "Board", icon: Kanban },
        { to: `/projects/${project.id}/team`, label: "Team", icon: Users2 },
        { to: `/projects/${project.id}/meetings`, label: "Meetings", icon: CalendarDays },
        { to: `/projects/${project.id}/retro-intelligence`, label: "Retrospectives", icon: History },
        ...(role === ROLES.PM
          ? [{ to: `/projects/${project.id}/settings`, label: "Project Settings", icon: SlidersHorizontal }]
          : []),
      ]
    : [];

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {GLOBAL_NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate} className={navLinkClass}>
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}

        {project && (
          <div className="mt-5 border-t border-sidebar-border pt-4">
            <div className="mb-2 flex items-center gap-2 px-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: project.colorTag }} />
              <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/50">
                {project.name}
              </span>
            </div>
            <div className="space-y-1">
              {projectNav.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} onClick={onNavigate} className={navLinkClass}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <NavLink to="/settings" onClick={onNavigate} className={navLinkClass}>
          <Settings className="h-4 w-4 shrink-0" />
          <span>Account Settings</span>
        </NavLink>
        <p className="mt-3 px-3 text-[11px] leading-snug text-sidebar-foreground/40">
          InSpiD-TECH Research Prototype
          <br />
          v0.3.0: UI demo build
        </p>
      </div>
    </aside>
  );
}

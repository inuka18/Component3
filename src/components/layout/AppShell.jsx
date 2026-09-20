import { useMemo, useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Sheet, SheetContent } from "../ui/sheet";
import { useTheme } from "../../context/ThemeContext";
import { useProject } from "../../context/ProjectContext";

// Global (non-project-scoped) routes are matched by exact/simple prefix.
// Anything under /projects/:projectId/... is matched by stripping the id
// segment and reading the remainder, since the id itself carries no title
// information; the project's name (from context) does.
const GLOBAL_TITLES = [
  { test: (p) => p === "/", title: "Dashboard" },
  { test: (p) => p === "/projects", title: "Projects" },
  { test: (p) => p === "/settings", title: "Account Settings" },
];

const PROJECT_SUB_TITLES = [
  { test: (r) => r === "" || r === "/", title: (name) => `${name} Dashboard` },
  { test: (r) => r.startsWith("/requirements/list"), title: (name) => `${name} · Requirements · Requirements List` },
  { test: (r) => r.startsWith("/requirements/network-map"), title: (name) => `${name} · Requirements · Network Map` },
  { test: (r) => r.startsWith("/requirements/ledger"), title: (name) => `${name} · Requirements · Traceability Ledger` },
  { test: (r) => r.startsWith("/requirements"), title: (name) => `${name} · Requirements` },
  { test: (r) => r.startsWith("/schedule"), title: (name) => `${name} · Schedule` },
  { test: (r) => r.startsWith("/team"), title: (name) => `${name} · Team` },
  { test: (r) => r.startsWith("/meetings"), title: (name) => `${name} · Meetings` },
  { test: (r) => r.startsWith("/retro-intelligence"), title: (name) => `${name} · Retrospectives` },
  { test: (r) => r.startsWith("/settings"), title: (name) => `${name} · Project Settings` },
];

function getTitle(pathname, projectName) {
  const global = GLOBAL_TITLES.find((r) => r.test(pathname));
  if (global) return global.title;

  const scoped = pathname.match(/^\/projects\/[^/]+(\/.*)?$/);
  if (scoped) {
    const rest = scoped[1] ?? "";
    const rule = PROJECT_SUB_TITLES.find((r) => r.test(rest));
    return rule ? rule.title(projectName ?? "Project") : projectName ?? "Project";
  }

  return "InSpiD-TECH";
}

export function AppShell() {
  const { theme, toggleTheme } = useTheme();
  const { projects } = useProject();
  const { projectId } = useParams();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const projectName = projectId ? projects.find((p) => p.id === projectId)?.name : undefined;
  const title = useMemo(
    () => getTitle(location.pathname, projectName),
    [location.pathname, projectName]
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar className="hidden lg:flex" />

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="right" className="w-72 p-0 sm:max-w-72 lg:hidden">
          <Sidebar className="flex w-full" onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={title}
          onMenuClick={() => setMobileNavOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto w-full max-w-[1600px] animate-fade-in px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

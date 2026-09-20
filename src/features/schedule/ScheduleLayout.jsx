import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, CalendarClock, CalendarDays, CalendarRange, Route, Calendar, Users2, Undo2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useRole, ROLES } from "../../context/RoleContext";
import { ResourcesDrawer } from "./components/ResourcesDrawer";
import { CalendarView } from "./components/CalendarView";
import { ScheduleHistoryProvider, useScheduleHistory } from "./context/ScheduleHistoryContext";

const SUB_NAV = [
  { to: "overview", label: "Overview", icon: LayoutDashboard },
  { to: "day", label: "Day", icon: CalendarClock },
  { to: "week", label: "Week", icon: CalendarDays },
  { to: "sprint", label: "Sprint", icon: CalendarRange },
  { to: "project-timeline", label: "Project", icon: Route },
];

export function ScheduleLayout() {
  return (
    <ScheduleHistoryProvider>
      <ScheduleLayoutInner />
    </ScheduleHistoryProvider>
  );
}

function ScheduleLayoutInner() {
  const { activeProject } = useActiveProject();
  const { role } = useRole();
  const isPM = role === ROLES.PM;
  const { pathname } = useLocation();
  const { undo, canUndo, lastLabel, refreshToken } = useScheduleHistory();
  const [calendarView, setCalendarView] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);

  // Docked drawers (Resources, Insights) are mutually exclusive, they'd
  // otherwise compete for the same right-edge space, and neither they
  // nor Calendar view should persist across a tab switch (switching tabs
  // is meant to show that tab's real content, same as leaving Calendar
  // view shows whichever tab is active underneath).
  useEffect(() => {
    setResourcesOpen(false);
    setInsightsOpen(false);
    setCalendarView(false);
  }, [pathname]);

  const openResources = () => {
    setInsightsOpen(false);
    setResourcesOpen(true);
  };
  const openInsights = () => {
    setResourcesOpen(false);
    setInsightsOpen(true);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Schedule</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Baseline vs. actual delivery across every planning level, with delay causes traced back to their
              source{activeProject ? ` for ${activeProject.name}` : ""}.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {isPM && (
              <Button variant="outline" size="sm" onClick={undo} disabled={!canUndo} title={lastLabel ? `Undo: ${lastLabel}` : undefined}>
                <Undo2 className="h-4 w-4" />
                Undo
              </Button>
            )}
            <Button
              variant={calendarView ? "default" : "outline"}
              size="sm"
              onClick={() => setCalendarView((v) => !v)}
            >
              <Calendar className="h-4 w-4" />
              Calendar
            </Button>
            <Button variant="outline" size="sm" onClick={openResources}>
              <Users2 className="h-4 w-4" />
              Resources
            </Button>
          </div>
        </div>

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

      <div className="flex min-h-0 flex-1 gap-0 lg:flex-row">
        <div className="min-w-0 flex-1">
          {calendarView ? (
            <CalendarView projectId={activeProject?.id} />
          ) : (
            // Outlet context does not auto-forward through nested layouts,
            // pass the active project and the Insights drawer's open/close
            // along explicitly so Day/Week/Sprint/Project Timeline pages
            // can read them via useScheduleView(). Insights' content is
            // page-specific (Week/Sprint each render their own), but its
            // open/close state lives here so it can stay mutually
            // exclusive with Resources. Keying on refreshToken forces a
            // fresh read of the underlying (possibly just-undone) data
            // even when Undo is pressed from a different tab than the one
            // that made the mutation.
            <Outlet
              key={refreshToken}
              context={{ project: activeProject, insightsOpen, openInsights, closeInsights: () => setInsightsOpen(false) }}
            />
          )}
        </div>

        <ResourcesDrawer open={resourcesOpen} onClose={() => setResourcesOpen(false)} project={activeProject} isPM={isPM} />
      </div>
    </div>
  );
}

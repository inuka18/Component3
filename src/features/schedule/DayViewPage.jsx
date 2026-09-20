import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarClock, ChevronLeft, ChevronRight, PlaneTakeoff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { BurndownChart } from "./components/BurndownChart";
import { ScheduleStatRow } from "./components/ScheduleStatRow";
import { VarianceDrillDownModal } from "./components/VarianceDrillDownModal";
import { useSchedulePhases } from "../../hooks/useSchedulePhases";
import { useResourceCapacity } from "../../hooks/useResourceCapacity";
import { useScheduleView } from "../../hooks/useScheduleView";
import { getTeamMemberById } from "../../data/mockTeam";
import {
  flattenTasks,
  isTaskActiveOn,
  overlapsRange,
  isAtRisk,
  statusBadgeVariant,
  statusLabel,
  causeStyle,
  TODAY,
  formatDayOfWeek,
  formatShortDate,
  addDays,
  isSameDay,
} from "./lib/scheduleUtils";
import { cn } from "../../lib/utils";

function initialsFor(name) {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase();
}

export function DayViewPage() {
  const { activeProject, activeProjectId } = useScheduleView();
  const { data: phases, loading } = useSchedulePhases(activeProjectId);
  const { data: capacity } = useResourceCapacity(activeProjectId);
  const [viewDate, setViewDate] = useState(TODAY);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Deep link support: the Variance Drill-Down modal's task cards (and
  // Activity Feed / Notifications) land here with ?date=<iso> to jump
  // straight to the day that task starts on.
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (!dateParam) return;
    const parsed = new Date(dateParam);
    if (!Number.isNaN(parsed.getTime())) setViewDate(parsed);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("date");
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const dayTasks = useMemo(
    () => flattenTasks(phases).filter((t) => isTaskActiveOn(t, viewDate)),
    [phases, viewDate]
  );
  const delayedTasks = dayTasks.filter(isAtRisk);
  const peopleCount = new Set(dayTasks.map((t) => t.assigneeId).filter(Boolean)).size;
  const offToday = isSameDay(viewDate, TODAY) ? capacity.filter((c) => c.offToday) : [];

  // The sprint's full task pool, for the burndown's trend-line context,
  // a single day doesn't have a burndown shape of its own, so this shows
  // the whole sprint's line with `viewDate` highlighted on it instead.
  const sprint = activeProject?.activeSprint;
  const sprintStart = sprint ? new Date(sprint.startDate) : null;
  const sprintEnd = sprint ? new Date(sprint.endDate) : null;
  const sprintTasks = useMemo(
    () => (sprintStart && sprintEnd ? flattenTasks(phases).filter((t) => overlapsRange(t, sprintStart, sprintEnd)) : []),
    [phases, sprintStart, sprintEnd]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">{formatDayOfWeek(viewDate)}</CardTitle>
            <CardDescription>
              {dayTasks.length} task{dayTasks.length === 1 ? "" : "s"} touching this day, {delayedTasks.length} needing
              action.
            </CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={() => setViewDate((d) => addDays(d, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={isSameDay(viewDate, TODAY) ? "default" : "outline"}
              size="sm"
              onClick={() => setViewDate(TODAY)}
            >
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => setViewDate((d) => addDays(d, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      <ScheduleStatRow tasks={dayTasks} delayedCount={delayedTasks.length} peopleCount={peopleCount} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sprint Burndown</CardTitle>
          <CardDescription>
            {sprint
              ? `${sprint.name}'s planned vs. actual remaining effort, with ${isSameDay(viewDate, TODAY) ? "today" : formatShortDate(viewDate)} marked on the trend.`
              : "This project has no active sprint to chart a burndown against."}
          </CardDescription>
        </CardHeader>
        {sprint && (
          <CardContent>
            <BurndownChart tasks={sprintTasks} rangeStart={sprintStart} rangeEnd={sprintEnd} highlightDate={viewDate} height={180} />
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tasks to Do {isSameDay(viewDate, TODAY) ? "Today" : `on ${formatShortDate(viewDate)}`}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {dayTasks.length === 0 ? (
            <EmptyState icon={CalendarClock} title="Nothing scheduled" description="No task's active window covers this day." />
          ) : (
            dayTasks.map((task) => {
              const assignee = getTeamMemberById(task.assigneeId);
              const cause = task.cause ? causeStyle(task.cause.type) : null;
              return (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <Avatar className="h-8 w-8 shrink-0 text-[10px]">
                    <AvatarFallback>{assignee ? initialsFor(assignee.name) : "?"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{task.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Badge variant={statusBadgeVariant(task)} className="text-[10px]">
                        {statusLabel(task)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {assignee?.name ?? "Unassigned"} · {task.progress}% complete
                      </span>
                      {cause && (
                        <span className={cn("flex items-center gap-1 text-[11px]", cause.textClass)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", cause.dotClass)} />
                          {cause.label}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Off {isSameDay(viewDate, TODAY) ? "Today" : "That Day"}</CardTitle>
          <CardDescription>Team members on PTO, from sprint capacity records.</CardDescription>
        </CardHeader>
        <CardContent>
          {offToday.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Everyone's available.</p>
          ) : (
            <ul className="space-y-2">
              {offToday.map((c) => (
                <li key={c.id} className="flex items-center gap-3 rounded-lg border border-dashed border-border p-3">
                  <Avatar className="h-8 w-8 shrink-0 text-[10px]">
                    <AvatarFallback>{initialsFor(c.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.role}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <PlaneTakeoff className="h-3.5 w-3.5" />
                    {c.returnDate ? `Back ${formatShortDate(c.returnDate)}` : "On PTO"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <VarianceDrillDownModal
        task={selectedTask}
        projectId={activeProjectId}
        open={Boolean(selectedTask)}
        onOpenChange={(o) => !o && setSelectedTask(null)}
      />
    </div>
  );
}

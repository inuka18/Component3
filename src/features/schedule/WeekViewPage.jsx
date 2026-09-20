import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { GanttChart } from "./components/GanttChart";
import { InsightsDrawer } from "./components/InsightsDrawer";
import { ScheduleStatRow } from "./components/ScheduleStatRow";
import { VarianceDrillDownModal } from "./components/VarianceDrillDownModal";
import { ResourceProfileModal } from "./components/ResourceProfileModal";
import { useSchedulePhases } from "../../hooks/useSchedulePhases";
import { useResourceCapacity } from "../../hooks/useResourceCapacity";
import { useScheduleView } from "../../hooks/useScheduleView";
import { useRole, ROLES } from "../../context/RoleContext";
import {
  flattenTasks,
  isAtRisk,
  isTaskActiveOn,
  overlapsRange,
  startOfWeek,
  addDays,
  endOfDay,
  TODAY,
  formatShortDate,
  formatDayOfWeek,
} from "./lib/scheduleUtils";
import { cn } from "../../lib/utils";

const baseWeekStart = startOfWeek(TODAY);

export function WeekViewPage() {
  const { activeProjectId, insightsOpen, openInsights, closeInsights } = useScheduleView();
  const { data: phases, loading } = useSchedulePhases(activeProjectId);
  const { data: capacity } = useResourceCapacity(activeProjectId);
  const { role } = useRole();
  const isPM = role === ROLES.PM;
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedCapacity, setSelectedCapacity] = useState(null);
  const [listDrill, setListDrill] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const weekStart = addDays(baseWeekStart, weekOffset * 7);
  const weekEnd = endOfDay(addDays(weekStart, 6));

  // Deep link support: Activity Feed / Notifications items pointing at a
  // task land here with ?task=<id> and open it automatically, same
  // pattern as every other feature in this app.
  useEffect(() => {
    const taskId = searchParams.get("task");
    if (!taskId || loading) return;
    const match = flattenTasks(phases).find((t) => t.id === taskId);
    if (match) setSelectedTask(match);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("task");
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loading, phases]);

  const weekTasks = useMemo(
    () => flattenTasks(phases).filter((t) => overlapsRange(t, weekStart, weekEnd)),
    [phases, weekStart, weekEnd]
  );
  const delayedTasks = weekTasks.filter(isAtRisk);
  const peopleCount = new Set(weekTasks.map((t) => t.assigneeId).filter(Boolean)).size;

  const handleSelectDay = (day) => {
    const dayTasks = weekTasks.filter((t) => isTaskActiveOn(t, day));
    setListDrill({
      title: `${formatDayOfWeek(day)}: Task Breakdown`,
      subtitle: `${dayTasks.length} task${dayTasks.length === 1 ? "" : "s"} touching this day`,
      tasks: dayTasks,
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* Top summary strip: header + nav, 4 quick stats, and ONE button
          into Insights. Never the chart or task list themselves: those
          live only in the docked drawer below, so they can never compete
          with the Gantt for the same vertical space. */}
      <div className="shrink-0 space-y-4">
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-base">
                Week of {formatShortDate(weekStart)} – {formatShortDate(weekEnd)}
              </CardTitle>
              <CardDescription>Baseline vs. actual for every task touching this week.</CardDescription>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button variant="outline" size="sm" onClick={() => setWeekOffset((o) => o - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setWeekOffset((o) => o + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        <ScheduleStatRow tasks={weekTasks} delayedCount={delayedTasks.length} peopleCount={peopleCount} />

        <Button variant="outline" onClick={openInsights} className="w-full sm:w-auto">
          <BarChart3 className="h-4 w-4" />
          📊 View variance chart &amp; day-by-day breakdown
        </Button>
      </div>

      <div className={cn("flex min-h-0 flex-1 flex-col gap-0 lg:flex-row", insightsOpen && "lg:gap-6")}>
        <div className="min-w-0 flex-1">
          {loading ? (
            <Skeleton className="h-full min-h-[24rem] w-full" />
          ) : (
            <GanttChart
              phases={phases}
              rangeStart={weekStart}
              rangeEnd={weekEnd}
              onSelectTask={setSelectedTask}
              onSelectResource={setSelectedCapacity}
              capacity={capacity}
              isPM={isPM}
            />
          )}
        </div>

        <InsightsDrawer
          open={insightsOpen}
          onClose={closeInsights}
          view="week"
          tasks={weekTasks}
          rangeStart={weekStart}
          rangeEnd={weekEnd}
          onSelectTask={setSelectedTask}
          onSelectDay={handleSelectDay}
        />
      </div>

      <VarianceDrillDownModal
        task={selectedTask}
        tasks={listDrill?.tasks}
        title={listDrill?.title}
        subtitle={listDrill?.subtitle}
        projectId={activeProjectId}
        open={Boolean(selectedTask || listDrill)}
        onOpenChange={(o) => {
          if (!o) {
            setSelectedTask(null);
            setListDrill(null);
          }
        }}
      />
      <ResourceProfileModal
        capacity={selectedCapacity}
        phases={phases}
        open={Boolean(selectedCapacity)}
        onOpenChange={(o) => !o && setSelectedCapacity(null)}
        onSelectTask={(task) => {
          setSelectedCapacity(null);
          setSelectedTask(task);
        }}
      />
    </div>
  );
}

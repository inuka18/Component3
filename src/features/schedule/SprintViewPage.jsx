import { useMemo, useState } from "react";
import { Target, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/common/EmptyState";
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
  daysBetween,
  addDays,
  formatShortDate,
  formatDayOfWeek,
} from "./lib/scheduleUtils";
import { cn } from "../../lib/utils";

export function SprintViewPage() {
  const { activeProject, activeProjectId, insightsOpen, openInsights, closeInsights } = useScheduleView();
  const { data: phases, loading } = useSchedulePhases(activeProjectId);
  const { data: capacity } = useResourceCapacity(activeProjectId);
  const { role } = useRole();
  const isPM = role === ROLES.PM;
  const [sprintOffset, setSprintOffset] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedCapacity, setSelectedCapacity] = useState(null);
  const [listDrill, setListDrill] = useState(null);

  const sprint = activeProject?.activeSprint;
  const sprintLengthDays = sprint ? daysBetween(sprint.startDate, sprint.endDate) : 0;
  const sprintStart = sprint ? addDays(new Date(sprint.startDate), sprintOffset * sprintLengthDays) : null;
  const sprintEnd = sprint ? addDays(new Date(sprint.endDate), sprintOffset * sprintLengthDays) : null;
  const sprintNumber = sprint ? sprint.number + sprintOffset : null;
  const sprintLabel = sprint ? (sprintOffset === 0 ? sprint.name : `Sprint ${sprintNumber}`) : "";

  const sprintTasks = useMemo(() => {
    if (!sprintStart || !sprintEnd) return [];
    return flattenTasks(phases).filter((t) => overlapsRange(t, sprintStart, sprintEnd));
  }, [phases, sprintStart, sprintEnd]);
  const delayedTasks = sprintTasks.filter(isAtRisk);
  const peopleCount = new Set(sprintTasks.map((t) => t.assigneeId).filter(Boolean)).size;

  const handleSelectDay = (day) => {
    const dayTasks = sprintTasks.filter((t) => isTaskActiveOn(t, day));
    setListDrill({
      title: `${formatDayOfWeek(day)}: Task Breakdown`,
      subtitle: `${dayTasks.length} task${dayTasks.length === 1 ? "" : "s"} touching this day`,
      tasks: dayTasks,
    });
  };

  if (!sprint) {
    return <EmptyState icon={Target} title="No active sprint" description="This project doesn't have an active sprint configured." />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* Top summary strip: header + nav, 4 quick stats, and ONE button
          into Insights. Never the chart or backlog list themselves: those
          live only in the docked drawer below, so they can never compete
          with the Gantt for the same vertical space. */}
      <div className="shrink-0 space-y-4">
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-base">{sprintLabel}</CardTitle>
              <CardDescription>
                {formatShortDate(sprintStart)} – {formatShortDate(sprintEnd)}
              </CardDescription>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button variant="outline" size="sm" onClick={() => setSprintOffset((o) => o - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSprintOffset((o) => o + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        <ScheduleStatRow tasks={sprintTasks} delayedCount={delayedTasks.length} peopleCount={peopleCount} />

        <Button variant="outline" onClick={openInsights} className="w-full sm:w-auto">
          <BarChart3 className="h-4 w-4" />
          📊 View variance chart &amp; sprint backlog
        </Button>
      </div>

      <div className={cn("flex min-h-0 flex-1 flex-col gap-0 lg:flex-row", insightsOpen && "lg:gap-6")}>
        <div className="min-w-0 flex-1">
          {loading ? (
            <Skeleton className="h-full min-h-[24rem] w-full" />
          ) : (
            <GanttChart
              phases={phases}
              rangeStart={sprintStart}
              rangeEnd={sprintEnd}
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
          view="sprint"
          tasks={sprintTasks}
          rangeStart={sprintStart}
          rangeEnd={sprintEnd}
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

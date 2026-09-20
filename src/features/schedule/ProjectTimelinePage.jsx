import { useMemo, useState } from "react";
import { Route, ZoomIn, ZoomOut } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { GanttChart } from "./components/GanttChart";
import { VarianceDrillDownModal } from "./components/VarianceDrillDownModal";
import { ResourceProfileModal } from "./components/ResourceProfileModal";
import { useSchedulePhases } from "../../hooks/useSchedulePhases";
import { useResourceCapacity } from "../../hooks/useResourceCapacity";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useRole, ROLES } from "../../context/RoleContext";
import { formatShortDate } from "./lib/scheduleUtils";

const MIN_PX_PER_DAY = 4;
const MAX_PX_PER_DAY = 48;
const ZOOM_STEP = 4;

export function ProjectTimelinePage() {
  const { activeProjectId } = useActiveProject();
  const { data: phases, loading } = useSchedulePhases(activeProjectId);
  const { data: capacity } = useResourceCapacity(activeProjectId);
  const { role } = useRole();
  const isPM = role === ROLES.PM;
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedCapacity, setSelectedCapacity] = useState(null);
  const [pxPerDay, setPxPerDay] = useState(10);

  const { rangeStart, rangeEnd } = useMemo(() => {
    if (phases.length === 0) return { rangeStart: null, rangeEnd: null };
    const starts = phases.map((p) => new Date(p.start));
    const ends = phases.map((p) => new Date(p.end));
    return {
      rangeStart: new Date(Math.min(...starts)),
      rangeEnd: new Date(Math.max(...ends)),
    };
  }, [phases]);

  if (!loading && phases.length === 0) {
    return <EmptyState icon={Route} title="No project timeline yet" description="No phases have been scheduled for this project." />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">Full Project Timeline</CardTitle>
            <CardDescription>
              {rangeStart && rangeEnd
                ? `${formatShortDate(rangeStart)} – ${formatShortDate(rangeEnd)} across all four phases.`
                : "Every phase and task from kickoff to launch."}
            </CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPxPerDay((v) => Math.max(MIN_PX_PER_DAY, v - ZOOM_STEP))}
              disabled={pxPerDay <= MIN_PX_PER_DAY}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPxPerDay((v) => Math.min(MAX_PX_PER_DAY, v + ZOOM_STEP))}
              disabled={pxPerDay >= MAX_PX_PER_DAY}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading || !rangeStart ? (
            <Skeleton className="h-[28rem] w-full" />
          ) : (
            <GanttChart
              phases={phases}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              onSelectTask={setSelectedTask}
              onSelectResource={setSelectedCapacity}
              capacity={capacity}
              pxPerDay={pxPerDay}
              isPM={isPM}
            />
          )}
        </CardContent>
      </Card>

      <VarianceDrillDownModal
        task={selectedTask}
        projectId={activeProjectId}
        open={Boolean(selectedTask)}
        onOpenChange={(o) => !o && setSelectedTask(null)}
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

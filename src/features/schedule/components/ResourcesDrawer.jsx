import { useState } from "react";
import { Users2, X, PlaneTakeoff, UserPlus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Skeleton } from "../../../components/ui/skeleton";
import { ResourceProfileModal } from "./ResourceProfileModal";
import { VarianceDrillDownModal } from "./VarianceDrillDownModal";
import { InviteMemberDialog } from "../../team/components/InviteMemberDialog";
import { useResourceCapacity } from "../../../hooks/useResourceCapacity";
import { useSchedulePhases } from "../../../hooks/useSchedulePhases";
import { useTeam } from "../../../hooks/useTeam";
import { useProject } from "../../../context/ProjectContext";
import { TODAY } from "../lib/scheduleUtils";
import { cn } from "../../../lib/utils";

const CAPACITY_VARIANT = {
  "Over-allocated": "danger",
  "Near Capacity": "warning",
  Balanced: "success",
  "Under-utilized": "info",
};
const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const TODAY_DOW = TODAY.getDay();

function initialsFor(name) {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase();
}

// The docked side drawer for team resources: same mechanism as
// InsightsDrawer (a flex sibling of the main content area, closed by
// default at width:0, sliding open via a CSS width transition; never an
// overlay), but hosted at ScheduleLayout since it applies across every
// sub-tab, not just Week/Sprint. Mutual exclusion with InsightsDrawer is
// enforced by the shared open/close state ScheduleLayout owns.
export function ResourcesDrawer({ open, onClose, project, isPM }) {
  const { data: capacity, loading } = useResourceCapacity(project?.id);
  const { data: phases } = useSchedulePhases(project?.id);
  const { data: fullTeam } = useTeam();
  const { allProjects, inviteMember } = useProject();
  const [selectedCapacity, setSelectedCapacity] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [, bump] = useState(0);

  const handleSimulateAbsence = (c) => {
    c.offToday = !c.offToday;
    bump((n) => n + 1);
  };

  const handleInvite = ({ name, email, jobTitle, projectIds }) => {
    inviteMember({ name, email, jobTitle, projectIds });
  };

  const projectChipsFor = (name) => {
    const projectIds = new Set(fullTeam.filter((t) => t.name === name).map((t) => t.projectId));
    return allProjects.filter((p) => projectIds.has(p.id));
  };

  return (
    <div className={cn("shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out", open ? "w-full lg:w-[420px]" : "w-0")}>
      <div className="flex h-full min-w-[320px] flex-col gap-4 rounded-xl border border-border bg-card p-4 lg:ml-6 lg:min-w-[420px]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users2 className="h-4 w-4 text-primary" />
            Team Resources
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="-mt-2 text-xs text-muted-foreground">Sprint capacity for everyone staffed on {project?.name ?? "this project"}.</p>

        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto scrollbar-thin">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
          ) : capacity.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No capacity data for this project.</p>
          ) : (
            capacity.map((c) => {
              const ratioPct = Math.round((c.plannedHours / c.availableHours) * 100);
              const chips = projectChipsFor(c.name);
              return (
                <div key={c.id} className="rounded-xl border border-border p-3">
                  <button
                    onClick={() => setSelectedCapacity(c)}
                    className="flex w-full items-start gap-3 text-left"
                  >
                    <Avatar className="h-9 w-9 shrink-0 text-xs">
                      <AvatarFallback>{initialsFor(c.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                        <Badge variant={CAPACITY_VARIANT[c.status] ?? "outline"} className="shrink-0 text-[10px]">
                          {c.status}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{c.role}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {chips.map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground"
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.colorTag }} />
                            {p.name}
                          </span>
                        ))}
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            ratioPct > 100 ? "bg-status-dropped-fg" : ratioPct >= 85 ? "bg-status-atrisk-fg" : "bg-status-confirmed-fg"
                          )}
                          style={{ width: `${Math.min(ratioPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </button>

                  <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-border pt-2.5">
                    <div className="flex gap-1">
                      {WEEKDAY_LABELS.map((label, i) => {
                        const isWeekend = i === 0 || i === 6;
                        const isPtoToday = c.offToday && i === TODAY_DOW;
                        return (
                          <span
                            key={i}
                            title={isPtoToday ? "PTO today" : isWeekend ? "Weekend" : "Working"}
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded text-[9px] font-semibold",
                              isPtoToday
                                ? "bg-status-atrisk-bg text-status-atrisk-fg"
                                : isWeekend
                                  ? "bg-muted text-muted-foreground/50"
                                  : "bg-status-confirmed-bg text-status-confirmed-fg"
                            )}
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>
                    {isPM && (
                      <Button
                        variant={c.offToday ? "default" : "outline"}
                        size="sm"
                        className="h-7 shrink-0 px-2 text-[11px]"
                        onClick={() => handleSimulateAbsence(c)}
                      >
                        <PlaneTakeoff className="h-3 w-3" />
                        {c.offToday ? "Mark back" : "Simulate absence"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {isPM && (
          <InviteMemberDialog
            projects={allProjects}
            defaultProjectId={project?.id}
            onInvite={handleInvite}
            trigger={
              <Button variant="outline" className="w-full">
                <UserPlus className="h-4 w-4" />
                + Add Resource
              </Button>
            }
          />
        )}
      </div>

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
      <VarianceDrillDownModal
        task={selectedTask}
        projectId={project?.id}
        open={Boolean(selectedTask)}
        onOpenChange={(o) => !o && setSelectedTask(null)}
      />
    </div>
  );
}

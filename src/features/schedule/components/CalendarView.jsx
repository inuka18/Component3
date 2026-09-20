import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { VarianceDrillDownModal } from "./VarianceDrillDownModal";
import { useSchedulePhases } from "../../../hooks/useSchedulePhases";
import { flattenTasks, statusBarClass, startOfMonth, startOfWeek, addDays, isSameDay, TODAY } from "../lib/scheduleUtils";
import { cn } from "../../../lib/utils";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// A full alternate view for the whole Schedule feature, toggled from
// ScheduleLayout's "📅 Calendar view" button, which swaps the entire
// content area (in place of whichever Day/Week/Sprint/Project tab was
// showing) for this month grid, the same way switching tabs would. It
// owns its own month, data fetch, and drill-down modal rather than
// inheriting them from a parent page, since it no longer has one.
export function CalendarView({ projectId }) {
  const { data: phases, loading } = useSchedulePhases(projectId);
  const [monthAnchor, setMonthAnchor] = useState(TODAY);
  const [selectedTask, setSelectedTask] = useState(null);

  const tasks = useMemo(() => flattenTasks(phases), [phases]);

  const gridStart = startOfWeek(startOfMonth(monthAnchor));
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const anchorMonth = monthAnchor.getMonth();
  const monthLabel = monthAnchor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const tasksForDay = (day) =>
    tasks.filter((t) => {
      const start = new Date(t.start);
      const end = new Date(t.end);
      return (
        day >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
        day <= new Date(end.getFullYear(), end.getMonth(), end.getDate())
      );
    });

  const shiftMonth = (delta) => {
    setMonthAnchor((d) => {
      const next = new Date(d);
      next.setMonth(next.getMonth() + delta);
      return next;
    });
  };

  if (loading) {
    return <Skeleton className="h-[36rem] w-full rounded-xl" />;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">{monthLabel}</h3>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => shiftMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={isSameDay(monthAnchor, TODAY) ? "default" : "outline"}
            size="sm"
            onClick={() => setMonthAnchor(TODAY)}
          >
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => shiftMonth(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d} className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayTasks = tasksForDay(day);
            const inMonth = day.getMonth() === anchorMonth;
            const today = isSameDay(day, TODAY);
            const visible = dayTasks.slice(0, 3);
            const overflow = dayTasks.length - visible.length;
            return (
              <div
                key={idx}
                className={cn(
                  "min-h-[6.5rem] border-b border-r border-border p-1.5",
                  !inMonth && "bg-muted/20",
                  idx % 7 === 6 && "border-r-0"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium",
                    today ? "bg-primary text-primary-foreground" : inMonth ? "text-foreground" : "text-muted-foreground/50"
                  )}
                >
                  {day.getDate()}
                </span>
                <div className="mt-1 space-y-1">
                  {visible.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={cn(
                        "flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[10px] font-medium text-white",
                        statusBarClass(task)
                      )}
                      title={task.name}
                    >
                      {task.milestone && <span className="h-1 w-1 shrink-0 rounded-full bg-white" />}
                      <span className="truncate">{task.name}</span>
                    </button>
                  ))}
                  {overflow > 0 && <p className="px-1 text-[10px] text-muted-foreground">+{overflow} more</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <VarianceDrillDownModal
        task={selectedTask}
        projectId={projectId}
        open={Boolean(selectedTask)}
        onOpenChange={(o) => !o && setSelectedTask(null)}
      />
    </div>
  );
}

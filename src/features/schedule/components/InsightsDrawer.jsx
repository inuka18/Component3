import { BarChart3, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { BurndownChart } from "./BurndownChart";
import { getTeamMemberById } from "../../../data/mockTeam";
import {
  isTaskActiveOn,
  varianceDays,
  isLate,
  statusBadgeVariant,
  statusLabel,
  formatShortDate,
  formatDayOfWeek,
  addDays,
} from "../lib/scheduleUtils";
import { cn } from "../../../lib/utils";

function initialsFor(name) {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase();
}

// The docked side drawer for Week/Sprint views. A flex sibling of the
// Gantt panel (never an overlay, never stacked above/below it), closed
// by default at width:0, sliding open to a fixed ~420px via a CSS width
// transition. Because it's a flex sibling, the Gantt automatically
// shrinks to fill the remaining width the moment this opens; both stay
// visible and usable side by side, so overlap is structurally impossible.
export function InsightsDrawer({ open, onClose, view, tasks, rangeStart, rangeEnd, onSelectTask, onSelectDay, className }) {
  const days =
    view === "week"
      ? Array.from({ length: 7 }, (_, i) => {
          const date = addDays(rangeStart, i);
          return { date, tasks: tasks.filter((t) => isTaskActiveOn(t, date)) };
        })
      : [];

  return (
    <div className={cn("shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out", open ? "w-full lg:w-[420px]" : "w-0", className)}>
      <div className="flex h-full min-w-[320px] flex-col gap-5 rounded-xl border border-border bg-card p-4 lg:min-w-[420px]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BarChart3 className="h-4 w-4 text-primary" />
            Variance &amp; {view === "week" ? "Day-by-Day Breakdown" : "Sprint Backlog"}
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Burndown</p>
          <BurndownChart tasks={tasks} rangeStart={rangeStart} rangeEnd={rangeEnd} onSelectDay={onSelectDay} height={200} />
        </div>

        {view === "week" ? (
          <div className="min-h-0 flex-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Day by Day</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
              {days.map(({ date, tasks: dayTasks }) => (
                <div key={date.toISOString()} className="w-40 shrink-0 rounded-lg border border-border p-2.5">
                  <p className="text-xs font-semibold text-foreground">{formatDayOfWeek(date).split(",")[0]}</p>
                  <p className="text-[10px] text-muted-foreground">{formatShortDate(date)}</p>
                  <div className="mt-2 space-y-1.5">
                    {dayTasks.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground/70">Nothing scheduled</p>
                    ) : (
                      dayTasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => onSelectTask?.(task)}
                          className="block w-full truncate rounded-md border border-border/70 px-1.5 py-1 text-left text-[10px] font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                          title={task.name}
                        >
                          {task.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sprint Backlog</p>
            {tasks.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No tasks in this sprint.</p>
            ) : (
              <ul className="space-y-2">
                {tasks.map((task) => {
                  const assignee = getTeamMemberById(task.assigneeId);
                  const v = varianceDays(task);
                  const late = isLate(task);
                  return (
                    <li key={task.id}>
                      <button
                        onClick={() => onSelectTask?.(task)}
                        className="flex w-full items-start gap-2 rounded-lg border border-border p-2.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                      >
                        <Avatar className="h-6 w-6 shrink-0 text-[9px]">
                          <AvatarFallback>{assignee ? initialsFor(assignee.name) : "?"}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-foreground">{task.name}</p>
                          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                            {assignee?.name ?? "Unassigned"} · {formatShortDate(task.start)} – {formatShortDate(task.end)}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-1">
                            <Badge variant={statusBadgeVariant(task)} className="text-[9px]">
                              {statusLabel(task)}
                            </Badge>
                            {v !== 0 && (
                              <span className={cn("text-[10px] font-medium", late ? "text-status-dropped-fg" : "text-status-confirmed-fg")}>
                                {v > 0 ? `+${v}d` : `${v}d`}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { TaskBar } from "./TaskBar";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "../../../components/ui/dropdown-menu";
import { getTeamMemberById } from "../../../data/mockTeam";
import { TASK_STATUSES } from "../../../data/mockSchedulePhases";
import { TODAY, statusBarClass, statusLabel, formatShortDate, addDays, startOfWeek, startOfMonth, daysBetween, rescheduleTaskByDays, setTaskStatus } from "../lib/scheduleUtils";
import { useScheduleHistory } from "../context/ScheduleHistoryContext";
import { cn } from "../../../lib/utils";

const HEADER_H = 36;
const PHASE_HEADER_H = 28;
const ROW_H = 36;

const STATUS_DOT = {
  "not-started": "bg-muted-foreground/40",
  "in-progress": "bg-primary",
  review: "bg-status-modified-fg",
  done: "bg-status-confirmed-fg",
};
const STATUS_TEXT = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
};

function initialsFor(name) {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase();
}

function buildDayWeekTicks(rangeStart, rangeEnd, scale) {
  const totalDays = daysBetween(rangeStart, rangeEnd);
  const ticks = [];
  if (totalDays <= 31) {
    let cur = new Date(rangeStart);
    while (cur <= rangeEnd) {
      ticks.push({ key: cur.toISOString(), pos: scale(cur), label: formatShortDate(cur) });
      cur = addDays(cur, 1);
    }
  } else {
    let cur = startOfWeek(rangeStart);
    while (cur <= rangeEnd) {
      ticks.push({ key: cur.toISOString(), pos: scale(cur), label: formatShortDate(cur) });
      cur = addDays(cur, 7);
    }
  }
  return ticks;
}

function buildMonthTicks(rangeStart, rangeEnd, scale) {
  const ticks = [];
  let cur = startOfMonth(rangeStart);
  while (cur <= rangeEnd) {
    if (cur >= rangeStart) {
      ticks.push({
        key: cur.toISOString(),
        pos: scale(cur),
        label: cur.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
      });
    }
    const next = new Date(cur);
    next.setMonth(next.getMonth() + 1);
    cur = next;
  }
  if (ticks.length === 0) {
    ticks.push({ key: "start", pos: scale(rangeStart), label: rangeStart.toLocaleDateString(undefined, { month: "short", year: "numeric" }) });
  }
  return ticks;
}

// Status dot in the left column: a plain indicator for Team Member, a
// dropdown trigger to change the task's status for PM. Deliberately
// separate from the bar's own color (statusBarClass), which additionally
// factors in critical/lateness, this dropdown only edits the three raw
// TASK_STATUSES values.
function StatusDot({ task, isPM, onChangeStatus }) {
  const dot = <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", STATUS_DOT[task.status] ?? statusBarClass(task))} title={statusLabel(task)} />;
  if (!isPM) return dot;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 rounded-full p-0.5 transition-colors hover:bg-accent"
          title="Change status"
        >
          {dot}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Set status</DropdownMenuLabel>
        {TASK_STATUSES.map((s) => (
          <DropdownMenuItem key={s} onClick={() => onChangeStatus(task, s)}>
            <span className={cn("h-2 w-2 rounded-full", STATUS_DOT[s])} />
            {STATUS_TEXT[s]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Shared Gantt rendering used by Week/Sprint/Project Timeline: a fixed
// left label column plus a scrollable right timeline column so long
// project-spanning charts don't push task names off-screen. A single
// "Today" line and one dependency-arrow SVG overlay are each drawn once
// spanning the full height of the timeline, rather than per-row.
//
// `pxPerDay`, when provided (Project Timeline's zoom controls), switches
// the timeline from percentage-of-container scaling to a fixed pixel-
// per-day scale with an explicit total width, producing a horizontally
// scrollable, genuinely zoomable chart with month header ticks. Without
// it (Week/Sprint), the timeline fills the available width with day/week
// ticks, exactly as before.
export function GanttChart({ phases, rangeStart, rangeEnd, onSelectTask, onSelectResource, capacity, pxPerDay, isPM = true }) {
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [renderTick, bump] = useState(0);
  const containerRef = useRef(null);
  const forceRender = () => bump((n) => n + 1);
  const { pushHistory } = useScheduleHistory();

  const totalDays = daysBetween(rangeStart, rangeEnd);
  const usesPx = Boolean(pxPerDay);
  const coordWidth = usesPx ? Math.max(totalDays, 1) * pxPerDay : 100;

  const scale = (date) => {
    const days = daysBetween(rangeStart, date);
    return usesPx ? days * pxPerDay : (days / Math.max(totalDays, 1)) * 100;
  };

  const ticks = usesPx ? buildMonthTicks(rangeStart, rangeEnd, scale) : buildDayWeekTicks(rangeStart, rangeEnd, scale);
  const todayInRange = TODAY >= rangeStart && TODAY <= rangeEnd;
  const todayPos = todayInRange ? scale(TODAY) : null;

  const visiblePhases = phases
    .map((phase) => ({
      ...phase,
      tasks: phase.tasks.filter((t) => new Date(t.end) >= rangeStart && new Date(t.start) <= rangeEnd),
    }))
    .filter((phase) => phase.tasks.length > 0);

  // Row layout bookkeeping, used both to draw dependency connector lines
  // and to know the chart's total content height. Collapsed phases simply
  // never add rows here, so their tasks have no connector endpoints.
  const { rowMeta, timelineHeight } = useMemo(() => {
    let y = HEADER_H;
    const meta = new Map();
    visiblePhases.forEach((phase) => {
      y += PHASE_HEADER_H;
      if (!collapsed.has(phase.id)) {
        phase.tasks.forEach((task) => {
          meta.set(task.id, { y: y + ROW_H / 2, x1: scale(task.start), x2: scale(task.end) });
          y += ROW_H;
        });
      }
    });
    return { rowMeta: meta, timelineHeight: y };
    // renderTick is a deliberate extra dependency: it's bumped after every
    // drag-reschedule so dependency-line endpoints (which read task.start/
    // task.end) recompute even though `phases`'s own array/object
    // references never change (see rescheduleTaskByDays, it mutates the
    // shared task objects in place rather than replacing them).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phases, rangeStart, rangeEnd, collapsed, pxPerDay, renderTick]);

  const dependencyLines = [];
  rowMeta.forEach((toPos, taskId) => {
    const task = visiblePhases.flatMap((p) => p.tasks).find((t) => t.id === taskId);
    task?.dependencies?.forEach((depId) => {
      const fromPos = rowMeta.get(depId);
      if (fromPos) dependencyLines.push({ key: `${depId}->${taskId}`, x1: fromPos.x2, y1: fromPos.y, x2: toPos.x1, y2: toPos.y });
    });
  });

  const toggleCollapsed = (phaseId) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  const handleReschedule = (task, deltaDays) => {
    const prevStart = task.start;
    const prevEnd = task.end;
    pushHistory(`Rescheduled "${task.name}" by ${deltaDays > 0 ? "+" : ""}${deltaDays}d`, () => {
      task.start = prevStart;
      task.end = prevEnd;
    });
    rescheduleTaskByDays(task, deltaDays);
    forceRender();
  };
  const handleChangeStatus = (task, status) => {
    setTaskStatus(task, status);
    forceRender();
  };

  if (visiblePhases.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        No tasks fall within this window.
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden rounded-xl border border-border text-xs">
      <div className="w-64 shrink-0 border-r border-border bg-card">
        <div className="h-9 border-b border-border" />
        {visiblePhases.map((phase) => {
          const isCollapsed = collapsed.has(phase.id);
          return (
            <div key={phase.id}>
              <button
                type="button"
                onClick={() => toggleCollapsed(phase.id)}
                className="flex h-7 w-full items-center gap-1 border-t border-border bg-muted/30 px-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-muted/50"
              >
                {isCollapsed ? <ChevronRight className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />}
                <span className="truncate">{phase.name}</span>
                <span className="ml-auto shrink-0 normal-case tracking-normal text-muted-foreground/70">{phase.tasks.length}</span>
              </button>
              {!isCollapsed &&
                phase.tasks.map((task) => {
                  const assignee = getTeamMemberById(task.assigneeId);
                  const resourceRecord = capacity?.find((c) => c.memberId === task.assigneeId);
                  return (
                    <div key={task.id} className="flex h-9 items-center gap-1.5 border-t border-border/50 px-2">
                      <StatusDot task={task} isPM={isPM} onChangeStatus={handleChangeStatus} />
                      {resourceRecord && onSelectResource ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectResource(resourceRecord);
                          }}
                          className="shrink-0 rounded-full transition-transform hover:scale-110"
                          title={`View ${assignee?.name ?? "assignee"}`}
                        >
                          <Avatar className="h-5 w-5 text-[8px]">
                            <AvatarFallback>{assignee ? initialsFor(assignee.name) : "?"}</AvatarFallback>
                          </Avatar>
                        </button>
                      ) : (
                        <Avatar className="h-5 w-5 shrink-0 text-[8px]">
                          <AvatarFallback>{assignee ? initialsFor(assignee.name) : "?"}</AvatarFallback>
                        </Avatar>
                      )}
                      <span className="truncate text-foreground" title={task.name}>
                        {task.name}
                      </span>
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>

      <div className="relative flex-1 overflow-x-auto bg-card scrollbar-thin">
        <div className="relative" ref={containerRef} style={usesPx ? { width: coordWidth } : undefined}>
          <div className="relative h-9 border-b border-border">
            {ticks.map((tick) => (
              <span
                key={tick.key}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-muted-foreground"
                style={{ left: `${tick.pos}${usesPx ? "px" : "%"}` }}
              >
                {tick.label}
              </span>
            ))}
          </div>

          {todayPos != null && (
            <div
              className="pointer-events-none absolute bottom-0 top-9 z-10 w-px bg-primary/70"
              style={{ left: `${todayPos}${usesPx ? "px" : "%"}` }}
            >
              <span className="absolute -top-6 -translate-x-1/2 whitespace-nowrap rounded bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-primary-foreground">
                Today
              </span>
            </div>
          )}

          {dependencyLines.length > 0 && (
            <svg
              className="pointer-events-none absolute left-0 top-0 h-full w-full"
              viewBox={`0 0 ${coordWidth} ${timelineHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <marker id="gantt-dep-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M0,0 L8,4 L0,8 Z" className="fill-muted-foreground/60" />
                </marker>
              </defs>
              {dependencyLines.map((line) => (
                <path
                  key={line.key}
                  d={`M${line.x1},${line.y1} C${(line.x1 + line.x2) / 2},${line.y1} ${(line.x1 + line.x2) / 2},${line.y2} ${line.x2},${line.y2}`}
                  fill="none"
                  className="stroke-muted-foreground/50"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                  markerEnd="url(#gantt-dep-arrow)"
                />
              ))}
            </svg>
          )}

          {visiblePhases.map((phase) => {
            const isCollapsed = collapsed.has(phase.id);
            return (
              <div key={phase.id}>
                <div className="h-7 border-t border-border bg-muted/30" />
                {!isCollapsed &&
                  phase.tasks.map((task) => (
                    <div key={task.id} className="border-t border-border/50">
                      <TaskBar
                        task={task}
                        rangeStart={rangeStart}
                        rangeEnd={rangeEnd}
                        onClick={onSelectTask}
                        draggable={isPM}
                        onReschedule={handleReschedule}
                        containerRef={containerRef}
                        totalDays={totalDays}
                        pxPerDay={usesPx ? pxPerDay : null}
                      />
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

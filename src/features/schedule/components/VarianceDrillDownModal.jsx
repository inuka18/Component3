import { useNavigate } from "react-router-dom";
import { ArrowUpRight, CalendarClock, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { ActualVsPlannedChart } from "./ActualVsPlannedChart";
import { getTeamMemberById } from "../../../data/mockTeam";
import { getGapById } from "../../../data/mockGaps";
import { getRequirementById } from "../../../data/mockRequirements";
import { varianceDays, isLate, statusBadgeVariant, statusLabel, causeStyle, formatShortDate } from "../lib/scheduleUtils";
import { cn } from "../../../lib/utils";

function severityBadge(task) {
  const v = varianceDays(task);
  if (task.critical) return { variant: "danger", label: "Critical" };
  if (v > 0) return { variant: "warning", label: `+${v}d slip` };
  return { variant: "success", label: "On track" };
}

// The click-through detail for any task bar in any Gantt/variance chart:
// baseline vs. actual, and where a delay traces back to a real Gap
// Detection gap or a Requirements record, a direct link into that
// feature (never a stub or a copy of it).
//
// Also doubles as a list drill-down: pass `tasks` (+ `title`/`subtitle`)
// instead of a single `task`, used when a caller's
// click target is a group (a granularity level on VarianceChart, a cause
// on RootCauseChart, or a day on BurndownChart) rather than one task.
// Overview has no Gantt underneath to compete with, so this stays a true
// modal in both modes. List mode leads with ActualVsPlannedChart, a
// compact per-task duration bar for exactly this task set is still the
// clearest way to see *why* a day/week/cause group is off track. Then
// the same chart's per-row click and the task cards below it both do the
// same thing: close the modal and jump straight to the Day view for that
// task's start date, no nested second modal.
export function VarianceDrillDownModal({ task, tasks, title, subtitle, projectId, open, onOpenChange }) {
  const navigate = useNavigate();
  const listMode = Boolean(tasks && tasks.length > 0);
  if (!task && !listMode) return null;

  if (listMode) {
    const total = tasks.length;
    const criticalCount = tasks.filter((t) => t.critical).length;
    const avgProgress = Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / total);
    const totalSlip = tasks.reduce((sum, t) => sum + Math.max(0, varianceDays(t)), 0);

    const goToTaskDay = (t) => {
      const pid = t.projectId ?? projectId;
      onOpenChange(false);
      navigate(`/projects/${pid}/schedule/day?date=${encodeURIComponent(t.start)}`);
    };
    const goToGap = (e, gapId, pid) => {
      e.stopPropagation();
      onOpenChange(false);
      navigate(`/projects/${pid}/gap-detection/inventory?gap=${gapId}`);
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Tasks", value: total },
              { label: "Critical", value: criticalCount },
              { label: "Avg % Complete", value: `${avgProgress}%` },
              { label: "Total Slip", value: `${totalSlip}d` },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-border bg-muted/30 p-2.5 text-center">
                <p className="text-base font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actual vs. Planned</p>
            <ActualVsPlannedChart tasks={tasks} onSelectTask={goToTaskDay} />
          </div>

          <div className="space-y-2">
            {tasks.map((t) => {
              const severity = severityBadge(t);
              const pid = t.projectId ?? projectId;
              const gap = t.cause?.linkedGapId ? getGapById(t.cause.linkedGapId) : null;
              return (
                // Root is a div, not a button. "View in Gap Detection" below is
                // its own real button, and a button can't legally nest inside
                // another button. role="button" + tabIndex keeps this keyboard-operable.
                <div
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => goToTaskDay(t)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && goToTaskDay(t)}
                  className="block w-full cursor-pointer rounded-lg border border-border p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{t.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{t.projectName ?? t.phaseName}</p>
                    </div>
                    <Badge variant={severity.variant} className="shrink-0 text-[10px]">
                      {severity.label}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span>{t.progress}% complete</span>
                    <span>
                      Planned {formatShortDate(t.baselineStart)} – {formatShortDate(t.baselineEnd)}
                    </span>
                    <span>
                      Actual {formatShortDate(t.start)} – {formatShortDate(t.end)}
                    </span>
                  </div>
                  {gap && (
                    <button
                      onClick={(e) => goToGap(e, gap.id, pid)}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                    >
                      View in Gap Detection <ArrowUpRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const pid = task.projectId ?? projectId;
  const assignee = getTeamMemberById(task.assigneeId);
  const variance = varianceDays(task);
  const late = isLate(task);
  const gap = task.cause?.linkedGapId ? getGapById(task.cause.linkedGapId) : null;
  const requirement = task.cause?.linkedRequirementId ? getRequirementById(task.cause.linkedRequirementId) : null;
  const cause = task.cause ? causeStyle(task.cause.type) : null;

  const goToGap = () => {
    onOpenChange(false);
    navigate(`/projects/${pid}/gap-detection/inventory?gap=${gap.id}`);
  };
  const goToRequirement = () => {
    onOpenChange(false);
    navigate(`/projects/${pid}/requirements/list?req=${requirement.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs font-medium text-primary">{task.id}</span>
            <Badge variant={statusBadgeVariant(task)} className="text-[10px]">
              {statusLabel(task)}
            </Badge>
            {task.critical && (
              <Badge variant="danger" className="text-[10px]">
                Critical
              </Badge>
            )}
          </div>
          <DialogTitle>{task.name}</DialogTitle>
          <DialogDescription>{task.phaseName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {assignee && (
            <div className="flex items-center gap-2 text-sm text-foreground">
              <User className="h-4 w-4 text-muted-foreground" />
              {assignee.name} · {assignee.jobTitle}
            </div>
          )}

          <dl className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Baseline</dt>
              <dd className="mt-1 font-medium text-foreground">
                {formatShortDate(task.baselineStart)} – {formatShortDate(task.baselineEnd)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Actual</dt>
              <dd className={cn("mt-1 font-medium", late ? "text-status-dropped-fg" : "text-foreground")}>
                {formatShortDate(task.start)} – {formatShortDate(task.end)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Variance</dt>
              <dd className={cn("mt-1 flex items-center gap-1 font-medium", late ? "text-status-dropped-fg" : "text-status-confirmed-fg")}>
                <CalendarClock className="h-3.5 w-3.5" />
                {variance > 0 ? `+${variance}d late` : variance < 0 ? `${Math.abs(variance)}d ahead` : "On time"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Progress</dt>
              <dd className="mt-1 font-medium text-foreground">{task.progress}%</dd>
            </div>
          </dl>

          {task.bufferDonor && (
            <p className="flex items-center gap-1.5 text-xs text-status-confirmed-fg">
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
              Buffer sourced from {task.bufferDonor} via Redistribute Buffers.
            </p>
          )}

          {task.cause ? (
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", cause.dotClass)} />
                <span className={cn("text-xs font-semibold uppercase tracking-wide", cause.textClass)}>
                  {cause.label}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">{task.cause.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {gap && (
                  <Button variant="outline" size="sm" onClick={goToGap}>
                    View {gap.id} in Gap Detection
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                )}
                {requirement && (
                  <Button variant="outline" size="sm" onClick={goToRequirement}>
                    View {requirement.id} in Requirements
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No delay cause recorded, this task is tracking to plan.</p>
          )}

          {task.dependencies?.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Depends on
              </p>
              <div className="flex flex-wrap gap-1.5">
                {task.dependencies.map((depId) => (
                  <span
                    key={depId}
                    className="rounded-full bg-muted px-2.5 py-1 font-mono text-[11px] font-medium text-foreground"
                  >
                    {depId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

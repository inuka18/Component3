import { useEffect, useMemo, useState } from "react";
import { ListChecks, Gauge, AlertTriangle, Users2, TrendingUp, RotateCcw, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { VarianceChart } from "./components/VarianceChart";
import { RootCauseChart } from "./components/RootCauseChart";
import { BurndownChart } from "./components/BurndownChart";
import { BufferRedistributionPanel } from "./components/BufferRedistributionPanel";
import { VarianceDrillDownModal } from "./components/VarianceDrillDownModal";
import { RestrictedButton } from "./components/RestrictedButton";
import { useSchedulePhases } from "../../hooks/useSchedulePhases";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useRole, ROLES } from "../../context/RoleContext";
import { useScheduleHistory } from "./context/ScheduleHistoryContext";
import { getRequirementsForProject } from "../../data/mockRequirements";
import {
  flattenTasks,
  varianceDays,
  isAtRisk,
  causeStyle,
  overlapsRange,
  isTaskActiveOn,
  startOfWeek,
  addDays,
  endOfDay,
  pullTaskInByDays,
  TODAY,
  formatDayOfWeek,
} from "./lib/scheduleUtils";
import { cn } from "../../lib/utils";

const CAUSE_ORDER = ["requirement-change", "resource-disruption", "ripple-propagation"];
const weekStart = startOfWeek(TODAY);
const weekEnd = endOfDay(addDays(weekStart, 6));

function KpiTile({ label, value, icon: Icon, accentClass }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", accentClass ?? "bg-primary/10 text-primary")}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold leading-none text-foreground">{value}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function buildLevel(key, label, pool) {
  const delayed = pool.filter(isAtRisk);
  const onTrack = pool.filter((t) => !isAtRisk(t));
  return {
    key,
    label,
    tasks: pool,
    total: pool.length,
    onTrackCount: onTrack.length,
    delayedCount: delayed.length,
    totalSlip: delayed.reduce((sum, t) => sum + Math.max(0, varianceDays(t)), 0),
  };
}

// The active project's schedule at a glance: KPIs, buffer redistribution,
// and planned-vs-actual variance across Day/Week/Sprint/Project
// granularities, all scoped to the current project like every other
// Schedule view (Day/Week/Sprint/Project Timeline).
export function ScheduleOverviewPage() {
  const { activeProject, activeProjectId } = useActiveProject();
  const { role } = useRole();
  const isPM = role === ROLES.PM;
  const { data: phases, loading } = useSchedulePhases(activeProjectId);
  const { pushHistory } = useScheduleHistory();

  const [listDrill, setListDrill] = useState(null);
  const [toast, setToast] = useState(null);
  const [, bump] = useState(0);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const tasks = useMemo(() => flattenTasks(phases), [phases]);

  // ---- KPI row ----
  const totalTasks = tasks.length;
  const avgCompletionPct = totalTasks
    ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / totalTasks)
    : 0;
  const criticalAtRisk = tasks.filter((t) => t.critical && isAtRisk(t));
  const activeResources = new Set(
    tasks.filter((t) => t.status !== "done").map((t) => t.assigneeId)
  ).size;

  const reqs = activeProjectId ? getRequirementsForProject(activeProjectId) : [];
  const linkedReqIds = new Set(tasks.map((t) => t.requirementId).filter(Boolean));
  const requirementCoveragePct = reqs.length
    ? Math.round((reqs.filter((r) => linkedReqIds.has(r.id)).length / reqs.length) * 100)
    : 0;

  // ---- Re-optimization banner + buffer redistribution ----
  const totalSlipDays = criticalAtRisk.reduce((sum, t) => sum + Math.max(0, varianceDays(t)), 0);
  const donorTasksRaw = tasks.filter((t) => !t.critical && !isAtRisk(t) && t.status !== "done");
  const criticalWithDonors = criticalAtRisk.map((t) => ({
    task: t,
    behindDays: Math.max(0, varianceDays(t)),
    donor: t.bufferDonor ? { name: t.bufferDonor } : null,
  }));
  const donorTasksForPanel = donorTasksRaw.map((t) => ({ task: t }));

  // Scans every critical task still behind baseline, pairs each with a
  // non-critical donor that has spare slack, and pulls the critical task
  // in by a day (see pullTaskInByDays, it only compresses `end`, never
  // moves `start`). Every mutated task is snapshotted first so Undo can
  // restore it in one shot.
  const handleRedistribute = () => {
    const behindNow = tasks.filter((t) => t.critical && isAtRisk(t) && varianceDays(t) > 0);
    const donorsNow = tasks.filter((t) => !t.critical && !isAtRisk(t) && t.status !== "done");
    if (behindNow.length === 0 || donorsNow.length === 0) {
      setToast("No redistributable slack found.");
      return;
    }
    const snapshots = [];
    const donorNames = new Set();
    behindNow.forEach((t, i) => {
      const donor = donorsNow[i % donorsNow.length];
      snapshots.push({ task: t, prevEnd: t.end, prevBufferDonor: t.bufferDonor });
      pullTaskInByDays(t, 1);
      t.bufferDonor = donor.name;
      donorNames.add(donor.name);
    });
    pushHistory(`Redistributed buffers for ${snapshots.length} task(s)`, () => {
      snapshots.forEach(({ task: t, prevEnd, prevBufferDonor }) => {
        t.end = prevEnd;
        t.bufferDonor = prevBufferDonor;
      });
    });
    bump((n) => n + 1);
    setToast(
      `Re-optimized: ${snapshots.length} critical task(s) pulled in by 1 day (${snapshots.length}d recovered), buffer sourced from ${[...donorNames].join(", ")}.`
    );
  };

  // ---- Multi-level variance ----
  const dayPool = tasks.filter((t) => isTaskActiveOn(t, TODAY));
  const weekPool = tasks.filter((t) => overlapsRange(t, weekStart, weekEnd));
  const sprintPool = activeProject?.activeSprint
    ? tasks.filter((t) =>
        overlapsRange(t, new Date(activeProject.activeSprint.startDate), new Date(activeProject.activeSprint.endDate))
      )
    : [];
  const levels = [
    buildLevel("day", "Day", dayPool),
    buildLevel("week", "Week", weekPool),
    buildLevel("sprint", "Sprint", sprintPool),
    buildLevel("project", "Project", tasks),
  ];
  const causeTasks = tasks.filter((t) => t.cause);

  const handleSelectLevel = (level) => {
    setListDrill({
      title: `${level.label} Level: Task Breakdown`,
      subtitle: `${level.total} task${level.total === 1 ? "" : "s"} · ${level.delayedCount} delayed · ${level.totalSlip}d total slip`,
      tasks: level.tasks,
    });
  };

  const handleSelectCause = (type) => {
    const style = causeStyle(type);
    const filtered = tasks.filter((t) => t.cause?.type === type);
    setListDrill({
      title: style.label,
      subtitle: `${filtered.length} task${filtered.length === 1 ? "" : "s"} affected`,
      tasks: filtered,
    });
  };

  // ---- Sprint burndown ----
  const sprint = activeProject?.activeSprint;
  const sprintStart = sprint ? new Date(sprint.startDate) : null;
  const sprintEnd = sprint ? new Date(sprint.endDate) : null;
  const sprintTasks = sprint ? tasks.filter((t) => overlapsRange(t, sprintStart, sprintEnd)) : [];

  const handleSelectBurndownDay = (day) => {
    const dayTasks = sprintTasks.filter((t) => isTaskActiveOn(t, day));
    setListDrill({
      title: formatDayOfWeek(day),
      subtitle: `${dayTasks.length} task${dayTasks.length === 1 ? "" : "s"} touching this day`,
      tasks: dayTasks,
    });
  };

  if (!loading && totalTasks === 0) {
    return (
      <EmptyState icon={ListChecks} title="No schedule data yet" description="No phases or tasks scheduled yet." />
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI ROW */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[4.5rem] w-full rounded-xl" />)
        ) : (
          <>
            <KpiTile label="Tasks" value={totalTasks} icon={ListChecks} />
            <KpiTile label="Avg Completion %" value={`${avgCompletionPct}%`} icon={TrendingUp} />
            <KpiTile
              label="Critical-Path at Risk"
              value={criticalAtRisk.length}
              icon={AlertTriangle}
              accentClass="bg-status-dropped-bg text-status-dropped-fg"
            />
            <KpiTile label="Requirement Coverage" value={`${requirementCoveragePct}%`} icon={Gauge} />
            <KpiTile label="Active Resources" value={activeResources} icon={Users2} />
          </>
        )}
      </div>

      {/* RE-OPTIMIZATION BANNER */}
      {!loading && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/[0.05] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <RotateCcw className="h-4.5 w-4.5" />
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              <span className="font-semibold">Redistribute slack:</span> pull buffer from non-critical tasks to
              protect impacted critical-path work: {criticalAtRisk.length} delayed, {totalSlipDays}d total slip.
            </p>
          </div>
          {isPM ? (
            <Button onClick={handleRedistribute} className="shrink-0">
              <RotateCcw className="h-4 w-4" />
              Redistribute Buffers
            </Button>
          ) : (
            <RestrictedButton label="Only Project Managers can trigger buffer redistribution" variant="default" size="default">
              <RotateCcw className="h-4 w-4" />
              Redistribute Buffers
            </RestrictedButton>
          )}
        </div>
      )}

      {/* SLACK & BUFFER REDISTRIBUTION PANEL */}
      {!loading && (
        <BufferRedistributionPanel isPM={isPM} criticalTasks={criticalWithDonors} donorTasks={donorTasksForPanel} />
      )}

      {/* PLANNED VS ACTUAL: MULTI-LEVEL VARIANCE */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Planned vs. Actual: Multi-Level Variance</CardTitle>
            <CardDescription>On-track vs. delayed mix at every planning granularity.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-56 w-full" /> : <VarianceChart levels={levels} onSelectLevel={handleSelectLevel} />}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Root Cause Breakdown</CardTitle>
            <CardDescription>Why tasks are slipping.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <RootCauseChart tasks={causeTasks} onSelectCause={handleSelectCause} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* SPRINT BURNDOWN */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sprint Burndown</CardTitle>
          <CardDescription>
            {sprint ? `${sprint.name}'s planned vs. actual remaining effort.` : "No active sprint configured."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-56 w-full rounded-lg" />
          ) : sprint ? (
            <BurndownChart
              tasks={sprintTasks}
              rangeStart={sprintStart}
              rangeEnd={sprintEnd}
              height={220}
              onSelectDay={handleSelectBurndownDay}
            />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No active sprint configured.</p>
          )}
        </CardContent>
      </Card>

      {/* 4 compact summary cards */}
      {!loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {levels.map((level) => {
            const causeTypesAtLevel = CAUSE_ORDER.filter((type) => level.tasks.some((t) => t.cause?.type === type));
            return (
              <div key={level.key} className="rounded-lg border border-border p-4">
                <p className="text-sm font-semibold text-foreground">{level.label}</p>
                <div className="mt-2 grid grid-cols-4 gap-1 text-center">
                  <div>
                    <p className="text-sm font-bold text-foreground">{level.total}</p>
                    <p className="text-[9px] text-muted-foreground">Tasks</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-status-confirmed-fg">{level.onTrackCount}</p>
                    <p className="text-[9px] text-muted-foreground">On Track</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-status-dropped-fg">{level.delayedCount}</p>
                    <p className="text-[9px] text-muted-foreground">Delayed</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{level.totalSlip}d</p>
                    <p className="text-[9px] text-muted-foreground">Slip</p>
                  </div>
                </div>
                {causeTypesAtLevel.length > 0 && (
                  <div className="mt-3 flex gap-1.5 overflow-x-auto scrollbar-thin border-t border-border pt-3">
                    {causeTypesAtLevel.map((type) => {
                      const style = causeStyle(type);
                      return (
                        <Badge key={type} variant={style.badgeVariant} className="shrink-0 whitespace-nowrap text-[10px]">
                          {style.label}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <VarianceDrillDownModal
        tasks={listDrill?.tasks}
        title={listDrill?.title}
        subtitle={listDrill?.subtitle}
        projectId={activeProjectId}
        open={Boolean(listDrill)}
        onOpenChange={(o) => !o && setListDrill(null)}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] flex max-w-sm items-start gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-2xl animate-slide-up">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-confirmed-fg" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

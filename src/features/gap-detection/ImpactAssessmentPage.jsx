import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardCheck, ChevronDown, FileJson, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { EmptyState } from "../../components/common/EmptyState";
import { ImpactGranularityCards } from "./components/ImpactGranularityCards";
import { ComponentThreeHandoffPanel } from "./components/ComponentThreeHandoffPanel";
import { GapTypeBadge } from "./components/GapTypeBadge";
import { usePropagationRuns } from "../../hooks/usePropagationRuns";
import { useActiveProject } from "../../hooks/useActiveProject";
import { getGapById } from "../../data/mockGaps";
import { formatDateTime } from "../../lib/utils";
import { cn } from "../../lib/utils";

const RISK_VARIANT = { High: "danger", Medium: "warning", Low: "success" };

export function ImpactAssessmentPage() {
  const { activeProjectId } = useActiveProject();
  const { data: runs, loading } = usePropagationRuns(activeProjectId);

  const [selectedRunId, setSelectedRunId] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const topRef = useRef(null);

  // Default to the newest run (fetchPropagationRuns already sorts
  // newest-first) once runs load; never overrides a user's own pick.
  useEffect(() => {
    if (!loading && runs.length > 0 && !selectedRunId) {
      setSelectedRunId(runs[0].id);
    }
  }, [loading, runs, selectedRunId]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const selectedRun = runs.find((r) => r.id === selectedRunId);
  const gap = selectedRun ? getGapById(selectedRun.gapId) : null;

  const handleSelectRun = (runId) => {
    setSelectedRunId(runId);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleExport = (format) => {
    setToast(`Exported ${format}. Prototype simulation, no file was actually generated.`);
  };

  if (!loading && runs.length === 0) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="No propagation runs yet"
        description="Run 'Calculate Propagation Impact' from the Propagation tab to generate an assessment here. This page only ever reports what that run already produced."
        action={
          <Button asChild>
            <Link to="../propagation">Go to Propagation</Link>
          </Button>
        }
      />
    );
  }

  if (loading || !selectedRun || !gap) {
    return <Skeleton className="h-[32rem] w-full rounded-xl" />;
  }

  const summaryRows = [
    {
      level: "Day",
      affectedTasks: selectedRun.dayImpact.affectedTasks,
      workloadDelta: selectedRun.dayImpact.workloadImpact,
      scheduleDelta: selectedRun.dayImpact.expectedSlip,
      risk: selectedRun.dayImpact.risk,
    },
    {
      level: "Week",
      affectedTasks: selectedRun.weekImpact.affectedTasks,
      workloadDelta: selectedRun.weekImpact.workloadImpact,
      scheduleDelta: selectedRun.weekImpact.expectedSlip,
      risk: selectedRun.weekImpact.risk,
    },
    {
      level: "Sprint",
      affectedTasks: selectedRun.sprintImpact.affectedCommitments,
      workloadDelta: `${selectedRun.sprintImpact.storyPointsAtRisk} pts`,
      scheduleDelta: selectedRun.sprintImpact.expectedSprintSlip,
      risk: selectedRun.sprintImpact.risk,
    },
  ];

  return (
    <div ref={topRef} className="space-y-6">
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs font-medium text-primary">{gap.id}</span>
            <GapTypeBadge type={gap.type} />
          </div>
          <CardTitle className="text-lg">{gap.title}</CardTitle>
          <CardDescription>
            The aggregated result of propagation, rolled up and ready to hand off. This page reports what
            Propagation already produced; it does not recalculate anything.
          </CardDescription>
        </CardHeader>
      </Card>

      <ImpactGranularityCards run={selectedRun} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Impact Assessment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Affected Tasks</TableHead>
                  <TableHead>Workload Delta</TableHead>
                  <TableHead>Schedule Delta</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaryRows.map((row) => (
                  <TableRow key={row.level}>
                    <TableCell className="font-medium text-foreground">{row.level}</TableCell>
                    <TableCell>{row.affectedTasks}</TableCell>
                    <TableCell className="font-mono text-xs">{row.workloadDelta}</TableCell>
                    <TableCell className="font-mono text-xs">{row.scheduleDelta}</TableCell>
                    <TableCell>
                      <Badge variant={RISK_VARIANT[row.risk] ?? "outline"}>{row.risk}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-xs text-muted-foreground">
                Impact recalculated: {formatDateTime(selectedRun.timestamp)}
              </p>
              <ComponentThreeHandoffPanel run={selectedRun} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport("JSON")}>
                <FileJson className="h-4 w-4" />
                Export JSON
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("CSV")}>
                <FileSpreadsheet className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => setHistoryOpen((o) => !o)}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Impact History</CardTitle>
              <CardDescription>Every propagation run recorded for this project.</CardDescription>
            </div>
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", historyOpen && "rotate-180")} />
          </div>
        </CardHeader>
        {historyOpen && (
          <CardContent className="p-0">
            <div className="overflow-hidden rounded-b-xl border-t border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Gap</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Impact Summary</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Week</TableHead>
                    <TableHead>Sprint</TableHead>
                    <TableHead>Sent to C3</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map((run) => {
                    const runGap = getGapById(run.gapId);
                    const isActive = run.id === selectedRun.id;
                    return (
                      <TableRow
                        key={run.id}
                        onClick={() => handleSelectRun(run.id)}
                        className={cn("cursor-pointer", isActive && "bg-primary/5")}
                      >
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDateTime(run.timestamp)}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-medium text-primary">{run.gapId}</TableCell>
                        <TableCell>{runGap && <GapTypeBadge type={runGap.type} short />}</TableCell>
                        <TableCell className="max-w-[14rem] truncate text-sm text-foreground">
                          {runGap?.title ?? "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={RISK_VARIANT[run.dayImpact.risk] ?? "outline"} className="text-[10px]">
                            {run.dayImpact.risk}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={RISK_VARIANT[run.weekImpact.risk] ?? "outline"} className="text-[10px]">
                            {run.weekImpact.risk}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={RISK_VARIANT[run.sprintImpact.risk] ?? "outline"} className="text-[10px]">
                            {run.sprintImpact.risk}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {run.sentToC3 ? (
                            <span className="inline-flex items-center gap-1 text-xs text-status-confirmed-fg">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Yes
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">No</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        )}
      </Card>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] flex max-w-sm items-start gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-2xl animate-slide-up">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-confirmed-fg" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Play, CheckCircle2, RefreshCw, Circle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { ComparisonPanel } from "./components/ComparisonPanel";
import { ForwardGapExplainer } from "./components/ForwardGapExplainer";
import { BackwardGapExplainer } from "./components/BackwardGapExplainer";
import { ResourceGapCard } from "./components/ResourceGapCard";
import { ConfigureDetectionDialog } from "./components/ConfigureDetectionDialog";
import { RestrictedButton } from "./components/RestrictedButton";
import { useGaps } from "../../hooks/useGaps";
import { useExecutionEvidence } from "../../hooks/useExecutionEvidence";
import { useResourceCapacity } from "../../hooks/useResourceCapacity";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useRole, ROLES } from "../../context/RoleContext";
import { runDetection } from "../../services/gapDetectionService";
import { getRequirementById } from "../../data/mockRequirements";
import { cn } from "../../lib/utils";

const DETECTION_STAGES = [
  "Requirement Comparison",
  "Execution Evidence Analysis",
  "Resource Analysis",
  "Gap Classification",
  "Dependency Analysis",
];

// Curated per-project so the comparison showcase always reflects the
// project actually being viewed. Picked to span a visibly different
// alignment score each, see the note in ComparisonPanel.jsx for how that
// score is derived.
const EXAMPLE_COMPARISON_IDS = {
  "proj-novacart": ["REQ-112", "REQ-115", "REQ-106"],
  "proj-meridianpay": ["REQ-203", "REQ-208", "REQ-206"],
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function GapWorkspacePage() {
  const { activeProjectId } = useActiveProject();
  const { role } = useRole();
  const isPM = role === ROLES.PM;

  const { data: gaps, loading: gapsLoading } = useGaps(activeProjectId);
  const { data: evidence, loading: evLoading } = useExecutionEvidence(activeProjectId);
  const { data: capacity, loading: capLoading } = useResourceCapacity(activeProjectId);
  const loading = gapsLoading || evLoading || capLoading;

  const [stageIndex, setStageIndex] = useState(-1);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleRunDetection = async () => {
    setRunning(true);
    setToast(null);
    for (let i = 0; i < DETECTION_STAGES.length; i++) {
      setStageIndex(i);
      // eslint-disable-next-line no-await-in-loop
      await sleep(500);
    }
    const res = await runDetection(activeProjectId);
    setStageIndex(DETECTION_STAGES.length); // flips the last stage to "done"
    await sleep(300);
    setResult(res);
    setRunning(false);
    setStageIndex(-1);
    setToast(
      `Detection completed. ${res.total} gaps identified: ${res.forward} Forward, ${res.backward} Backward, ${res.resource} Resource.`
    );
  };

  const exampleReqIds = EXAMPLE_COMPARISON_IDS[activeProjectId] ?? [];
  const firstForwardGap = gaps.find((g) => g.type === "Forward");
  const firstBackwardGap = gaps.find((g) => g.type === "Backward");

  const sortedByDeficit = [...capacity].sort(
    (a, b) => b.plannedHours - b.availableHours - (a.plannedHours - a.availableHours)
  );
  const overAllocated = sortedByDeficit[0];
  const underUtilized = sortedByDeficit[sortedByDeficit.length - 1];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Run Gap Detection</CardTitle>
          <CardDescription>
            Re-scan requirements, execution evidence, and resource capacity to identify new or updated gaps.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {isPM ? (
              <Button onClick={handleRunDetection} disabled={running}>
                <Play className={cn("h-4 w-4", running && "animate-pulse")} />
                {running ? "Running Detection…" : "Run Gap Detection"}
              </Button>
            ) : (
              <RestrictedButton label="Only Project Managers can run detection" variant="default" size="default">
                <Play className="h-4 w-4" />
                Run Gap Detection
              </RestrictedButton>
            )}
            <ConfigureDetectionDialog isPM={isPM} />
          </div>

          {stageIndex >= 0 && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
              {DETECTION_STAGES.map((stage, i) => {
                const state = i < stageIndex ? "done" : i === stageIndex ? "active" : "pending";
                return (
                  <div
                    key={stage}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors duration-300",
                      state === "done" &&
                        "border-status-confirmed-fg/30 bg-status-confirmed-bg/40 text-status-confirmed-fg",
                      state === "active" && "border-primary/40 bg-primary/5 text-primary",
                      state === "pending" && "border-border text-muted-foreground/60"
                    )}
                  >
                    {state === "done" && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                    {state === "active" && <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin" />}
                    {state === "pending" && <Circle className="h-3.5 w-3.5 shrink-0" />}
                    <span className="leading-tight">{stage}</span>
                  </div>
                );
              })}
            </div>
          )}

          {result && !running && stageIndex < 0 && (
            <p className="text-xs text-muted-foreground">
              Last run: {result.total} gaps identified, {result.forward} Forward, {result.backward} Backward,{" "}
              {result.resource} Resource.
            </p>
          )}

          <p className="text-[11px] leading-relaxed text-muted-foreground/80">
            Prototype simulation, actual detection requires backend implementation.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Requirement vs. Execution Comparison</CardTitle>
          <CardDescription>
            How approved requirement text compares against the execution evidence gathered for it, with the
            resulting semantic alignment score.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-52 w-full rounded-xl" />)
            : exampleReqIds.map((reqId) => {
                const requirement = getRequirementById(reqId);
                const reqEvidence = evidence.filter((e) => e.linkedRequirementId === reqId);
                return <ComparisonPanel key={reqId} requirement={requirement} evidence={reqEvidence} />;
              })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ForwardGapExplainer exampleGapId={firstForwardGap?.id} />
        <BackwardGapExplainer exampleGapId={firstBackwardGap?.id} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resource Gap Analysis</CardTitle>
          <CardDescription>Where planned effort most exceeds, or falls short of, available capacity this sprint.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : capacity.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No capacity data for this project yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {overAllocated && <ResourceGapCard capacity={overAllocated} />}
              {underUtilized && underUtilized.id !== overAllocated?.id && (
                <ResourceGapCard capacity={underUtilized} />
              )}
            </div>
          )}
        </CardContent>
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

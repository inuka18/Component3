import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Play, GitBranch } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Separator } from "../../components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { EmptyState } from "../../components/common/EmptyState";
import { GapTypeBadge } from "./components/GapTypeBadge";
import { SeverityBadge } from "./components/SeverityBadge";
import { CalibrationTable } from "./components/CalibrationTable";
import { DependencyRippleGraph, computeRipple } from "./components/DependencyRippleGraph";
import { RestrictedButton } from "./components/RestrictedButton";
import { useGap, useGaps } from "../../hooks/useGaps";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useRole, ROLES } from "../../context/RoleContext";
import { sendGapToC3, computeImpactBreakdown, recordPropagationRun } from "../../services/gapDetectionService";
import {
  GAP_TYPE_CALIBRATION,
  CHANGE_DISRUPTION_CALIBRATION,
  flattenDisruptionCalibration,
  BASE_IMPACT_HOURS,
} from "../../data/mockCalibration";
import { cn } from "../../lib/utils";

const REQUIREMENT_KEYS = new Set(CHANGE_DISRUPTION_CALIBRATION.requirement.map((r) => r.key));

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function ImpactPropagationPage() {
  const { activeProjectId } = useActiveProject();
  const { role } = useRole();
  const isPM = role === ROLES.PM;

  const { data: gaps } = useGaps(activeProjectId);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedGapId, setSelectedGapId] = useState(null);
  const { data: gap, loading } = useGap(selectedGapId);

  const [gapTypeWeights, setGapTypeWeights] = useState(GAP_TYPE_CALIBRATION);
  const [disruptionWeights, setDisruptionWeights] = useState(flattenDisruptionCalibration);
  const [calculating, setCalculating] = useState(false);
  const [calculated, setCalculated] = useState(false);

  // Deep link support: GapDetailPanel's "Propagate Impact" button lands
  // here with ?gap=<id>, same pattern as the rest of this feature.
  useEffect(() => {
    const gapId = searchParams.get("gap");
    if (!gapId) return;
    setSelectedGapId(gapId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("gap");
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // A gap already marked "Propagated" (from a prior calculation, this
  // session or seeded) shows its diagnostic immediately; anything else
  // needs the PM to run the calculation below.
  useEffect(() => {
    if (gap) setCalculated(gap.status === "Propagated");
  }, [gap?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateGapTypeWeight = (key, weight) =>
    setGapTypeWeights((prev) => prev.map((r) => (r.key === key ? { ...r, weight } : r)));
  const updateDisruptionWeight = (key, weight) =>
    setDisruptionWeights((prev) => prev.map((r) => (r.key === key ? { ...r, weight } : r)));

  const handleCalculate = async () => {
    setCalculating(true);
    await sleep(900);
    await sendGapToC3(gap.id);

    // Recomputed here rather than reused from the render body below,
    // handleCalculate is defined before those values exist (gap can still
    // be null at that point in the component). gap is guaranteed non-null
    // by the time this handler can actually be invoked, since the button
    // that calls it only renders past the loading/empty guards.
    const gapTypeW = gapTypeWeights.find((r) => r.key === gap.type)?.weight ?? 1;
    const disruptionW = disruptionWeights.find((r) => r.key === gap.disruptionCategory)?.weight ?? 1;
    const baseI = BASE_IMPACT_HOURS[gap.severity] ?? 10;
    const rippleResult = computeRipple(gap);
    const depFactor = +(1 + Math.min(rippleResult.downstreamCount, 6) * 0.08).toFixed(2);
    const impact = Math.round(baseI * gapTypeW * disruptionW * depFactor);

    const breakdown = computeImpactBreakdown(gap, rippleResult, impact);
    recordPropagationRun({ gap, ...breakdown });

    setCalculating(false);
    setCalculated(true);
  };

  if (!selectedGapId) {
    return (
      <EmptyState
        icon={GitBranch}
        title="No gap selected"
        description="Pick a gap from Inventory to see how it propagates into a schedule impact, or use 'Propagate Impact' from any gap's detail panel."
        action={
          <Button asChild>
            <Link to="../inventory">Go to Inventory</Link>
          </Button>
        }
      />
    );
  }

  if (loading || !gap) {
    return <Skeleton className="h-[32rem] w-full rounded-xl" />;
  }

  const gapTypeWeight = gapTypeWeights.find((r) => r.key === gap.type)?.weight ?? 1;
  const disruptionRow = disruptionWeights.find((r) => r.key === gap.disruptionCategory);
  const disruptionWeight = disruptionRow?.weight ?? 1;
  const baseImpact = BASE_IMPACT_HOURS[gap.severity] ?? 10;
  const ripple = computeRipple(gap);
  const dependencyFactor = +(1 + Math.min(ripple.downstreamCount, 6) * 0.08).toFixed(2);
  const scheduleImpact = Math.round(baseImpact * gapTypeWeight * disruptionWeight * dependencyFactor);

  const requirementRows = disruptionWeights.filter((r) => REQUIREMENT_KEYS.has(r.key));
  const resourceRows = disruptionWeights.filter((r) => !REQUIREMENT_KEYS.has(r.key));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Impact Propagation</h2>
          <p className="text-sm text-muted-foreground">
            The mechanism behind one gap's schedule impact, not the rolled-up totals (see Assessment).
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Select value={gap.id} onValueChange={setSelectedGapId}>
            <SelectTrigger>
              <SelectValue placeholder="Switch gap" />
            </SelectTrigger>
            <SelectContent>
              {gaps.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.id} · {g.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs font-medium text-primary">{gap.id}</span>
            <GapTypeBadge type={gap.type} />
            <SeverityBadge severity={gap.severity} />
          </div>
          <CardTitle className="text-lg">{gap.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="font-mono text-sm font-semibold leading-relaxed text-foreground">
              Schedule Impact = Base Impact × Gap-Type Weight × Change/Disruption Weight × Dependency Factor
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              This is not one universal weight applied to every gap. The multipliers below are looked up per
              gap type and per change/disruption category, so two gaps of the same severity can still propagate
              very differently.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gap-Type Calibration</CardTitle>
          <CardDescription>How much a gap's own type amplifies its schedule impact.</CardDescription>
        </CardHeader>
        <CardContent>
          <CalibrationTable
            typeLabel="Gap Type"
            rows={gapTypeWeights}
            isPM={isPM}
            onWeightChange={updateGapTypeWeight}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change / Disruption Calibration</CardTitle>
          <CardDescription>Combined formula: Gap Weight × Change/Disruption Modifier</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Requirement-related
            </h4>
            <CalibrationTable
              typeLabel="Change / Disruption Type"
              rows={requirementRows}
              isPM={isPM}
              onWeightChange={updateDisruptionWeight}
            />
          </div>
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Resource-related
            </h4>
            <CalibrationTable
              typeLabel="Change / Disruption Type"
              rows={resourceRows}
              isPM={isPM}
              onWeightChange={updateDisruptionWeight}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dependency Ripple</CardTitle>
          <CardDescription>Run the ripple analysis for {gap.id} using the calibration weights above.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {!calculated ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                {isPM ? (
                  <Button onClick={handleCalculate} disabled={calculating}>
                    <Play className={cn("h-4 w-4", calculating && "animate-pulse")} />
                    {calculating ? "Calculating…" : "Calculate Propagation Impact"}
                  </Button>
                ) : (
                  <RestrictedButton
                    label="Only Project Managers can calculate propagation impact"
                    variant="default"
                    size="default"
                  >
                    <Play className="h-4 w-4" />
                    Calculate Propagation Impact
                  </RestrictedButton>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Run the calculation to see the dependency ripple graph and schedule impact for this gap.
              </p>
            </>
          ) : (
            <>
              <div className="rounded-lg border border-status-confirmed-fg/30 bg-status-confirmed-bg/30 p-4">
                <p className="font-mono text-sm text-foreground">
                  {baseImpact}h × {gapTypeWeight.toFixed(2)} × {disruptionWeight.toFixed(2)} ×{" "}
                  {dependencyFactor.toFixed(2)} ={" "}
                  <span className="text-base font-bold text-status-confirmed-fg">≈ {scheduleImpact}h</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Estimated schedule impact for {gap.id}.</p>
              </div>

              <Separator />

              <DependencyRippleGraph gap={gap} />

              <div className="flex justify-end border-t border-border pt-4">
                <Button asChild variant="outline">
                  <Link to="../assessment">→ View Full Impact Assessment</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

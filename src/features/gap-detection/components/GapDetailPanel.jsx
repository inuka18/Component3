import { useNavigate } from "react-router-dom";
import { CheckCircle2, GitBranch, Brain } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetTitle,
  SheetDescription,
} from "../../../components/ui/sheet";
import { Skeleton } from "../../../components/ui/skeleton";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import { GapTypeBadge } from "./GapTypeBadge";
import { SeverityBadge } from "./SeverityBadge";
import { CausalChainView } from "./CausalChainView";
import { ComparisonPanel } from "./ComparisonPanel";
import { ResourceGapCard } from "./ResourceGapCard";
import { RestrictedButton } from "./RestrictedButton";
import { useGap } from "../../../hooks/useGaps";
import { getRequirementById } from "../../../data/mockRequirements";
import { getExecutionEvidenceByIds } from "../../../data/mockExecutionEvidence";
import { getResourceCapacityByMemberId } from "../../../data/mockResourceCapacity";
import { mockTasks } from "../../../data/mockSchedule";
import { resolveRefRoute } from "../../../lib/activityLinks";
import { formatDateTime } from "../../../lib/utils";

const STATUS_VARIANT = { Open: "warning", Reviewed: "info", Propagated: "success" };

export function GapDetailPanel({ gapId, open, onOpenChange, isPM, onMarkReviewed }) {
  const { data: gap, loading } = useGap(gapId);
  const navigate = useNavigate();

  const requirement = gap ? getRequirementById(gap.requirementId) : null;
  const evidence = gap ? getExecutionEvidenceByIds(gap.evidenceIds) : [];
  const tasks = gap ? (gap.taskIds ?? []).map((id) => mockTasks.find((t) => t.id === id)).filter(Boolean) : [];
  const capacity =
    gap?.type === "Resource" && gap.resourceMemberId
      ? getResourceCapacityByMemberId(gap.resourceMemberId, gap.projectId)
      : null;

  const goTo = (refType, refId) => {
    const route = resolveRefRoute(gap.projectId, refType, refId);
    if (route) {
      onOpenChange(false);
      navigate(route);
    }
  };

  const handlePropagate = () => {
    onOpenChange(false);
    navigate(`/projects/${gap.projectId}/gap-detection/propagation?gap=${gap.id}`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0">
        {loading || !gap ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-xs font-medium text-primary">{gap.id}</span>
                <GapTypeBadge type={gap.type} />
                <SeverityBadge severity={gap.severity} />
                <Badge variant={STATUS_VARIANT[gap.status]} className="text-[10px]">
                  {gap.status}
                </Badge>
              </div>
              <SheetTitle>{gap.title}</SheetTitle>
              <SheetDescription className="leading-relaxed text-foreground/90">
                {gap.description}
              </SheetDescription>
            </SheetHeader>

            <SheetBody className="scrollbar-thin">
              <dl className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Detected</dt>
                  <dd className="mt-1 font-medium text-foreground">{formatDateTime(gap.detectedAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Confidence</dt>
                  <dd className="mt-1 font-medium text-foreground">{gap.confidence}%</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Evidence</dt>
                  <dd className="mt-1 font-medium text-foreground">{gap.evidenceCount} records</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Change Type</dt>
                  <dd className="mt-1 font-medium text-foreground">{gap.changeType}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Disruption</dt>
                  <dd className="mt-1 font-medium text-foreground">{gap.disruptionType}</dd>
                </div>
                {gap.delayType && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Delay Type</dt>
                    <dd className="mt-1 font-medium text-foreground">{gap.delayType}</dd>
                  </div>
                )}
              </dl>

              <section className="mt-5">
                <h4 className="mb-2.5 text-sm font-semibold text-foreground">Linked Records</h4>
                <div className="flex flex-wrap gap-2">
                  {requirement && (
                    <button
                      onClick={() => goTo("requirement", requirement.id)}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                    >
                      <span className="font-mono text-primary">{requirement.id}</span>
                      <span className="truncate text-muted-foreground">· {requirement.title}</span>
                    </button>
                  )}
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => goTo("task", task.id)}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                    >
                      <span className="font-mono text-primary">{task.id}</span>
                      <span className="truncate text-muted-foreground">· {task.title}</span>
                    </button>
                  ))}
                  {tasks.length === 0 && (
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      No linked tasks
                    </span>
                  )}
                </div>
              </section>

              {capacity && (
                <>
                  <Separator className="my-6" />
                  <section>
                    <h4 className="mb-3 text-sm font-semibold text-foreground">Resource Capacity</h4>
                    <ResourceGapCard capacity={capacity} />
                  </section>
                </>
              )}

              <Separator className="my-6" />
              <section>
                <h4 className="mb-3 text-sm font-semibold text-foreground">Causal Chain</h4>
                <CausalChainView gap={gap} />
              </section>

              <Separator className="my-6" />
              <section>
                <h4 className="mb-3 text-sm font-semibold text-foreground">Semantic Comparison</h4>
                <ComparisonPanel requirement={requirement} evidence={evidence} gap={gap} />
              </section>

              <Separator className="my-6" />
              <section className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Brain className="h-4 w-4 text-primary" />
                  Classification
                </div>
                <dl className="mt-3 space-y-2 text-xs">
                  <div className="flex flex-wrap gap-1">
                    <dt className="font-medium text-foreground">Classifier:</dt>
                    <dd className="text-muted-foreground">XGBoost (scikit-learn)</dd>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <dt className="font-medium text-foreground">Training Data Source:</dt>
                    <dd className="text-muted-foreground">
                      Validated historical gap instances + project execution records
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 text-[11px] italic leading-relaxed text-muted-foreground/80">
                  Prototype inference shown using representative demo data.
                </p>
              </section>

              <Separator className="my-6" />
              <section className="flex flex-wrap items-center gap-2 pb-2">
                <Button variant="outline" size="sm" onClick={handlePropagate}>
                  <GitBranch className="h-4 w-4" />
                  Propagate Impact
                </Button>

                {gap.status === "Open" &&
                  (isPM ? (
                    <Button size="sm" onClick={() => onMarkReviewed(gap.id)}>
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Reviewed
                    </Button>
                  ) : (
                    <RestrictedButton label="Only Project Managers can mark a gap as reviewed" variant="default">
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Reviewed
                    </RestrictedButton>
                  ))}

                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </section>
            </SheetBody>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

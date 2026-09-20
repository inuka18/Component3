import { RotateCcw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { SeverityBadge } from "./SeverityBadge";
import { getGapById } from "../../../data/mockGaps";
import { getRequirementById } from "../../../data/mockRequirements";
import { getExecutionEvidenceByIds } from "../../../data/mockExecutionEvidence";
import { formatRelativeTime } from "../../../lib/utils";

// See the matching note in ForwardGapExplainer.jsx: only evidence that
// represents actually-delivered work counts as "execution activity".
function lastRealActivity(evidenceIds) {
  const WORK_SOURCES = new Set(["Task Update", "Code Commit", "Time Log Note"]);
  const real = getExecutionEvidenceByIds(evidenceIds).filter((e) => WORK_SOURCES.has(e.source));
  if (real.length === 0) return "None recorded";
  const latest = [...real].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  return formatRelativeTime(latest.date);
}

// exampleGapId defaults to a real Backward gap from the seed data so this
// card always has something concrete to point at.
export function BackwardGapExplainer({ exampleGapId = "gap-nc-03" }) {
  const gap = getGapById(exampleGapId);
  const requirement = gap ? getRequirementById(gap.requirementId) : null;

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-class-conflict-bg text-class-conflict-fg">
          <RotateCcw className="h-4.5 w-4.5" />
        </div>
        <CardTitle className="text-base">Backward Gap</CardTitle>
      </CardHeader>
      <CardContent>
        {gap && requirement && (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm font-semibold text-foreground">
              <span className="font-mono text-primary">{requirement.id}</span> · {requirement.title}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Evidence Count</dt>
                <dd className="mt-0.5 font-medium text-foreground">{gap.evidenceCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Linked Tasks</dt>
                <dd className="mt-0.5 font-medium text-foreground">{gap.taskIds.length}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Last Execution Activity</dt>
                <dd className="mt-0.5 font-medium text-foreground">{lastRealActivity(gap.evidenceIds)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Severity</dt>
                <dd className="mt-0.5">
                  <SeverityBadge severity={gap.severity} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Confidence</dt>
                <dd className="mt-0.5 font-medium text-foreground">{gap.confidence}%</dd>
              </div>
            </dl>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

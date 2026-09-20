import { FileStack, Radar, Percent } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { StatusBadge } from "../../requirements/components/StatusBadge";
import { mockGaps } from "../../../data/mockGaps";
import { formatRelativeTime } from "../../../lib/utils";

// A requirement with a detected gap on record diverges from execution
// reality by definition, so alignment tracks inversely with how
// confidently that gap was detected. A requirement with evidence and no
// gap on record is treated as consistent, scaled slightly by how much
// evidence backs it. This is a display heuristic for the prototype, not a
// real semantic-similarity model.
function computeSemanticAlignment(evidenceCount, gap) {
  if (evidenceCount === 0) return { score: 0, tier: "none", label: "No Evidence", variant: "outline" };
  if (gap) {
    const score = Math.max(28, 58 - Math.round(gap.confidence / 4));
    return score >= 35
      ? { score, tier: "partial", label: "Partial Match", variant: "warning" }
      : { score, tier: "low", label: "Misaligned", variant: "danger" };
  }
  const score = Math.min(97, 82 + evidenceCount * 3);
  return { score, tier: "strong", label: "Strong Match", variant: "success" };
}

// The core "semantic comparison" visual: approved requirement text on the
// left, the execution-evidence records that were compared against it on
// the right, plus the alignment score the comparison produced. Used on the
// Workspace page (both the interactive picker and the example showcase)
// and inside GapDetailPanel scoped to one gap's evidence.
export function ComparisonPanel({ requirement, evidence, gap }) {
  if (!requirement) {
    return (
      <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
        Select a requirement to compare it against execution evidence.
      </div>
    );
  }

  // A requirement can be the subject of more than one gap (e.g. both a
  // Backward and a Resource gap), callers that already know exactly which
  // gap they're showing (GapDetailPanel) pass it explicitly; the Workspace
  // page's picker/showcase, which has no single "current gap", falls back
  // to the first one on record for that requirement.
  const resolvedGap = gap ?? mockGaps.find((g) => g.requirementId === requirement.id);
  const alignment = computeSemanticAlignment(evidence.length, resolvedGap);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3.5 py-2.5">
        <div className="flex items-center gap-2 text-sm">
          <Percent className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Semantic Alignment:</span>
          <span className="font-semibold text-foreground">{alignment.score}%</span>
        </div>
        <Badge variant={alignment.variant} className="text-[10px]">
          {alignment.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <FileStack className="h-3.5 w-3.5" />
            Formal Requirement
          </div>
          <p className="font-mono text-xs font-medium text-primary">{requirement.id}</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{requirement.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">{requirement.description}</p>
          <div className="mt-3 flex items-center gap-2">
            <StatusBadge status={requirement.liveStatus} />
            <span className="text-xs text-muted-foreground">{requirement.resourceRole}</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Radar className="h-3.5 w-3.5" />
            Execution Evidence
          </div>
          {evidence.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No execution evidence found for this requirement yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {evidence.map((e) => (
                <li key={e.id} className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{e.author}</span>
                    <span>
                      {e.source} · {formatRelativeTime(e.date)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">"{e.text}"</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

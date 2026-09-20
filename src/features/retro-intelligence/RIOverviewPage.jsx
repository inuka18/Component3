import { Link } from "react-router-dom";
import { GitCompareArrows, AlertTriangle, ListChecks, FileClock, BadgeCheck, Clock3, Repeat2, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { MatchScoreBadge } from "./components/MatchScoreBadge";
import { useCrossValidation } from "../../hooks/useCrossValidation";
import { useActions } from "../../hooks/useActions";
import { useProjectEvidence } from "../../hooks/useProjectEvidence";
import { useActiveProject } from "../../hooks/useActiveProject";
import { getDisplayStatus } from "../../data/mockActions";
import { cn } from "../../lib/utils";

function KpiTile({ label, value, icon: Icon, highlight }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <p className={cn("text-lg font-bold leading-none text-foreground", highlight)}>{value}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function RIOverviewPage() {
  const { activeProjectId } = useActiveProject();
  const { data: crossValidation, loading: cvLoading } = useCrossValidation(activeProjectId);
  const { data: actions, loading: actionsLoading } = useActions(activeProjectId);
  const { data: evidence, loading: evidenceLoading } = useProjectEvidence(activeProjectId);
  const loading = cvLoading || actionsLoading || evidenceLoading;

  const displayStatuses = actions.map((a) => getDisplayStatus(a));

  const kpis = [
    { label: "Cross-Validations Run", value: crossValidation.length, icon: GitCompareArrows },
    { label: "Mismatches Flagged", value: crossValidation.filter((cv) => cv.semanticScore < 75).length, icon: AlertTriangle },
    {
      label: "Active Actions",
      value: displayStatuses.filter((s) => ["Open", "In Progress", "Evidence Submitted"].includes(s)).length,
      icon: ListChecks,
    },
    { label: "Evidence Pending", value: evidence.filter((e) => e.status === "Pending Review").length, icon: FileClock },
    { label: "Verified Actions", value: displayStatuses.filter((s) => s === "Verified").length, icon: BadgeCheck },
    {
      label: "Overdue Actions",
      value: displayStatuses.filter((s) => s === "Overdue").length,
      icon: Clock3,
      highlight: "text-status-dropped-fg",
    },
    { label: "Recurring Issues", value: actions.filter((a) => a.recurrenceFlag).length, icon: Repeat2 },
  ];

  const recentMismatches = [...crossValidation]
    .filter((cv) => cv.status === "Pending")
    .sort((a, b) => new Date(b.loggedDate) - new Date(a.loggedDate))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {loading
          ? Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-[4.5rem] w-full rounded-xl" />)
          : kpis.map((kpi) => <KpiTile key={kpi.label} {...kpi} />)}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">Recent Mismatches</CardTitle>
            <CardDescription>The most recently flagged, still-pending cross-validation entries.</CardDescription>
          </div>
          <Link to="../cross-validation" className="shrink-0 text-xs font-medium text-primary hover:underline">
            View All
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)
          ) : recentMismatches.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No pending mismatches, everything's been reconciled.</p>
          ) : (
            recentMismatches.map((cv) => (
              <div key={cv.id} className="rounded-lg border border-border p-3.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Logged: <span className="font-medium text-foreground">{cv.structuredCode}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      NLP-extracted: <span className="font-medium text-foreground">{cv.nlpExtractedCause}</span>
                    </p>
                  </div>
                  <MatchScoreBadge score={cv.semanticScore} className="shrink-0" />
                </div>
                <Link
                  to={`../cross-validation?cv=${cv.id}`}
                  className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Review
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

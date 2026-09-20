import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HelpCircle, GitCompareArrows, Link2, Unlink, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import { AlignmentTrendChart } from "./components/AlignmentTrendChart";
import { ClassificationBadge } from "./components/ClassificationBadge";
import { useAlignmentHistory } from "../../hooks/useAlignmentHistory";
import { useActiveProject } from "../../hooks/useActiveProject";
import { getWeeklyAlignmentBreakdown } from "../../data/mockAlignmentHistory";
import { getSignalById } from "../../data/mockSignals";
import { formatDateTime, cn } from "../../lib/utils";

function getAlignmentStatus(score) {
  if (score >= 80) return { label: "Strong Alignment", tone: "text-status-confirmed-fg", bg: "bg-status-confirmed-bg" };
  if (score >= 60) return { label: "Moderate Drift", tone: "text-status-atrisk-fg", bg: "bg-status-atrisk-bg" };
  return { label: "Significant Drift", tone: "text-status-dropped-fg", bg: "bg-status-dropped-bg" };
}

function StatTile({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function AlignmentScorePage() {
  const { activeProjectId } = useActiveProject();
  const { data: history, loading } = useAlignmentHistory(activeProjectId);
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);

  // Defaults to the most recent signal-linked dip once history loads, so
  // the drill-down isn't empty on first paint, clicking any other dip
  // marker on the chart swaps it out.
  useEffect(() => {
    if (loading || history.length === 0) return;
    const lastDip = [...history].reverse().find((d) => d.driverSignalId);
    setSelectedDate(lastDip?.date ?? null);
  }, [loading, history]);

  const current = history[history.length - 1] ?? null;
  const status = current ? getAlignmentStatus(current.alignmentScore) : null;
  const breakdown = activeProjectId ? getWeeklyAlignmentBreakdown(activeProjectId) : { changedConnections: 0, connectionsAdded: 0, connectionsRemoved: 0 };

  const selectedEntry = history.find((d) => d.date === selectedDate) ?? null;
  const drivingSignal = selectedEntry?.driverSignalId ? getSignalById(selectedEntry.driverSignalId) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center">
          {loading || !current ? (
            <Skeleton className="h-20 w-40" />
          ) : (
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Alignment Score</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground/70 hover:text-foreground">
                        <HelpCircle className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      How closely your requirements documentation matches what's actually being discussed and built.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className={cn("text-5xl font-bold leading-tight", status.tone)}>{current.alignmentScore}%</p>
              </div>
              <Badge className={cn("gap-1.5 text-xs font-semibold", status.bg, status.tone, "border-transparent")}>
                {status.label}
              </Badge>
            </div>
          )}

          <div className="flex-1" />

          {!loading && (
            <div className="grid grid-cols-3 gap-3 sm:w-auto">
              <StatTile label="Relationship changes this week" value={breakdown.changedConnections} icon={GitCompareArrows} />
              <StatTile label="Newly connected" value={breakdown.connectionsAdded} icon={Link2} />
              <StatTile label="Disconnected" value={breakdown.connectionsRemoved} icon={Unlink} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trend: last {history.length || "…"} days</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <AlignmentTrendChart history={history} selectedDate={selectedDate} onSelectPoint={(d) => setSelectedDate(d.date)} />
          )}
        </CardContent>
      </Card>

      {!loading && selectedEntry && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {drivingSignal ? "What drove the drop" : "No driving signal recorded"}:{" "}
              {new Date(`${selectedEntry.date}T00:00:00+05:30`).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {drivingSignal ? (
              <div className="space-y-3 rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <ClassificationBadge classification={drivingSignal.classification} />
                  <span className="text-xs text-muted-foreground">{formatDateTime(drivingSignal.timestamp)}</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">"{drivingSignal.text}"</p>
                <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">
                    {drivingSignal.author} · {drivingSignal.channel}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => navigate(`/projects/${activeProjectId}/requirements/list?tab=signals&signal=${drivingSignal.id}`)}
                  >
                    View in Signal Feed
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                This day's relationship changes weren't traced to a single signal.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { Link } from "react-router-dom";
import {
  Radar,
  ListChecks,
  TrendingUp,
  RotateCcw,
  Users2,
  AlertTriangle,
  Boxes,
  Gauge,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { GapTypeBadge } from "./components/GapTypeBadge";
import { ModelHealthCard } from "./components/ModelHealthCard";
import { useGapOverview } from "../../hooks/useGapOverview";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useRole, ROLES } from "../../context/RoleContext";
import { formatRelativeTime, cn } from "../../lib/utils";

const KPI_CONFIG = [
  { key: "requirementsTracked", label: "Requirements Tracked", icon: ListChecks, format: (v) => v },
  { key: "executionCoveragePct", label: "Execution Coverage", icon: Gauge, format: (v) => `${v}%` },
  { key: "forwardGaps", label: "Forward Gaps", icon: TrendingUp, format: (v) => v },
  { key: "backwardGaps", label: "Backward Gaps", icon: RotateCcw, format: (v) => v },
  { key: "resourceGaps", label: "Resource Gaps", icon: Users2, format: (v) => v },
  { key: "highSeverityGaps", label: "High-Severity Gaps", icon: AlertTriangle, format: (v) => v },
  { key: "affectedTasks", label: "Affected Tasks", icon: Boxes, format: (v) => v },
  { key: "sprintRisk", label: "Sprint Risk", icon: Radar, format: (v) => v },
];

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

export function GapOverviewPage() {
  const { activeProjectId } = useActiveProject();
  const { role } = useRole();
  const isPM = role === ROLES.PM;
  const { metrics, modelHealth, setModelHealth, loading } = useGapOverview(activeProjectId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {loading || !metrics
          ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[4.5rem] w-full rounded-xl" />)
          : KPI_CONFIG.map(({ key, label, icon, format }) => (
              <KpiTile
                key={key}
                label={label}
                icon={icon}
                value={format(metrics[key])}
                highlight={key === "sprintRisk" ? riskTextClass(metrics.sprintRisk) : undefined}
              />
            ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="text-base">Recent Gap Alerts</CardTitle>
                <CardDescription>The highest-severity gaps detected across this project.</CardDescription>
              </div>
              <Link
                to="../inventory"
                className="shrink-0 text-xs font-medium text-primary hover:underline"
              >
                View All Alerts
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading || !metrics
                ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)
                : metrics.alerts.length === 0
                ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">No gaps detected yet.</p>
                  )
                : metrics.alerts.map((gap) => (
                    <div key={gap.id} className="rounded-lg border border-border p-3.5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <GapTypeBadge type={gap.type} short />
                            <span className="text-xs text-muted-foreground">
                              {gap.requirement ? `${gap.requirement.id} · ${gap.requirement.title}` : gap.requirementId}
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm font-medium leading-snug text-foreground">{gap.title}</p>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                            {gap.impactSummary}
                          </p>
                        </div>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {formatRelativeTime(gap.detectedAt)}
                        </span>
                      </div>
                      <Link
                        to={`../inventory?gap=${gap.id}`}
                        className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        View Gap
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-2">
          <ModelHealthCard modelHealth={modelHealth} onModelHealthChange={setModelHealth} isPM={isPM} />
        </div>
      </div>
    </div>
  );
}

function riskTextClass(risk) {
  if (risk === "High") return "text-status-dropped-fg";
  if (risk === "Medium") return "text-status-atrisk-fg";
  return "text-status-confirmed-fg";
}

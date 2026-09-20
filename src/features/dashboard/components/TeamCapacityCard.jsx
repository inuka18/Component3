import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Skeleton } from "../../../components/ui/skeleton";
import { cn } from "../../../lib/utils";

function capacityColor(pct) {
  if (pct > 100) return "bg-status-dropped-fg";
  if (pct >= 80) return "bg-status-atrisk-fg";
  return "bg-status-confirmed-fg";
}

export function TeamCapacityCard({ groups, loading, isPM }) {
  const rows = groups.flatMap((g) =>
    g.rows.map((r) => ({ ...r, projectName: g.project.name, projectColor: g.project.colorTag }))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isPM ? "Team Capacity" : "Your Workload"}</CardTitle>
        <CardDescription>
          {isPM
            ? "Who's over- and under-allocated across every project you manage."
            : "Your current workload across your projects."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {!loading && rows.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">No workload data yet.</p>
        )}

        {!loading && rows.length > 0 && (
          <div className="max-h-80 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8 shrink-0 text-[11px]">
                  <AvatarFallback>{r.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">{r.name}</span>
                    <span className="shrink-0 text-xs font-semibold text-foreground">{r.workloadPercent}%</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full transition-all", capacityColor(r.workloadPercent))}
                        style={{ width: `${Math.min(r.workloadPercent, 100)}%` }}
                      />
                    </div>
                    {isPM && (
                      <span className="shrink-0 text-[11px] text-muted-foreground">{r.projectName}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

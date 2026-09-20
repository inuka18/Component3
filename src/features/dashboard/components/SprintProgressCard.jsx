import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { formatDateTime } from "../../../lib/utils";

export function SprintProgressCard({ sprints, loading, isPM }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sprints</CardTitle>
        <CardDescription>
          {isPM ? "Progress across every project you manage." : "Progress on sprints you're part of."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {!loading && sprints.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">No active sprints.</p>
        )}

        {!loading && sprints.length > 0 && (
          <div className="space-y-4">
            {sprints.map((s) => (
              <Link
                key={s.project.id}
                to={`/projects/${s.project.id}/schedule`}
                className="block rounded-lg border border-border p-3 transition-colors hover:border-primary/40 hover:bg-accent/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.project.colorTag }} />
                    {s.project.name}
                  </span>
                  <span className="text-xs font-semibold text-foreground">{s.progressPct}%</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{s.sprintName}</p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${s.progressPct}%` }} />
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {s.done}/{s.total} tasks complete · through {formatDateTime(s.sprintEnd)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

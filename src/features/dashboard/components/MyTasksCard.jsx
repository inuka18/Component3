import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { KANBAN_COLUMNS } from "../../../data/mockSchedule";

const COLUMN_LABEL = Object.fromEntries(KANBAN_COLUMNS.map((c) => [c.id, c.label]));

export function MyTasksCard({ tasks, loading, projectId }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Tasks</CardTitle>
        <CardDescription>What's currently assigned to you on this project.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {!loading && tasks.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No tasks assigned to you on this project yet.
          </p>
        )}

        {!loading && tasks.length > 0 && (
          <ul className="space-y-2.5">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{t.title}</span>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {COLUMN_LABEL[t.column] ?? t.column}
                </Badge>
              </li>
            ))}
          </ul>
        )}

        <Link
          to={`/projects/${projectId}/schedule`}
          className="mt-4 inline-block text-xs font-medium text-primary hover:underline"
        >
          View full board →
        </Link>
      </CardContent>
    </Card>
  );
}

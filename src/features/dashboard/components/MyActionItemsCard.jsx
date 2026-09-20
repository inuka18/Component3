import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { getDisplayStatus } from "../../../data/mockActions";
import { SPRINT_LABELS } from "../../../data/mockCrossValidation";

const STATUS_VARIANT = {
  Open: "outline",
  "In Progress": "info",
  "Evidence Submitted": "warning",
  Verified: "success",
  Overdue: "danger",
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Real, tracked actions: the same records the Action Tracker board and
// the Retrospectives tab both read, just filtered to the ones assigned to
// the logged-in member. Clicking one opens it straight in the Action
// Tracker for the real evidence-submission flow, rather than a
// simplified checkbox here.
export function MyActionItemsCard({ items, loading, projectId }) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Action Items</CardTitle>
        <CardDescription>Actions assigned to you, from retrospectives and reconciled causes.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No open action items assigned to you.
          </p>
        )}

        {!loading && items.length > 0 && (
          <ul className="space-y-2.5">
            {items.map((action) => {
              const status = getDisplayStatus(action);
              return (
                <li key={action.id}>
                  <button
                    onClick={() => navigate(`/projects/${projectId}/retro-intelligence/actions?action=${action.id}`)}
                    className="flex w-full items-start gap-2.5 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug text-foreground">{action.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {SPRINT_LABELS[action.targetSprintId]?.name ?? action.targetSprintId} · due {formatDate(action.dueDate)}
                      </p>
                    </div>
                    <Badge variant={STATUS_VARIANT[status] ?? "outline"} className="shrink-0 text-[10px]">
                      {status}
                    </Badge>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <Link
          to={`/projects/${projectId}/retro-intelligence/actions`}
          className="mt-4 inline-block text-xs font-medium text-primary hover:underline"
        >
          View Action Tracker →
        </Link>
      </CardContent>
    </Card>
  );
}

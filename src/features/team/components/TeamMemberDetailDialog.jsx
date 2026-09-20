import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { Skeleton } from "../../../components/ui/skeleton";
import { ACTIVITY_TYPE_CONFIG } from "../../dashboard/components/ActivityFeed";
import { KANBAN_COLUMNS } from "../../../data/mockSchedule";
import { getDisplayStatus } from "../../../data/mockActions";
import { formatRelativeTime, cn } from "../../../lib/utils";

const COLUMN_LABEL = Object.fromEntries(KANBAN_COLUMNS.map((c) => [c.id, c.label]));

const ACTION_STATUS_VARIANT = {
  Open: "outline",
  "In Progress": "info",
  "Evidence Submitted": "warning",
  Verified: "success",
  Overdue: "danger",
};

function capacityColor(pct) {
  if (pct > 100) return "bg-status-dropped-fg";
  if (pct >= 80) return "bg-status-atrisk-fg";
  return "bg-status-confirmed-fg";
}

// Full task list is shown when the viewer is a PM, or when viewing their
// own card. A Team Member looking at a teammate's card gets identity +
// workload only, not the detailed task breakdown. Projects and activity
// span every project this person is staffed on, not just the one the
// Team page is currently scoped to.
export function TeamMemberDetailDialog({
  member,
  tasks,
  open,
  onOpenChange,
  canSeeTasks,
  profile,
  profileLoading,
}) {
  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 text-sm">
              <AvatarFallback>{member.initials}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>{member.name}</DialogTitle>
              <DialogDescription>{member.jobTitle}</DialogDescription>
            </div>
            {member.appRole === "pm" && (
              <Badge variant="secondary" className="ml-auto shrink-0 text-[10px]">
                PM
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Workload</span>
            <span className="font-medium text-foreground">{member.workloadPercent}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all", capacityColor(member.workloadPercent))}
              style={{ width: `${Math.min(member.workloadPercent, 100)}%` }}
            />
          </div>
          {member.email && <p className="text-xs text-muted-foreground">{member.email}</p>}
        </div>

        <Separator />

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Projects</p>
          {profileLoading ? (
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          ) : profile.projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not staffed on any projects.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {profile.projects.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: p.colorTag }} />
                  {p.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {canSeeTasks ? (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Assigned Tasks ({tasks.length})
            </p>
            {tasks.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No tasks assigned.</p>
            ) : (
              <ul className="max-h-64 space-y-2 overflow-y-auto scrollbar-thin">
                {tasks.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">{t.title}</span>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {COLUMN_LABEL[t.column] ?? t.column}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-2.5 rounded-lg border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Task details are only visible to {member.name.split(" ")[0]} and Project Managers.
          </div>
        )}

        <Separator />

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Action Items
          </p>
          {profileLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : profile.actionItems.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No action items assigned to {member.name.split(" ")[0]}.
            </p>
          ) : (
            <ul className="space-y-2">
              {profile.actionItems.map((a) => {
                const status = getDisplayStatus(a);
                return (
                  <li key={a.id}>
                    <Link
                      to={`/projects/${a.projectId}/retro-intelligence/actions?action=${a.id}`}
                      className="flex items-start gap-2.5 rounded-lg border border-border p-2.5 transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground">{a.title}</p>
                      </div>
                      <Badge variant={ACTION_STATUS_VARIANT[status] ?? "outline"} className="shrink-0 text-[10px]">
                        {status}
                      </Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <Separator />

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Recent Activity
          </p>
          {profileLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
                  <Skeleton className="h-3.5 flex-1" />
                </div>
              ))}
            </div>
          ) : profile.activity.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No recent activity from {member.name.split(" ")[0]}.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {profile.activity.map((item) => {
                const config = ACTIVITY_TYPE_CONFIG[item.type] ?? ACTIVITY_TYPE_CONFIG["task-move"];
                const Icon = config.icon;
                return (
                  <li key={item.id} className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                        config.className
                      )}
                    >
                      <Icon className="h-3 w-3" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="mb-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.projectColor }} />
                        {item.projectName}
                      </span>
                      <p className="text-sm leading-snug text-foreground">{item.message}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatRelativeTime(item.timestamp)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { flattenTasks, statusBadgeVariant, statusLabel } from "../lib/scheduleUtils";
import { cn } from "../../../lib/utils";

const CAPACITY_VARIANT = {
  "Over-allocated": "danger",
  "Near Capacity": "warning",
  Balanced: "success",
  "Under-utilized": "info",
};

export function ResourceProfileModal({ capacity, phases, open, onOpenChange, onSelectTask }) {
  if (!capacity) return null;
  const ratioPct = Math.round((capacity.plannedHours / capacity.availableHours) * 100);
  const myTasks = flattenTasks(phases).filter((t) => t.assigneeId === capacity.memberId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              <AvatarFallback>
                {capacity.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>{capacity.name}</DialogTitle>
              <DialogDescription>{capacity.role}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <span className="text-muted-foreground">
              {capacity.plannedHours}h planned / {capacity.availableHours}h available
            </span>
            <Badge variant={CAPACITY_VARIANT[capacity.status] ?? "outline"}>{capacity.status}</Badge>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", ratioPct > 100 ? "bg-status-dropped-fg" : ratioPct >= 85 ? "bg-status-atrisk-fg" : "bg-status-confirmed-fg")}
              style={{ width: `${Math.min(ratioPct, 100)}%` }}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Scheduled Tasks ({myTasks.length})
            </p>
            {myTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scheduled tasks for this person.</p>
            ) : (
              <ul className="space-y-1.5">
                {myTasks.map((task) => (
                  <li key={task.id}>
                    <button
                      onClick={() => onSelectTask?.(task)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <span className="truncate text-foreground">{task.name}</span>
                      <Badge variant={statusBadgeVariant(task)} className="shrink-0 text-[10px]">
                        {statusLabel(task)}
                      </Badge>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

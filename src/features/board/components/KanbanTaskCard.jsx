import { Flag } from "lucide-react";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { getTeamMemberById } from "../../../data/mockTeam";
import { causeStyle } from "../../../lib/taskStatus";
import { cn } from "../../../lib/utils";

function initialsFor(name) {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase();
}

// One card on the Kanban board. `draggable` is decided by the caller
// (PM, or the current Team Member persona is the assignee), everyone
// can still click a card open to view it, draggable or not.
export function KanbanTaskCard({ task, draggable, isDragging, onClick, onDragStart, onDragEnd }) {
  const assignee = getTeamMemberById(task.assigneeId);
  const cause = task.cause ? causeStyle(task.cause.type) : null;

  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-2 rounded-lg border border-border bg-card p-3 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5",
        draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        isDragging && "opacity-40"
      )}
    >
      <p className="line-clamp-2 text-sm font-medium text-foreground">{task.name}</p>

      <div className="flex flex-wrap items-center gap-1.5">
        {task.critical && (
          <span title="Critical path" className="flex shrink-0 items-center">
            <Flag className="h-3 w-3 text-status-dropped-fg" />
          </span>
        )}
        {typeof task.storyPoints === "number" && task.storyPoints > 0 && (
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {task.storyPoints} pts
          </Badge>
        )}
        {cause && (
          <Badge variant={cause.badgeVariant} className="shrink-0 text-[10px]">
            {cause.label}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-mono text-[10px] text-muted-foreground">{task.id}</span>
        {assignee && (
          <Avatar className="h-6 w-6 shrink-0 text-[9px]" title={assignee.name}>
            <AvatarFallback>{initialsFor(assignee.name)}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </button>
  );
}

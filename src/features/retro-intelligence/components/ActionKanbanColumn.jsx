import { useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { ActionCard } from "./ActionCard";
import { cn } from "../../../lib/utils";

// Same native HTML5 drag-and-drop pattern as the Kanban Board's own
// KanbanColumn. A card only needs a drop *target column* here too.
// `canDropHere` lets the page veto a column as a target outright (e.g.
// "Overdue" is never a valid drop target, it's computed, not settable,
// and a Team Member can't drop into "Verified").
export function ActionKanbanColumn({ status, actions, projectId, draggedActionId, canDrag, canDropHere, onSelectAction, onDrop, onDragStart, onDragEnd, accentClassName }) {
  const [isOver, setIsOver] = useState(false);
  const dropAllowed = canDropHere(status);

  return (
    <div
      onDragOver={(e) => {
        if (!dropAllowed) return;
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        if (!dropAllowed) return;
        const actionId = e.dataTransfer.getData("text/plain");
        onDrop(status, actionId);
      }}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border bg-muted/20 transition-colors",
        isOver ? "border-primary bg-primary/5" : "border-border"
      )}
    >
      <div className={cn("flex items-center justify-between rounded-t-xl border-b border-border px-3 py-2.5", accentClassName)}>
        <p className="text-sm font-semibold text-foreground">{status}</p>
        <Badge variant="secondary" className="text-[10px]">
          {actions.length}
        </Badge>
      </div>

      <div className="min-h-[8rem] flex-1 space-y-2 overflow-y-auto p-2.5 scrollbar-thin">
        {actions.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">No actions</p>
        ) : (
          actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              displayStatus={status}
              projectId={projectId}
              draggable={canDrag(action)}
              isDragging={draggedActionId === action.id}
              onClick={() => onSelectAction(action)}
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", action.id);
                e.dataTransfer.effectAllowed = "move";
                onDragStart(action.id);
              }}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { KanbanTaskCard } from "./KanbanTaskCard";
import { cn } from "../../../lib/utils";

// One column: a native HTML5 drag-and-drop target (onDragOver/onDrop),
// not pointer-event math like the Gantt's continuous bar dragging in
// Component 3: a Kanban card only ever needs a drop *target column*, not
// a precise pixel position, so the simpler native API is the right tool
// here.
export function KanbanColumn({ status, label, tasks, draggedTaskId, canDrag, onSelectTask, onDrop, onDragStart, onDragEnd }) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        const taskId = e.dataTransfer.getData("text/plain");
        onDrop(status, taskId);
      }}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border bg-muted/20 transition-colors",
        isOver ? "border-primary bg-primary/5" : "border-border"
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <Badge variant="secondary" className="text-[10px]">
          {tasks.length}
        </Badge>
      </div>

      <div className="min-h-[8rem] flex-1 space-y-2 overflow-y-auto p-2.5 scrollbar-thin">
        {tasks.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">No tasks</p>
        ) : (
          tasks.map((task) => (
            <KanbanTaskCard
              key={task.id}
              task={task}
              draggable={canDrag(task)}
              isDragging={draggedTaskId === task.id}
              onClick={() => onSelectTask(task)}
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", task.id);
                e.dataTransfer.effectAllowed = "move";
                onDragStart(task.id);
              }}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
}

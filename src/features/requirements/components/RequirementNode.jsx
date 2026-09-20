import { memo } from "react";
import { Handle, Position } from "reactflow";
import { cn } from "../../../lib/utils";

const STATUS_DOT = {
  Confirmed: "bg-status-confirmed-fg",
  "At Risk": "bg-status-atrisk-fg",
  Modified: "bg-status-modified-fg",
  Dropped: "bg-status-dropped-fg",
};

const STATUS_BORDER = {
  Confirmed: "border-l-status-confirmed-fg",
  "At Risk": "border-l-status-atrisk-fg",
  Modified: "border-l-status-modified-fg",
  Dropped: "border-l-status-dropped-fg",
};

function RequirementNodeImpl({ data, selected }) {
  const { requirement } = data;
  return (
    <div
      className={cn(
        "w-[200px] rounded-lg border border-l-4 bg-card px-3 py-2.5 shadow-sm transition-shadow",
        STATUS_BORDER[requirement.liveStatus],
        selected ? "ring-2 ring-primary shadow-md" : "hover:shadow-md"
      )}
    >
      <Handle type="target" position={Position.Top} className="!h-1.5 !w-1.5 !bg-border !border-0" />
      <div className="flex items-center gap-1.5">
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[requirement.liveStatus])} />
        <span className="font-mono text-[10px] font-semibold text-muted-foreground">
          {requirement.id}
        </span>
      </div>
      <p className="mt-1 line-clamp-2 text-xs font-medium leading-snug text-foreground">
        {requirement.title}
      </p>
      <Handle type="source" position={Position.Bottom} className="!h-1.5 !w-1.5 !bg-border !border-0" />
    </div>
  );
}

export const RequirementNode = memo(RequirementNodeImpl);

import { cn } from "../../../lib/utils";

export function ConfidenceMeter({ value }) {
  const color =
    value >= 85 ? "bg-status-confirmed-fg" : value >= 65 ? "bg-status-atrisk-fg" : "bg-muted-foreground";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium text-muted-foreground">{value}% confidence</span>
    </div>
  );
}

import { Database, Minus, Equal } from "lucide-react";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../lib/utils";

const STATUS_VARIANT = {
  "Over-allocated": "danger",
  "Near Capacity": "warning",
  Balanced: "success",
  "Under-utilized": "info",
};

function barColor(pct) {
  if (pct > 100) return "bg-status-dropped-fg";
  if (pct >= 85) return "bg-status-atrisk-fg";
  return "bg-status-confirmed-fg";
}

function initialsFor(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Visualizes one person's sprint capacity: planned vs available hours,
// the resulting deficit/surplus, and what's actually been logged so far.
// The Planned/Available numbers originate from Component 4's time-log
// records (see mockResourceCapacity.js), which is called out explicitly
// since a Resource gap is, by definition, a Component 4 dependency.
export function ResourceGapCard({ capacity, className }) {
  if (!capacity) return null;
  const deficit = capacity.plannedHours - capacity.availableHours;
  const ratioPct = Math.round((capacity.plannedHours / capacity.availableHours) * 100);
  const loggedPct = Math.round((capacity.loggedHours / capacity.availableHours) * 100);

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 text-xs">
          <AvatarFallback>{initialsFor(capacity.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{capacity.name}</p>
          <p className="truncate text-xs text-muted-foreground">{capacity.role}</p>
        </div>
        <Badge variant={STATUS_VARIANT[capacity.status] ?? "outline"} className="shrink-0 text-[10px]">
          {capacity.status}
        </Badge>
      </div>

      {/* The Planned − Available = Deficit calculation, shown as an actual
          equation rather than just a summary number, since this is the
          exact arithmetic a Resource gap is detected from. */}
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 py-3 text-center">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Planned</p>
          <p className="text-sm font-semibold text-foreground">{capacity.plannedHours}h</p>
        </div>
        <Minus className="mx-auto h-3.5 w-3.5 text-muted-foreground/60" />
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Available</p>
          <p className="text-sm font-semibold text-foreground">{capacity.availableHours}h</p>
        </div>
        <Equal className="mx-auto h-3.5 w-3.5 text-muted-foreground/60" />
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Deficit</p>
          <p
            className={cn(
              "text-sm font-semibold",
              deficit > 0 ? "text-status-dropped-fg" : deficit < 0 ? "text-status-confirmed-fg" : "text-foreground"
            )}
          >
            {deficit > 0 ? "+" : ""}
            {deficit}h
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Availability ratio (planned / available)</span>
          <span className="font-medium text-foreground">{ratioPct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full rounded-full transition-all", barColor(ratioPct))} style={{ width: `${Math.min(ratioPct, 100)}%` }} />
        </div>
      </div>

      <div className="mt-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Logged so far</span>
          <span className="font-medium text-foreground">{capacity.loggedHours}h ({loggedPct}%)</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary/50 transition-all" style={{ width: `${Math.min(loggedPct, 100)}%` }} />
        </div>
      </div>

      <p className="mt-3 flex items-center gap-1.5 border-t border-border pt-2.5 text-[11px] text-muted-foreground">
        <Database className="h-3 w-3" />
        Source: Time Logs
      </p>
    </div>
  );
}

import { ListChecks, CheckCircle2, AlertTriangle, Users2 } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { cn } from "../../../lib/utils";

// The one quick-stat row shared by Day/Week/Sprint: tasks / on-track /
// delayed / people involved, for whatever window that page is scoped to.
export function ScheduleStatRow({ tasks, onTrackCount, delayedCount, peopleCount }) {
  const total = tasks.length;
  const onTrack = onTrackCount ?? total - delayedCount;

  const stats = [
    { label: "Tasks", value: total, icon: ListChecks, accentClass: "bg-primary/10 text-primary" },
    { label: "On Track", value: onTrack, icon: CheckCircle2, accentClass: "bg-status-confirmed-bg text-status-confirmed-fg" },
    { label: "Delayed", value: delayedCount, icon: AlertTriangle, accentClass: "bg-status-dropped-bg text-status-dropped-fg" },
    { label: "People Involved", value: peopleCount, icon: Users2, accentClass: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, accentClass }) => (
        <Card key={label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", accentClass)}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold leading-none text-foreground">{value}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

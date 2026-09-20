import { CalendarClock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { formatDateTime } from "../../../lib/utils";

export function UpcomingMeetingsCard({ meetings, loading, isPM }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Meetings</CardTitle>
        <CardDescription>
          {isPM ? "Across every project you manage." : "Meetings you're invited to."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {!loading && meetings.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {isPM ? "No upcoming meetings scheduled." : "You have no upcoming meetings."}
          </p>
        )}

        {!loading && meetings.length > 0 && (
          <ul className="space-y-3">
            {meetings.map((m) => (
              <li key={m.id} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CalendarClock className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="mb-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.projectColor }} />
                    {m.projectName}
                  </span>
                  <p className="truncate text-sm font-medium text-foreground">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(m.dateTime)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

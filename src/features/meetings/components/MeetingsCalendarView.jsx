import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { formatTime, cn } from "../../../lib/utils";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_VISIBLE_PER_DAY = 3;

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// Month-grid calendar. Meetings are plotted on their scheduled date as
// small clickable chips, clicking one opens the same MeetingDetailDialog
// the list view uses, via the shared onSelectMeeting callback.
export function MeetingsCalendarView({ meetings, onSelectMeeting }) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const today = useMemo(() => new Date(), []);

  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const days = useMemo(() => {
    const firstOfMonth = startOfMonth(cursor);
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(gridStart.getDate() - firstOfMonth.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + i);
      return date;
    });
  }, [cursor]);

  const meetingsByDay = useMemo(() => {
    const map = new Map();
    meetings.forEach((m) => {
      const key = dayKey(new Date(m.dateTime));
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(m);
    });
    map.forEach((list) => list.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)));
    return map;
  }, [meetings]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{monthLabel}</h3>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => setCursor(startOfMonth(new Date()))}>
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label="Previous month"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label="Next month"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="grid grid-cols-7 border-b border-border bg-muted/40">
          {WEEKDAY_LABELS.map((d) => (
            <div
              key={d}
              className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((date, i) => {
            const dayMeetings = meetingsByDay.get(dayKey(date)) ?? [];
            const inMonth = date.getMonth() === cursor.getMonth();
            const isToday = isSameDay(date, today);
            const visible = dayMeetings.slice(0, MAX_VISIBLE_PER_DAY);
            const overflow = dayMeetings.length - visible.length;

            return (
              <div
                key={i}
                className={cn(
                  "min-h-[6.5rem] border-b border-r border-border p-1.5",
                  i % 7 === 6 && "border-r-0",
                  i >= 35 && "border-b-0",
                  !inMonth && "bg-muted/20"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px]",
                    isToday
                      ? "bg-primary font-semibold text-primary-foreground"
                      : inMonth
                        ? "text-muted-foreground"
                        : "text-muted-foreground/40"
                  )}
                >
                  {date.getDate()}
                </span>

                <div className="mt-1 space-y-1">
                  {visible.map((m) => {
                    const isPast = m.status === "past";
                    return (
                      <button
                        key={m.id}
                        onClick={() => onSelectMeeting(m)}
                        title={`${formatTime(m.dateTime)} · ${m.title}`}
                        className={cn(
                          "flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-[11px] font-medium transition-colors hover:bg-accent",
                          isPast ? "text-muted-foreground" : "text-primary"
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            isPast ? "bg-muted-foreground/50" : "bg-primary"
                          )}
                        />
                        <span className="truncate">{m.title}</span>
                      </button>
                    );
                  })}
                  {overflow > 0 && <p className="px-1 text-[10px] text-muted-foreground">+{overflow} more</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

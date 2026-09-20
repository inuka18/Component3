import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";

const HOUR_START = 7; // 7 AM
const HOUR_END = 20; // 8 PM (exclusive, last slot is 19:30–20:00)
const SLOT_MINUTES = 30;
const SLOT_HEIGHT = 30; // px per 30-minute slot
const SLOTS_PER_DAY = ((HOUR_END - HOUR_START) * 60) / SLOT_MINUTES;
const GRID_HEIGHT = SLOTS_PER_DAY * SLOT_HEIGHT;

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatHourLabel(hour) {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h} ${hour < 12 ? "AM" : "PM"}`;
}

function minutesSinceGridStart(date) {
  return (date.getHours() - HOUR_START) * 60 + date.getMinutes();
}

function weekRangeLabel(days) {
  const start = days[0];
  const end = days[6];
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startLabel = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const endLabel = sameMonth
    ? end.toLocaleDateString(undefined, { day: "numeric" })
    : end.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${startLabel} – ${endLabel}, ${end.getFullYear()}`;
}

// Google-Calendar-style week grid: 30-minute slots from 7 AM–8 PM across
// seven day columns. Clicking an empty slot opens the schedule dialog
// prefilled with that slot's date/time; dragging a meeting onto a
// different slot reschedules it in place. Both are PM-only, matching the
// same "PM can schedule/edit, Team Member can only view" gating the list
// and month views already apply.
export function MeetingsWeekView({ meetings, onSelectMeeting, isPM, onSlotClick, onDragReschedule }) {
  const [cursor, setCursor] = useState(() => startOfWeek(new Date()));
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const today = useMemo(() => new Date(), []);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + i)),
    [cursor]
  );

  const meetingsByDay = useMemo(() => {
    const map = new Map();
    meetings.forEach((m) => {
      const start = new Date(m.dateTime);
      const key = dayKey(start);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(m);
    });
    return map;
  }, [meetings]);

  const hourLabels = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
  const slotIndices = Array.from({ length: SLOTS_PER_DAY }, (_, i) => i);

  const slotDate = (day, slotIndex) => {
    const d = new Date(day);
    d.setHours(HOUR_START, slotIndex * SLOT_MINUTES, 0, 0);
    return d;
  };

  const handleDrop = (day, slotIndex, e) => {
    e.preventDefault();
    setDragOverSlot(null);
    const meetingId = e.dataTransfer.getData("text/plain");
    if (!meetingId) return;
    onDragReschedule(meetingId, slotDate(day, slotIndex));
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{weekRangeLabel(days)}</h3>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => setCursor(startOfWeek(new Date()))}>
            This week
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label="Previous week"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth(), c.getDate() - 7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label="Next week"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth(), c.getDate() + 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        {/* Day headers */}
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] border-b border-border bg-muted/40">
          <div />
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            return (
              <div key={day.toISOString()} className="border-l border-border px-1 py-2 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {WEEKDAY_LABELS[day.getDay()]}
                </p>
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-sm",
                    isToday ? "bg-primary font-semibold text-primary-foreground" : "text-foreground"
                  )}
                >
                  {day.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hourly grid */}
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)]">
          {/* Hour label gutter */}
          <div className="relative" style={{ height: GRID_HEIGHT }}>
            {hourLabels.map((hour, i) => (
              <div
                key={hour}
                className="absolute left-0 right-1 -translate-y-1/2 text-right text-[10px] text-muted-foreground"
                style={{ top: i * 2 * SLOT_HEIGHT }}
              >
                {formatHourLabel(hour)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const dayMeetings = meetingsByDay.get(dayKey(day)) ?? [];
            const isToday = isSameDay(day, today);
            const nowOffset = isToday ? (minutesSinceGridStart(today) / SLOT_MINUTES) * SLOT_HEIGHT : null;

            return (
              <div key={day.toISOString()} className="relative border-l border-border" style={{ height: GRID_HEIGHT }}>
                {/* Empty slots: click to schedule, drop target to reschedule */}
                {slotIndices.map((i) => {
                  const key = `${dayKey(day)}-${i}`;
                  return (
                    <div
                      key={i}
                      onClick={() => isPM && onSlotClick(slotDate(day, i))}
                      onDragOver={(e) => {
                        if (!isPM) return;
                        e.preventDefault();
                        setDragOverSlot(key);
                      }}
                      onDragLeave={() => setDragOverSlot((s) => (s === key ? null : s))}
                      onDrop={(e) => isPM && handleDrop(day, i, e)}
                      className={cn(
                        "border-b border-border/60",
                        i % 2 === 1 && "border-b-border",
                        isPM && "cursor-pointer hover:bg-accent/50",
                        dragOverSlot === key && "bg-primary/10"
                      )}
                      style={{ height: SLOT_HEIGHT }}
                    />
                  );
                })}

                {nowOffset !== null && nowOffset >= 0 && nowOffset <= GRID_HEIGHT && (
                  <div className="pointer-events-none absolute left-0 right-0 z-10 flex items-center" style={{ top: nowOffset }}>
                    <span className="-ml-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                    <span className="h-px flex-1 bg-destructive" />
                  </div>
                )}

                {dayMeetings.map((m) => {
                  const start = new Date(m.dateTime);
                  const top = (minutesSinceGridStart(start) / SLOT_MINUTES) * SLOT_HEIGHT;
                  const height = Math.max((m.durationMins / SLOT_MINUTES) * SLOT_HEIGHT, SLOT_HEIGHT - 4);
                  const isPast = m.status === "past";
                  const draggable = isPM && !isPast;

                  return (
                    <button
                      key={m.id}
                      draggable={draggable}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", m.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMeeting(m);
                      }}
                      title={`${m.title} · ${start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`}
                      className={cn(
                        "absolute inset-x-0.5 z-20 overflow-hidden rounded-md border px-1.5 py-1 text-left text-[11px] font-medium leading-tight shadow-sm transition-shadow hover:shadow-md",
                        isPast
                          ? "border-border bg-muted text-muted-foreground"
                          : "border-primary/30 bg-primary/15 text-primary",
                        draggable && "cursor-grab active:cursor-grabbing"
                      )}
                      style={{ top, height }}
                    >
                      <span className="block truncate">{m.title}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

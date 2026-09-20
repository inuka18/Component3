import { useEffect, useState } from "react";
import { CalendarPlus, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { MEETING_TYPES } from "../../../data/mockMeetings";
import { cn } from "../../../lib/utils";

const EMPTY = { title: "", dateTime: "", type: "Sync", attendeeIds: [] };

function toLocalInputValue(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formToState(meeting, initialDateTime) {
  if (meeting) {
    return {
      title: meeting.title,
      dateTime: toLocalInputValue(meeting.dateTime),
      type: meeting.type,
      attendeeIds: meeting.attendeeIds,
    };
  }
  if (initialDateTime) {
    return { ...EMPTY, dateTime: toLocalInputValue(initialDateTime) };
  }
  return EMPTY;
}

// Used as the PM's "Schedule Meeting" create flow (self-contained, pass
// `trigger`), the "Edit" flow on an existing meeting (externally
// controlled via `open`/`onOpenChange`, pass `meeting`), and the week
// view's "click a slot to schedule" flow (externally controlled, pass
// `initialDateTime` to prefill the date/time of the clicked slot).
export function ScheduleMeetingDialog({
  team,
  onSubmit,
  meeting = null,
  initialDateTime = null,
  open: controlledOpen,
  onOpenChange,
  trigger,
}) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;

  const [form, setForm] = useState(() => formToState(meeting, initialDateTime));

  useEffect(() => {
    if (open) setForm(formToState(meeting, initialDateTime));
  }, [open, meeting, initialDateTime]);

  const toggleAttendee = (id) =>
    setForm((prev) => ({
      ...prev,
      attendeeIds: prev.attendeeIds.includes(id)
        ? prev.attendeeIds.filter((a) => a !== id)
        : [...prev.attendeeIds, id],
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.dateTime) return;

    if (meeting) {
      onSubmit({
        ...meeting,
        title: form.title,
        type: form.type,
        dateTime: new Date(form.dateTime).toISOString(),
        attendeeIds: form.attendeeIds,
      });
    } else {
      onSubmit({
        id: `mtg-new-${Date.now()}`,
        title: form.title,
        type: form.type,
        dateTime: new Date(form.dateTime).toISOString(),
        durationMins: 30,
        attendeeIds: form.attendeeIds,
        status: "upcoming",
      });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger === true ? (
            <Button>
              <CalendarPlus className="h-4 w-4" />
              Schedule Meeting
            </Button>
          ) : (
            trigger
          )}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{meeting ? "Edit meeting" : "Schedule a meeting"}</DialogTitle>
          <DialogDescription>
            {meeting ? "Update the details for this meeting." : "Adds a new upcoming meeting for this project."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="mtg-title">Title</Label>
            <Input
              id="mtg-title"
              placeholder="e.g. Backlog Grooming"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mtg-datetime">Date & time</Label>
              <Input
                id="mtg-datetime"
                type="datetime-local"
                value={form.dateTime}
                onChange={(e) => setForm((p) => ({ ...p, dateTime: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEETING_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Attendees</Label>
            <div className="flex flex-wrap gap-1.5 rounded-lg border border-border p-2.5">
              {team.length === 0 && (
                <span className="px-1 py-1 text-xs text-muted-foreground">No team members found.</span>
              )}
              {team.map((member) => {
                const selected = form.attendeeIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleAttendee(member.id)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    {selected && <Check className="h-3 w-3" />}
                    {member.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">{meeting ? "Save changes" : "Schedule"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

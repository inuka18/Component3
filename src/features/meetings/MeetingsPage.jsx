import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarClock, Pencil, X, List, CalendarDays, Clock } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Skeleton } from "../../components/ui/skeleton";
import { ScheduleMeetingDialog } from "./components/ScheduleMeetingDialog";
import { MeetingDetailDialog } from "./components/MeetingDetailDialog";
import { MeetingsCalendarView } from "./components/MeetingsCalendarView";
import { MeetingsWeekView } from "./components/MeetingsWeekView";
import { useMeetings } from "../../hooks/useMeetings";
import { useTeam } from "../../hooks/useTeam";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useRole, ROLES } from "../../context/RoleContext";
import { getTeamMemberById } from "../../data/mockTeam";
import { generateMeetingTranscript, extractSignalsFromMeeting } from "../../data/mockMeetingTranscript";
import { formatDateTime } from "../../lib/utils";

function MeetingCard({ meeting, onClick, isPM, onEdit, onCancel }) {
  const attendees = meeting.attendeeIds.map(getTeamMemberById).filter(Boolean);
  const isPast = meeting.status === "past";

  return (
    <Card className="group relative transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      {isPM && !isPast && (
        <div className="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(meeting);
            }}
            aria-label="Edit meeting"
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel(meeting.id);
            }}
            aria-label="Cancel meeting"
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <button onClick={() => onClick(meeting)} className="w-full text-left">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {meeting.type}
              </Badge>
              {isPast && (
                <Badge variant="secondary" className="text-[10px]">
                  Past
                </Badge>
              )}
            </div>
            <p className="mt-1.5 truncate text-sm font-semibold text-foreground">{meeting.title}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              {formatDateTime(meeting.dateTime)} · {meeting.durationMins} min
            </p>
          </div>

          <div className="flex shrink-0 -space-x-2">
            {attendees.slice(0, 5).map((a) => (
              <Avatar key={a.id} className="h-7 w-7 border-2 border-card text-[10px]">
                <AvatarFallback>{a.initials}</AvatarFallback>
              </Avatar>
            ))}
            {attendees.length > 5 && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-medium text-muted-foreground">
                +{attendees.length - 5}
              </span>
            )}
          </div>
        </CardContent>
      </button>
    </Card>
  );
}

export function MeetingsPage() {
  const { activeProjectId } = useActiveProject();
  const { role } = useRole();
  const isPM = role === ROLES.PM;
  const { data: meetings, setData: setMeetings, loading } = useMeetings(activeProjectId);
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: team } = useTeam(activeProjectId);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [newMeetingSlot, setNewMeetingSlot] = useState(null);

  // Deep link support: Activity Feed / Notifications items pointing at a
  // meeting land here with ?meeting=<id> and open it automatically.
  useEffect(() => {
    const meetingId = searchParams.get("meeting");
    if (!meetingId || loading) return;
    const match = meetings.find((m) => m.id === meetingId);
    if (match) setSelectedMeeting(match);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("meeting");
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loading, meetings]);
  const [view, setView] = useState("list"); // list | calendar | week

  const upcoming = meetings.filter((m) => m.status === "upcoming");
  const past = meetings.filter((m) => m.status === "past");

  const sortByDate = (list) => [...list].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  const handleSchedule = (meeting) => {
    setMeetings((prev) => sortByDate([...prev, { ...meeting, projectId: activeProjectId }]));
  };

  const handleEditSave = (updated) => {
    setMeetings((prev) => sortByDate(prev.map((m) => (m.id === updated.id ? updated : m))));
  };

  const handleCancel = (id) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  };

  const handleDragReschedule = (meetingId, newDate) => {
    setMeetings((prev) =>
      sortByDate(
        prev.map((m) =>
          m.id === meetingId
            ? { ...m, dateTime: newDate.toISOString(), status: newDate.getTime() >= Date.now() ? "upcoming" : "past" }
            : m
        )
      )
    );
  };

  const handleScheduleFromSlot = (meeting) => {
    handleSchedule(meeting);
    setNewMeetingSlot(null);
  };

  const handleGenerateTranscript = (id) => {
    const meeting = meetings.find((m) => m.id === id);
    if (!meeting) return;
    const transcript = generateMeetingTranscript();
    // Also seeds the Signal Feed with signals extracted from this
    // transcript, tagged "Meeting: {title}", the only place this happens.
    extractSignalsFromMeeting({ meeting, projectId: activeProjectId });
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, transcript } : m)));
    setSelectedMeeting((prev) => (prev && prev.id === id ? { ...prev, transcript } : prev));
  };

  return (
    <div>
      <PageHeader
        title="Meetings"
        description={
          isPM
            ? "Upcoming syncs and a record of past meetings for this project."
            : "View upcoming and past meetings, including notes and transcripts."
        }
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5">
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2.5"
                onClick={() => setView("list")}
              >
                <List className="h-3.5 w-3.5" />
                List
              </Button>
              <Button
                variant={view === "calendar" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2.5"
                onClick={() => setView("calendar")}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Month
              </Button>
              <Button
                variant={view === "week" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2.5"
                onClick={() => setView("week")}
              >
                <Clock className="h-3.5 w-3.5" />
                Week
              </Button>
            </div>
            {isPM && <ScheduleMeetingDialog team={team} onSubmit={handleSchedule} trigger />}
          </div>
        }
      />

      {!loading && meetings.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No meetings scheduled yet"
          description={
            isPM
              ? "Schedule your first meeting to start building this project's record of syncs, notes, and transcripts."
              : "No meetings have been scheduled for this project yet."
          }
          action={isPM ? <ScheduleMeetingDialog team={team} onSubmit={handleSchedule} trigger /> : null}
        />
      ) : view === "list" ? (
        <div className="space-y-8">
          <section>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Upcoming</h3>
            <div className="space-y-3">
              {loading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
              {!loading && upcoming.length === 0 && (
                <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                  No upcoming meetings scheduled.
                </div>
              )}
              {!loading &&
                upcoming.map((m) => (
                  <MeetingCard
                    key={m.id}
                    meeting={m}
                    onClick={setSelectedMeeting}
                    isPM={isPM}
                    onEdit={setEditingMeeting}
                    onCancel={handleCancel}
                  />
                ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Past</h3>
            <div className="space-y-3">
              {!loading && past.length === 0 && (
                <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                  No past meetings yet.
                </div>
              )}
              {!loading &&
                past.map((m) => (
                  <MeetingCard key={m.id} meeting={m} onClick={setSelectedMeeting} isPM={isPM} />
                ))}
            </div>
          </section>
        </div>
      ) : loading ? (
        <Skeleton className="h-[32rem] w-full rounded-xl" />
      ) : view === "calendar" ? (
        <MeetingsCalendarView meetings={meetings} onSelectMeeting={setSelectedMeeting} />
      ) : (
        <MeetingsWeekView
          meetings={meetings}
          onSelectMeeting={setSelectedMeeting}
          isPM={isPM}
          onSlotClick={setNewMeetingSlot}
          onDragReschedule={handleDragReschedule}
        />
      )}

      <MeetingDetailDialog
        meeting={selectedMeeting}
        open={Boolean(selectedMeeting)}
        onOpenChange={(open) => !open && setSelectedMeeting(null)}
        isPM={isPM}
        onGenerateTranscript={handleGenerateTranscript}
      />

      {isPM && (
        <ScheduleMeetingDialog
          team={team}
          meeting={editingMeeting}
          open={Boolean(editingMeeting)}
          onOpenChange={(open) => !open && setEditingMeeting(null)}
          onSubmit={handleEditSave}
        />
      )}

      {isPM && (
        <ScheduleMeetingDialog
          team={team}
          meeting={null}
          initialDateTime={newMeetingSlot}
          open={Boolean(newMeetingSlot)}
          onOpenChange={(open) => !open && setNewMeetingSlot(null)}
          onSubmit={handleScheduleFromSlot}
        />
      )}
    </div>
  );
}

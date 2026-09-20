import { useState } from "react";
import { CheckCircle2, Circle, Sparkles, Loader2, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Separator } from "../../../components/ui/separator";
import { getTeamMemberById } from "../../../data/mockTeam";
import { formatDateTime } from "../../../lib/utils";

export function MeetingDetailDialog({ meeting, open, onOpenChange, isPM, onGenerateTranscript }) {
  const [generating, setGenerating] = useState(false);
  if (!meeting) return null;
  const attendees = meeting.attendeeIds.map(getTeamMemberById).filter(Boolean);
  const isPast = meeting.status === "past";

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      onGenerateTranscript(meeting.id);
      setGenerating(false);
    }, 900);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{meeting.type}</Badge>
            <Badge variant={isPast ? "secondary" : "info"}>{isPast ? "Past" : "Upcoming"}</Badge>
          </div>
          <DialogTitle className="leading-snug">{meeting.title}</DialogTitle>
          <DialogDescription>
            {formatDateTime(meeting.dateTime)} · {meeting.durationMins} min
          </DialogDescription>
        </DialogHeader>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Attendees
          </h4>
          <div className="flex flex-wrap gap-2">
            {attendees.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 py-1 pl-1 pr-3 text-xs font-medium text-foreground"
              >
                <Avatar className="h-5 w-5 text-[9px]">
                  <AvatarFallback>{a.initials}</AvatarFallback>
                </Avatar>
                {a.name}
              </span>
            ))}
          </div>
        </div>

        {isPast ? (
          <>
            <Separator />
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Notes
              </h4>
              <p className="text-sm leading-relaxed text-foreground/90">{meeting.notes}</p>
            </div>

            {meeting.actionItems?.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Action Items
                  </h4>
                  <ul className="space-y-2">
                    {meeting.actionItems.map((ai) => (
                      <li key={ai.id} className="flex items-start gap-2.5 rounded-lg border border-border p-2.5">
                        {ai.status === "Done" ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-confirmed-fg" />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground">{ai.text}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">Owner: {ai.owner}</p>
                        </div>
                        <Badge variant={ai.status === "Done" ? "success" : "outline"} className="shrink-0">
                          {ai.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <Separator />
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                Transcript
              </h4>
              {meeting.transcript ? (
                <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 font-sans text-xs leading-relaxed text-foreground/90 scrollbar-thin">
                  {meeting.transcript}
                </pre>
              ) : isPM ? (
                <div className="rounded-lg border border-dashed border-border p-3 text-center">
                  <p className="mb-2 text-xs text-muted-foreground">No transcript generated yet.</p>
                  <Button size="sm" variant="outline" onClick={handleGenerate} disabled={generating}>
                    {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {generating ? "Generating…" : "Generate Transcript"}
                  </Button>
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  No transcript available for this meeting yet.
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
            This meeting hasn't happened yet. Notes and action items will appear here afterward.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

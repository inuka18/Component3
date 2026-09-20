import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Flag, Clock, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../components/ui/dialog";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../components/ui/select";
import { RestrictedButton } from "./RestrictedButton";
import { getTeamMemberById } from "../../../data/mockTeam";
import { getRequirementById } from "../../../data/mockRequirements";
import { getGapById } from "../../../data/mockGaps";
import { getTimeLogsForTask, addTimeLog } from "../../../data/mockTimeLogs";
import { DELAY_REASONS } from "../../../data/mockSchedule";
import { TASK_STATUSES } from "../../../data/mockSchedulePhases";
import { statusLabel, statusBadgeVariant, causeStyle, setTaskStatus } from "../../../lib/taskStatus";
import { cn } from "../../../lib/utils";

const STATUS_TEXT = { "not-started": "Backlog", "in-progress": "In Progress", review: "Review", done: "Done" };

function initialsFor(name) {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase();
}

// Opened by clicking any task card. `canEdit` (PM, or the current Team
// Member persona is the assignee) gates the status dropdown and the Log
// Time action, everyone else gets the exact same information, just
// read-only, same as a view-only Gantt bar in Component 3.
export function TaskDetailDialog({ task, projectId, canEdit, open, onOpenChange, onChanged }) {
  const navigate = useNavigate();
  const [logOpen, setLogOpen] = useState(false);
  const [hours, setHours] = useState("");
  const [note, setNote] = useState("");
  const [delayReason, setDelayReason] = useState("");
  const [, bump] = useState(0);

  if (!task) return null;

  const assignee = getTeamMemberById(task.assigneeId);
  const requirement = task.requirementId ? getRequirementById(task.requirementId) : null;
  const gap = task.cause?.linkedGapId ? getGapById(task.cause.linkedGapId) : null;
  const cause = task.cause ? causeStyle(task.cause.type) : null;
  const logs = getTimeLogsForTask(task.id);

  const goToRequirement = () => {
    onOpenChange(false);
    navigate(`/projects/${projectId}/requirements/list?req=${requirement.id}`);
  };
  const goToGap = () => {
    onOpenChange(false);
    navigate(`/projects/${projectId}/gap-detection/inventory?gap=${gap.id}`);
  };

  const handleStatusChange = (status) => {
    setTaskStatus(task, status);
    bump((n) => n + 1);
    onChanged?.();
  };

  const handleLogTime = () => {
    if (!hours) return;
    addTimeLog(task.id, {
      hours: Number(hours),
      date: new Date().toISOString().slice(0, 10),
      note,
      ...(delayReason ? { delayReason } : {}),
    });
    setHours("");
    setNote("");
    setDelayReason("");
    setLogOpen(false);
    bump((n) => n + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs font-medium text-primary">{task.id}</span>
            {task.critical && (
              <Badge variant="danger" className="text-[10px]">
                <Flag className="h-3 w-3" />
                Critical Path
              </Badge>
            )}
            {!canEdit && (
              <Badge variant="outline" className="text-[10px]">
                View only
              </Badge>
            )}
          </div>
          <DialogTitle>{task.name}</DialogTitle>
          {assignee && (
            <DialogDescription className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {assignee.name} · {assignee.jobTitle}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-foreground/90">{task.description || "No description provided."}</p>

          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
              {canEdit ? (
                <Select value={task.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="mt-1.5 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_TEXT[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={statusBadgeVariant(task)} className="mt-1.5 text-[10px]">
                  {statusLabel(task)}
                </Badge>
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Story Points</p>
              <p className="mt-2 font-medium text-foreground">{task.storyPoints ?? "N/A"}</p>
            </div>
          </div>

          {cause && (
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", cause.dotClass)} />
                <span className={cn("text-xs font-semibold uppercase tracking-wide", cause.textClass)}>{cause.label}</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{task.cause.description}</p>
            </div>
          )}

          {(requirement || gap) && (
            <div className="flex flex-wrap gap-2">
              {requirement && (
                <Button variant="outline" size="sm" onClick={goToRequirement}>
                  View {requirement.id} in Requirements
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              )}
              {gap && (
                <Button variant="outline" size="sm" onClick={goToGap}>
                  View {gap.id} in Gap Detection
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Time Logs ({logs.length})
              </p>
              {canEdit ? (
                <Button size="sm" variant="outline" onClick={() => setLogOpen((v) => !v)}>
                  Log Time
                </Button>
              ) : (
                <RestrictedButton label="Only the assignee or a PM can log time on this task">Log Time</RestrictedButton>
              )}
            </div>

            {logOpen && canEdit && (
              <div className="mb-3 space-y-2.5 rounded-lg border border-border p-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="log-hours" className="text-xs">
                      Hours
                    </Label>
                    <Input id="log-hours" type="number" min="0" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Delay reason (optional)</Label>
                    <Select value={delayReason} onValueChange={setDelayReason}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        {DELAY_REASONS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="log-note" className="text-xs">
                    Note
                  </Label>
                  <Textarea id="log-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setLogOpen(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleLogTime} disabled={!hours}>
                    Save
                  </Button>
                </div>
              </div>
            )}

            {logs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No time logged yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {logs.map((log) => (
                  <li key={log.id} className="rounded-lg border border-border/70 p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{log.hours}h</span>
                      <span className="text-muted-foreground">
                        {new Date(log.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    {log.note && <p className="mt-1 text-muted-foreground">{log.note}</p>}
                    {log.delayReason && (
                      <Badge variant="warning" className="mt-1 text-[9px]">
                        {log.delayReason}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

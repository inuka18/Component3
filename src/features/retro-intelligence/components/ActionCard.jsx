import { useNavigate } from "react-router-dom";
import { Repeat2, FileCheck2, CalendarClock, ArrowRight, History } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { getTeamMemberById } from "../../../data/mockTeam";
import { getCrossValidationById, SPRINT_LABELS } from "../../../data/mockCrossValidation";
import { getRetroById } from "../../../data/mockRetrospectives";
import { cn } from "../../../lib/utils";

const STATUS_VARIANT = {
  Open: "outline",
  "In Progress": "info",
  "Evidence Submitted": "warning",
  Verified: "success",
  Overdue: "danger",
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Root is a div, not a button. The linked-cause chip below is its own
// real button, and a button can't legally nest inside another button
// (invalid HTML, breaks the a11y tree). `role="button"` + tabIndex keeps
// the whole card keyboard-operable anyway.
export function ActionCard({ action, displayStatus, projectId, onClick, draggable, isDragging, onDragStart, onDragEnd, className }) {
  const owner = getTeamMemberById(action.ownerId);
  const sourceSprint = SPRINT_LABELS[action.sourceSprintId];
  const targetSprint = SPRINT_LABELS[action.targetSprintId];
  const cause = getCrossValidationById(action.reconciledCauseId);
  const retro = action.retroId ? getRetroById(action.retroId) : null;
  const navigate = useNavigate();
  const status = displayStatus ?? action.status;

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}
      className={cn(
        "block w-full text-left",
        draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        isDragging && "opacity-40",
        className
      )}
    >
      <Card className="transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
        <CardContent className="space-y-2.5 p-3.5">
          <div className="flex items-start justify-between gap-2">
            <span className="truncate font-mono text-[10px] text-muted-foreground">{action.id}</span>
            <div className="flex shrink-0 items-center gap-1.5">
              {action.recurrenceFlag && (
                <span title="Recurring issue" className="flex items-center gap-1 text-[10px] font-medium text-status-atrisk-fg">
                  <Repeat2 className="h-3 w-3" />
                </span>
              )}
              <Badge variant={STATUS_VARIANT[status] ?? "outline"} className="text-[10px]">
                {status}
              </Badge>
            </div>
          </div>

          <p className="text-sm font-medium leading-snug text-foreground">{action.title}</p>

          {cause && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${projectId}/retro-intelligence/cross-validation?cv=${cause.id}`);
              }}
              className="block max-w-full truncate rounded-md border border-dashed border-border px-2 py-1 text-left text-[10px] font-medium text-primary hover:border-primary/40 hover:bg-primary/5 hover:underline"
              title={cause.structuredCode}
            >
              ← {cause.id}: {cause.structuredCode}
            </button>
          )}

          {retro && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${projectId}/retro-intelligence/retrospectives?retro=${retro.id}`);
              }}
              className="flex max-w-full items-center gap-1 truncate rounded-md border border-dashed border-border px-2 py-1 text-left text-[10px] font-medium text-primary hover:border-primary/40 hover:bg-primary/5 hover:underline"
              title={retro.sprintName}
            >
              <History className="h-2.5 w-2.5 shrink-0" />
              From {retro.sprintName}'s retro
            </button>
          )}

          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{action.successCriterion}</p>

          <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5">
            {owner ? (
              <span className="flex min-w-0 items-center gap-1.5">
                <Avatar className="h-5 w-5 shrink-0 text-[9px]">
                  <AvatarFallback>{owner.initials}</AvatarFallback>
                </Avatar>
                <span className="truncate text-xs text-muted-foreground">{owner.name}</span>
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Unassigned</span>
            )}
            <span
              className={cn(
                "flex shrink-0 items-center gap-1 text-[11px]",
                status === "Overdue" ? "font-medium text-status-dropped-fg" : "text-muted-foreground"
              )}
            >
              <CalendarClock className="h-3 w-3" />
              {formatDate(action.dueDate)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileCheck2 className="h-3 w-3" />
              {action.evidenceIds.length} evidence item{action.evidenceIds.length === 1 ? "" : "s"}
            </span>
            <span className="flex min-w-0 items-center gap-1 truncate">
              {sourceSprint?.name.replace(/^Sprint (\d+).*$/, "S$1") ?? action.sourceSprintId}
              <ArrowRight className="h-2.5 w-2.5 shrink-0" />
              {targetSprint?.name.replace(/^Sprint (\d+).*$/, "S$1") ?? action.targetSprintId}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

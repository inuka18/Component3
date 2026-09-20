import { useState } from "react";
import { ClipboardList } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { ActionCard } from "./ActionCard";
import { ActionDetailPanel } from "./ActionDetailPanel";
import { CreateActionDialog } from "./CreateActionDialog";
import { getDisplayStatus } from "../../../data/mockActions";
import { getTeamMemberById } from "../../../data/mockTeam";
import { useTeam } from "../../../hooks/useTeam";
import { formatDateTime } from "../../../lib/utils";

// A retro's action list is a filtered view of the same mockActions data
// the Action Tracker board reads, never a separate dataset, rendered
// with the exact same ActionCard the board uses, so an item looks and
// behaves identically whether opened from here or from Actions. Clicking
// one opens the same detail/evidence-submission flow (ActionDetailPanel),
// nested in its own dialog over this one.
export function RetroDetailDialog({ retro, actions, open, onOpenChange, isPM, currentUser, projectId, onActionUpdate }) {
  const { data: team } = useTeam(projectId);
  const [selected, setSelected] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!retro) return null;

  const retroActions = actions.filter((a) => a.retroId === retro.id);
  const isOwnedByCurrentUser = (action) => getTeamMemberById(action.ownerId)?.name === currentUser?.name;

  const handleAssigned = (updated) => {
    onActionUpdate(updated);
    setSelected((prev) => (prev?.id === updated.id ? updated : prev));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <Badge variant="outline" className="w-fit">
              Sprint {retro.sprintNumber}
            </Badge>
            <DialogTitle className="leading-snug">{retro.sprintName}</DialogTitle>
            <DialogDescription>{formatDateTime(retro.date)}</DialogDescription>
          </DialogHeader>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Discussion Notes
            </h4>
            <p className="text-sm leading-relaxed text-foreground/90">{retro.discussionNotes}</p>
          </div>

          <Separator />

          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ClipboardList className="h-3.5 w-3.5" />
              Action Items ({retroActions.length})
            </h4>
            {retroActions.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No action items suggested in this retro yet.</p>
            ) : (
              <div className="space-y-2">
                {retroActions.map((action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    displayStatus={getDisplayStatus(action)}
                    projectId={projectId}
                    onClick={() => setSelected(action)}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-thin">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="leading-snug">{selected.title}</DialogTitle>
                <DialogDescription>Action detail: evidence, history, and verification.</DialogDescription>
              </DialogHeader>
              <ActionDetailPanel
                key={`${selected.id}-${refreshKey}`}
                action={selected}
                projectId={projectId}
                isPM={isPM}
                isOwner={isOwnedByCurrentUser(selected)}
                onEvidenceChange={() => setRefreshKey((k) => k + 1)}
                onAssignRequest={setAssignTarget}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      {isPM && (
        <CreateActionDialog
          open={Boolean(assignTarget)}
          onOpenChange={(open) => !open && setAssignTarget(null)}
          projectId={projectId}
          team={team}
          action={assignTarget}
          onAssigned={handleAssigned}
        />
      )}
    </>
  );
}

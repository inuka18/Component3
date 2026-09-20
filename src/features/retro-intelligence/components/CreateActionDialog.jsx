import { useEffect, useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../components/ui/select";
import { getCrossValidationForProject, SPRINT_LABELS } from "../../../data/mockCrossValidation";
import { createNewAction, assignExistingAction } from "../../../services/actionsService";

// One dialog, two modes, both ending in the same shape: an owner and a
// target sprint on a tracked action. Pass `action` (an existing, unowned
// Open action, almost always one suggested during a retro's discussion)
// to get ASSIGN mode: title/criterion are already decided, so the form is
// just who + when. Leave `action` unset for CREATE mode: the full form,
// used from the Action Tracker toolbar (optionally with
// initialReconciledCauseId prefilled when launched from a specific
// Cross-Validation entry). This replaces the old, separate
// AssignActionItemDialog (base Retrospectives feature) and this file's
// own earlier create-only version, merged because both ultimately do
// the same "assign an owner + target sprint" job on one shared record.
export function CreateActionDialog({ open, onOpenChange, projectId, team, action, onCreated, onAssigned, initialReconciledCauseId }) {
  const assignMode = Boolean(action);

  const [title, setTitle] = useState("");
  const [reconciledCauseId, setReconciledCauseId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [sourceSprintId, setSourceSprintId] = useState("");
  const [targetSprintId, setTargetSprintId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [successCriterion, setSuccessCriterion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reconciledCauses = getCrossValidationForProject(projectId).filter((cv) => cv.status === "Reconciled");
  const sprintOptions = Object.entries(SPRINT_LABELS).filter(([, s]) => s.projectId === projectId);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setReconciledCauseId(initialReconciledCauseId ?? "");
    setOwnerId("");
    setSourceSprintId("");
    setTargetSprintId("");
    setDueDate("");
    setSuccessCriterion("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, action?.id]);

  const canSubmitCreate = title.trim() && ownerId && sourceSprintId && targetSprintId && dueDate;
  const canSubmitAssign = ownerId && targetSprintId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (assignMode) {
      const updated = await assignExistingAction(action.id, { ownerId, targetSprintId });
      setSubmitting(false);
      onOpenChange(false);
      onAssigned(updated);
      return;
    }
    const created = await createNewAction({
      title: title.trim(),
      reconciledCauseId: reconciledCauseId || null,
      ownerId,
      sourceSprintId,
      targetSprintId,
      dueDate: new Date(dueDate).toISOString(),
      successCriterion: successCriterion.trim() || "Root cause addressed and confirmed by the next retrospective.",
    });
    setSubmitting(false);
    onOpenChange(false);
    onCreated(created);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>{assignMode ? "Assign action" : "Create action"}</DialogTitle>
          <DialogDescription>
            {assignMode
              ? `"${action?.title}", pick who owns this and which sprint it targets.`
              : "Turn a reconciled cause and/or a retro discussion into a tracked, evidence-backed action: an owner, a target sprint, and a success criterion, not just a status flag."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!assignMode && (
            <>
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to happen…" />
              </div>

              <div className="space-y-1.5">
                <Label>Reconciled cause (optional)</Label>
                <Select value={reconciledCauseId} onValueChange={setReconciledCauseId}>
                  <SelectTrigger>
                    <SelectValue placeholder={reconciledCauses.length === 0 ? "No reconciled entries yet" : "Select a reconciled cause"} />
                  </SelectTrigger>
                  <SelectContent>
                    {reconciledCauses.map((cv) => (
                      <SelectItem key={cv.id} value={cv.id}>
                        {cv.id}: {cv.reconciledCause}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Owner</Label>
              <Select value={ownerId} onValueChange={setOwnerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent>
                  {team.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!assignMode && (
              <div className="space-y-1.5">
                <Label>Due date</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {!assignMode && (
              <div className="space-y-1.5">
                <Label>Source sprint</Label>
                <Select value={sourceSprintId} onValueChange={setSourceSprintId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Where this came from" />
                  </SelectTrigger>
                  <SelectContent>
                    {sprintOptions.map(([id, s]) => (
                      <SelectItem key={id} value={id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Target sprint</Label>
              <Select value={targetSprintId} onValueChange={setTargetSprintId}>
                <SelectTrigger>
                  <SelectValue placeholder="Where it should land" />
                </SelectTrigger>
                <SelectContent>
                  {sprintOptions.map(([id, s]) => (
                    <SelectItem key={id} value={id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!assignMode && (
            <div className="space-y-1.5">
              <Label>Success criterion</Label>
              <Textarea
                value={successCriterion}
                onChange={(e) => setSuccessCriterion(e.target.value)}
                rows={2}
                placeholder="What does 'done' look like for this action?"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={(assignMode ? !canSubmitAssign : !canSubmitCreate) || submitting}>
              {assignMode ? <UserPlus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {submitting ? (assignMode ? "Assigning…" : "Creating…") : assignMode ? "Assign" : "Create Action"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

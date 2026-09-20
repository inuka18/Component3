import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, Target, History as HistoryIcon, Plus, UserPlus } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../components/ui/select";
import { EvidenceCard } from "./EvidenceCard";
import { RestrictedButton } from "./RestrictedButton";
import { EVIDENCE_TYPES } from "../../../data/mockEvidence";
import { SPRINT_LABELS, getCrossValidationById } from "../../../data/mockCrossValidation";
import { getRetroById } from "../../../data/mockRetrospectives";
import { getTeamMemberById } from "../../../data/mockTeam";
import { useEvidence } from "../../../hooks/useEvidence";
import { createEvidence, reviewEvidenceEntry } from "../../../services/evidenceService";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function SubmitEvidenceForm({ actionId, sprintId, onSubmitted }) {
  const [type, setType] = useState(EVIDENCE_TYPES[0]);
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim() || !source.trim()) return;
    setSubmitting(true);
    const entry = await createEvidence({ actionId, type, description: description.trim(), source: source.trim(), sprintId });
    setSubmitting(false);
    setOpen(false);
    setDescription("");
    setSource("");
    onSubmitted(entry);
  };

  if (!open) {
    return (
      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" />
        Submit Evidence
      </Button>
    );
  }

  return (
    <div className="space-y-2.5 rounded-lg border border-border p-3">
      <div className="space-y-1">
        <Label className="text-xs">Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EVIDENCE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What does this evidence show?" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Source</Label>
        <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Link, doc name, meeting, metric…" className="h-9 text-sm" />
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={submitting || !description.trim() || !source.trim()}>
          {submitting ? "Submitting…" : "Submit Evidence"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// The one action-detail view: history, evidence, verification, and
// (when unowned) assignment, shared by the Action Tracker board and the
// Retrospectives tab's per-retro action list, so an action behaves
// identically no matter which one it was opened from.
export function ActionDetailPanel({ action, projectId, isPM, isOwner, onEvidenceChange, onAssignRequest }) {
  const { data: evidence, setData: setEvidence } = useEvidence(action.id);
  const owner = getTeamMemberById(action.ownerId);
  const sourceSprint = SPRINT_LABELS[action.sourceSprintId];
  const targetSprint = SPRINT_LABELS[action.targetSprintId];
  const cause = getCrossValidationById(action.reconciledCauseId);
  const sourceRetro = action.retroId ? getRetroById(action.retroId) : null;
  const navigate = useNavigate();

  const handleVerify = async (item) => {
    const updated = await reviewEvidenceEntry(item.id, { status: "Verified", ledgerOutcome: item.ledgerOutcome ?? "Confirmed", actionId: action.id });
    setEvidence((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    onEvidenceChange();
  };
  const handleReject = async (item) => {
    const updated = await reviewEvidenceEntry(item.id, { status: "Rejected", ledgerOutcome: item.ledgerOutcome, actionId: action.id });
    setEvidence((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    onEvidenceChange();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] text-muted-foreground">{action.id}</span>
        {cause && (
          <button
            onClick={() => navigate(`/projects/${projectId}/retro-intelligence/cross-validation?cv=${cause.id}`)}
            className="rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] font-medium text-primary hover:border-primary/40 hover:bg-primary/5 hover:underline"
          >
            ← {cause.id}: {cause.structuredCode}
          </button>
        )}
        {sourceRetro && (
          <button
            onClick={() => navigate(`/projects/${projectId}/retro-intelligence/retrospectives?retro=${sourceRetro.id}`)}
            className="rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] font-medium text-primary hover:border-primary/40 hover:bg-primary/5 hover:underline"
          >
            ← Suggested in {sourceRetro.sprintName}'s retro
          </button>
        )}
      </div>

      <p className="text-sm leading-relaxed text-foreground/90">{action.successCriterion}</p>

      <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-4">
        <span className="flex items-center gap-1.5">
          {owner ? (
            <>
              <Avatar className="h-5 w-5 text-[9px]">
                <AvatarFallback>{owner.initials}</AvatarFallback>
              </Avatar>
              {owner.name}
            </>
          ) : isPM ? (
            <Button size="sm" variant="outline" className="h-6 gap-1 px-2 text-[11px]" onClick={() => onAssignRequest(action)}>
              <UserPlus className="h-3 w-3" />
              Assign
            </Button>
          ) : (
            "Unassigned"
          )}
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5" />
          Due {formatDate(action.dueDate)}
        </span>
        <span className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5" />
          {sourceSprint?.name ?? action.sourceSprintId} → {targetSprint?.name ?? action.targetSprintId}
        </span>
        {action.recurrenceFlag && (
          <Badge variant="warning" className="w-fit text-[10px]">
            Recurring Issue
          </Badge>
        )}
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <HistoryIcon className="h-3.5 w-3.5" />
          History
        </p>
        <ul className="space-y-1.5">
          {action.history.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-xs">
              <Badge variant="outline" className="mt-0 shrink-0 text-[10px]">
                {h.status}
              </Badge>
              <span className="text-muted-foreground">{formatDate(h.date)}: {h.note}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidence</p>
        <div className="space-y-2.5">
          {evidence.length === 0 ? (
            <p className="text-sm text-muted-foreground">No evidence submitted yet.</p>
          ) : (
            evidence.map((e) => <EvidenceCard key={e.id} evidence={e} isPM={isPM} onVerify={handleVerify} onReject={handleReject} />)
          )}
        </div>
        <div className="mt-3">
          {isOwner || isPM ? (
            <SubmitEvidenceForm
              actionId={action.id}
              sprintId={action.targetSprintId}
              onSubmitted={(entry) => {
                setEvidence((prev) => [...prev, entry]);
                onEvidenceChange();
              }}
            />
          ) : (
            <RestrictedButton label="Only the assigned owner can submit evidence for this action">
              <Plus className="h-3.5 w-3.5" />
              Submit Evidence
            </RestrictedButton>
          )}
        </div>
      </div>
    </div>
  );
}

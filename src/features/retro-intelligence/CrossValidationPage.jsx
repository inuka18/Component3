import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Quote,
  CheckCheck,
  Sparkles,
  Plus,
  FileText,
  Loader2,
  X,
  CheckCircle2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Skeleton } from "../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { MatchScoreBadge } from "./components/MatchScoreBadge";
import { RestrictedButton } from "./components/RestrictedButton";
import { LedgerLookupPanel } from "./components/LedgerLookupPanel";
import { useCrossValidation } from "../../hooks/useCrossValidation";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useTeam } from "../../hooks/useTeam";
import { useRole, ROLES } from "../../context/RoleContext";
import {
  reconcileMismatch,
  bulkAccept,
  reopenMismatches,
  simulateNlpRun,
} from "../../services/crossValidationService";
import { createNewAction } from "../../services/actionsService";
import { generateTranscriptForMeeting } from "../../services/meetingsService";
import { getScheduleTaskById, getAllTasksForProject } from "../../data/mockSchedulePhases";
import { getRequirementById, getRequirementsForProject } from "../../data/mockRequirements";
import { getMeetingById } from "../../data/mockMeetings";
import { SPRINT_LABELS } from "../../data/mockCrossValidation";
import { cn } from "../../lib/utils";

const STATUS_VARIANT = { Pending: "warning", Reconciled: "success" };
const BULK_ACCEPT_THRESHOLD = 90;
const SIM_STEPS = ["Parsing structured delay logs…", "Extracting causes from retrospective transcripts…", "Cross-checking the Traceability Ledger…"];

function LedgerResultText({ result }) {
  return (
    <span
      className={cn(
        "text-xs font-medium",
        result === "Confirmed" ? "text-status-confirmed-fg" : result === "Partially Supported" ? "text-status-atrisk-fg" : "text-status-dropped-fg"
      )}
    >
      {result}
    </span>
  );
}

function TruncatedExcerpt({ text, limit = 70 }) {
  const [expanded, setExpanded] = useState(false);
  if (text.length <= limit) return <p className="text-xs italic text-foreground/80">"{text}"</p>;
  return (
    <div className="max-w-[16rem]">
      <p className="text-xs italic text-foreground/80">"{expanded ? text : `${text.slice(0, limit)}…`}"</p>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded((v) => !v);
        }}
        className="mt-0.5 flex items-center gap-0.5 text-[10px] font-medium text-primary hover:underline"
      >
        {expanded ? (
          <>
            Show less <ChevronUp className="h-3 w-3" />
          </>
        ) : (
          <>
            Show more <ChevronDown className="h-3 w-3" />
          </>
        )}
      </button>
    </div>
  );
}

// The "Transcript" stage: reuses the exact same generateMeetingTranscript()
// mechanism MeetingDetailDialog calls, against the real mockMeetings
// record linked to this sprint's retrospective, rather than a second
// transcript UI scoped to Component 4.
function RetroTranscriptPanel({ sprintId, isPM }) {
  const sprint = SPRINT_LABELS[sprintId];
  const [meeting, setMeeting] = useState(() => (sprint?.meetingId ? getMeetingById(sprint.meetingId) : null));
  const [generating, setGenerating] = useState(false);

  if (!sprint?.meetingId) {
    return (
      <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
        No retrospective meeting recorded yet for {sprint?.name ?? sprintId}. It hasn't closed out.
      </div>
    );
  }

  const handleGenerate = async () => {
    setGenerating(true);
    const updated = await generateTranscriptForMeeting(meeting.id);
    setGenerating(false);
    setMeeting(updated);
  };

  return (
    <div className="rounded-lg border border-border p-3">
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <FileText className="h-3.5 w-3.5" />
        Retrospective Transcript: {meeting.title}
      </p>
      {meeting.transcript ? (
        <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted/30 p-2.5 font-sans text-xs leading-relaxed text-foreground/90 scrollbar-thin">
          {meeting.transcript}
        </pre>
      ) : isPM ? (
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">No transcript generated yet.</p>
          <Button size="sm" variant="outline" onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {generating ? "Generating…" : "Generate Transcript"}
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No transcript available for this meeting yet.</p>
      )}
    </div>
  );
}

function CreateActionForm({ cv, onCreated }) {
  const { data: team } = useTeam(cv.projectId);
  const [title, setTitle] = useState(`Address: ${cv.reconciledCause ?? cv.structuredCode}`);
  const [ownerId, setOwnerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [successCriterion, setSuccessCriterion] = useState("");
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !ownerId || !dueDate) return;
    setCreating(true);
    const action = await createNewAction({
      title: title.trim(),
      reconciledCauseId: cv.id,
      ownerId,
      sourceSprintId: cv.sprintId,
      targetSprintId: cv.sprintId,
      dueDate: new Date(dueDate).toISOString(),
      successCriterion: successCriterion.trim() || "Root cause addressed and confirmed by the next retrospective.",
    });
    setCreating(false);
    setOpen(false);
    onCreated(action);
  };

  if (!open) {
    return (
      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" />
        Create Action
      </Button>
    );
  }

  return (
    <div className="space-y-2.5 rounded-lg border border-border p-3">
      <div className="space-y-1">
        <Label className="text-xs">Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <Label className="text-xs">Owner</Label>
          <Select value={ownerId} onValueChange={setOwnerId}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Choose owner" />
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
        <div className="space-y-1">
          <Label className="text-xs">Due date</Label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-9 text-xs" />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Success criterion</Label>
        <Textarea
          value={successCriterion}
          onChange={(e) => setSuccessCriterion(e.target.value)}
          rows={2}
          placeholder="What does 'done' look like for this action?"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleCreate} disabled={creating || !title.trim() || !ownerId || !dueDate}>
          {creating ? "Creating…" : "Create Action"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// The reconciliation panel: a Pending entry lets the PM pick which cause
// is correct (or write a custom one) plus reviewer notes; a Reconciled
// entry shows that decision read-only with a "Re-review" correction
// path back to Pending. The entry's `history` (not shown destructively,
// just accumulated) is what makes that safe to do more than once.
function ReconciliationPanel({ cv, isPM, onUpdated }) {
  const [choice, setChoice] = useState("nlp");
  const [customValue, setCustomValue] = useState("");
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionCreated, setActionCreated] = useState(null);

  const reconciledCause = choice === "structured" ? cv.structuredCode : choice === "nlp" ? cv.nlpExtractedCause : customValue;

  const handleConfirm = async () => {
    if (!reconciledCause.trim()) return;
    setSaving(true);
    const updated = await reconcileMismatch(cv.id, { reconciledCause: reconciledCause.trim(), reviewerNotes: reviewerNotes.trim() || null });
    setSaving(false);
    onUpdated(updated);
  };

  const handleReopen = async () => {
    setSaving(true);
    const [updated] = await reopenMismatches([cv.id], "Reopened for re-review.");
    setSaving(false);
    onUpdated(updated);
  };

  if (cv.status !== "Pending") {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-border p-3.5">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reconciled Cause</p>
            <Badge variant="secondary" className="text-[10px]">
              {cv.reconciledVia === "bulk" ? "Bulk-accepted" : "Manually reconciled"}
            </Badge>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-foreground">
            <CheckCheck className="h-4 w-4 shrink-0 text-status-confirmed-fg" />
            {cv.reconciledCause}
          </p>
          {cv.reviewerNotes && <p className="mt-2 text-xs italic leading-relaxed text-muted-foreground">Reviewer notes: {cv.reviewerNotes}</p>}
        </div>

        {isPM ? (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={handleReopen} disabled={saving}>
            <RotateCcw className="h-3.5 w-3.5" />
            {saving ? "Reopening…" : "Re-review"}
          </Button>
        ) : (
          <RestrictedButton label="Only Project Managers can reopen a reconciled entry">
            <RotateCcw className="h-3.5 w-3.5" />
            Re-review
          </RestrictedButton>
        )}

        <div className="rounded-lg border border-border p-3.5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</p>
          {actionCreated ? (
            <p className="flex items-center gap-1.5 text-sm text-foreground">
              <CheckCheck className="h-4 w-4 text-status-confirmed-fg" />
              "{actionCreated.title}" created. See the Actions tab.
            </p>
          ) : isPM ? (
            <CreateActionForm cv={cv} onCreated={setActionCreated} />
          ) : (
            <RestrictedButton label="Only Project Managers can create actions">
              <Plus className="h-3.5 w-3.5" />
              Create Action
            </RestrictedButton>
          )}
        </div>
      </div>
    );
  }

  if (!isPM) {
    return <p className="rounded-lg border border-dashed border-border p-3 text-center text-sm text-muted-foreground">Awaiting a Project Manager's reconciliation.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {[
          { key: "structured", label: "Structured Code Is Correct" },
          { key: "nlp", label: "NLP-Extracted Cause Is Correct" },
          { key: "custom", label: "Write a Custom Cause" },
        ].map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setChoice(opt.key)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
              choice === opt.key ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {choice === "custom" ? (
        <Textarea value={customValue} onChange={(e) => setCustomValue(e.target.value)} rows={2} placeholder="Enter the actual reconciled cause…" />
      ) : (
        <p className="rounded-lg border border-border bg-muted/30 p-2.5 text-sm text-foreground">{reconciledCause}</p>
      )}

      <div className="space-y-1">
        <Label className="text-xs">Reviewer notes (optional)</Label>
        <Textarea value={reviewerNotes} onChange={(e) => setReviewerNotes(e.target.value)} rows={2} placeholder="Why this cause, for the record…" />
      </div>

      <Button size="sm" onClick={handleConfirm} disabled={saving || !reconciledCause.trim()}>
        {saving ? "Saving…" : "Confirm Reconciled Cause"}
      </Button>
    </div>
  );
}

function CrossValidationDetail({ cv, projectId, isPM, onUpdated }) {
  const task = getScheduleTaskById(projectId, cv.taskId);
  const requirement = getRequirementById(cv.linkedRequirementId);
  const sprint = SPRINT_LABELS[cv.sprintId];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Structured Code (Logged)</p>
          <p className="mt-1 text-sm font-medium text-foreground">{cv.structuredCode}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">NLP-Extracted Cause</p>
          <p className="mt-1 text-sm font-medium text-foreground">{cv.nlpExtractedCause}</p>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Quote className="h-3.5 w-3.5" />
          Transcript Evidence (excerpt)
        </p>
        <p className="text-sm italic leading-relaxed text-foreground/90">"{cv.evidenceExcerpt}"</p>
      </div>

      <RetroTranscriptPanel sprintId={cv.sprintId} isPM={isPM} />

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>
          Task: <span className="font-medium text-foreground">{task?.name ?? cv.taskId}</span>
        </span>
        <span>
          Sprint: <span className="font-medium text-foreground">{sprint?.name ?? cv.sprintId}</span>
        </span>
        <MatchScoreBadge score={cv.semanticScore} showLabel />
        <span>{cv.confidence}% extraction confidence</span>
      </div>

      <LedgerLookupPanel
        requirementId={cv.linkedRequirementId}
        requirementTitle={requirement?.title}
        ledgerResult={cv.ledgerResult}
        projectId={projectId}
      />

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reconciliation</p>
        <ReconciliationPanel cv={cv} isPM={isPM} onUpdated={onUpdated} />
      </div>

      {cv.history.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">History</p>
          <ul className="space-y-1.5">
            {cv.history.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <Badge variant="outline" className="mt-0 shrink-0 text-[10px]">
                  {h.status}
                </Badge>
                <span className="text-muted-foreground">
                  {new Date(h.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}: {h.note}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function CrossValidationPage() {
  const { activeProjectId } = useActiveProject();
  const { role } = useRole();
  const isPM = role === ROLES.PM;
  const { data: entries, setData: setEntries, loading } = useCrossValidation(activeProjectId);
  const [selected, setSelected] = useState(null);
  const [bulking, setBulking] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [toast, setToast] = useState(null); // { message, undo? }
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const cvId = searchParams.get("cv");
    if (!cvId || loading) return;
    const match = entries.find((e) => e.id === cvId);
    if (match) setSelected(match);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("cv");
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loading, entries]);

  const showToast = (message, undo) => {
    setToast({ message, undo });
    if (!undo) setTimeout(() => setToast((t) => (t?.message === message ? null : t)), 5000);
  };

  const applyUpdate = (updated) => {
    if (!updated) return;
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setSelected(updated);
  };

  const pendingStrongMatches = entries.filter((e) => e.status === "Pending" && e.semanticScore >= BULK_ACCEPT_THRESHOLD);

  const handleBulkAccept = async () => {
    setBulking(true);
    const affected = await bulkAccept(pendingStrongMatches.map((e) => e.id), BULK_ACCEPT_THRESHOLD);
    setBulking(false);
    if (affected.length === 0) return;
    setEntries((prev) =>
      prev.map((e) => (affected.includes(e.id) ? { ...e, status: "Reconciled", reconciledCause: e.structuredCode, reconciledVia: "bulk" } : e))
    );
    showToast(`Bulk-accepted ${affected.length} high-confidence ${affected.length === 1 ? "match" : "matches"} (≥${BULK_ACCEPT_THRESHOLD}% score).`, async () => {
      await reopenMismatches(affected, "Reverted via Undo Bulk Accept.");
      setEntries((prev) => prev.map((e) => (affected.includes(e.id) ? { ...e, status: "Pending" } : e)));
      setToast(null);
    });
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    setSimStep(0);
    const stepTimer = setInterval(() => setSimStep((s) => Math.min(s + 1, SIM_STEPS.length - 1)), 500);
    const tasks = getAllTasksForProject(activeProjectId);
    const requirements = getRequirementsForProject(activeProjectId);
    const created = await simulateNlpRun(activeProjectId, tasks, requirements);
    clearInterval(stepTimer);
    setSimulating(false);
    if (created.length === 0) {
      showToast("NLP simulation found no new tasks to compare. Everything's already been checked.");
      return;
    }
    setEntries((prev) => [...created, ...prev]);
    showToast(`NLP simulation added ${created.length} new cross-validation ${created.length === 1 ? "entry" : "entries"}.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {entries.length} cross-validation {entries.length === 1 ? "entry" : "entries"} · {pendingStrongMatches.length} at or above{" "}
          {BULK_ACCEPT_THRESHOLD}% ready to bulk-accept.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {isPM ? (
            <Button size="sm" variant="outline" className="gap-1.5" onClick={handleRunSimulation} disabled={simulating}>
              {simulating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {simulating ? "Running…" : "Run NLP Simulation"}
            </Button>
          ) : (
            <RestrictedButton label="Only Project Managers can run an NLP simulation">
              <Sparkles className="h-3.5 w-3.5" />
              Run NLP Simulation
            </RestrictedButton>
          )}
          {pendingStrongMatches.length > 0 &&
            (isPM ? (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={handleBulkAccept} disabled={bulking}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                {bulking ? "Accepting…" : `Bulk Accept High-Confidence Matches (${pendingStrongMatches.length})`}
              </Button>
            ) : (
              <RestrictedButton label="Only Project Managers can bulk-accept mismatches">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Bulk Accept High-Confidence Matches
              </RestrictedButton>
            ))}
        </div>
      </div>

      {simulating && (
        <Card className="border-primary/30 bg-primary/[0.03]">
          <CardContent className="flex items-center gap-3 p-4">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
            <div className="space-y-1">
              {SIM_STEPS.map((step, i) => (
                <p key={step} className={cn("text-xs transition-colors", i <= simStep ? "font-medium text-foreground" : "text-muted-foreground/50")}>
                  {step}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto rounded-xl border border-border scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Structured Code</TableHead>
              <TableHead>NLP-Extracted Cause</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Sprint</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Evidence Excerpt</TableHead>
              <TableHead>Requirement</TableHead>
              <TableHead>Ledger</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 10 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-[8rem]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading && entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="py-10 text-center text-sm text-muted-foreground">
                  No cross-validation entries for this project yet.
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              entries.map((cv) => {
                const task = getScheduleTaskById(activeProjectId, cv.taskId);
                const requirement = getRequirementById(cv.linkedRequirementId);
                const sprint = SPRINT_LABELS[cv.sprintId];
                return (
                  <TableRow key={cv.id} className="cursor-pointer" onClick={() => setSelected(cv)}>
                    <TableCell className="max-w-[9rem] whitespace-normal text-sm text-foreground">{cv.structuredCode}</TableCell>
                    <TableCell className="max-w-[14rem] whitespace-normal text-sm text-foreground">{cv.nlpExtractedCause}</TableCell>
                    <TableCell>
                      <MatchScoreBadge score={cv.semanticScore} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{cv.confidence}%</TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{sprint?.name ?? cv.sprintId}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/projects/${activeProjectId}/schedule/week?task=${cv.taskId}`);
                        }}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {task?.name ?? cv.taskId}
                      </button>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <TruncatedExcerpt text={cv.evidenceExcerpt} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/projects/${activeProjectId}/requirements/list?req=${cv.linkedRequirementId}`);
                        }}
                        className="font-mono text-xs font-medium text-primary hover:underline"
                        title={requirement?.title}
                      >
                        {cv.linkedRequirementId}
                      </button>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <LedgerResultText result={cv.ledgerResult} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={STATUS_VARIANT[cv.status]} className="text-[10px]">
                        {cv.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-thin">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Cross-Validation Review</DialogTitle>
                <DialogDescription>Comparing the logged delay reason against the retrospective transcript and the ledger.</DialogDescription>
              </DialogHeader>
              <CrossValidationDetail cv={selected} projectId={activeProjectId} isPM={isPM} onUpdated={applyUpdate} />
            </>
          )}
        </DialogContent>
      </Dialog>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] flex max-w-sm items-start gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-2xl animate-slide-up">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-confirmed-fg" />
          <span className="flex-1">{toast.message}</span>
          {toast.undo && (
            <button onClick={toast.undo} className="shrink-0 whitespace-nowrap text-xs font-semibold text-primary hover:underline">
              Undo Bulk Accept
            </button>
          )}
          <button onClick={() => setToast(null)} className="shrink-0 text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

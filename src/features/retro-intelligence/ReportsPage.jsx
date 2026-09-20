import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Printer,
  FileJson,
  FileSpreadsheet,
  Send,
  CheckCircle2,
  X,
  GitCompareArrows,
  ListChecks,
  BadgeCheck,
  Clock3,
  Repeat2,
  Database,
  ShieldCheck,
  ShieldQuestion,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { RestrictedButton } from "./components/RestrictedButton";
import { MatchScoreBadge } from "./components/MatchScoreBadge";
import { RecurrenceMatrix } from "./components/RecurrenceMatrix";
import { useCrossValidation } from "../../hooks/useCrossValidation";
import { useActions } from "../../hooks/useActions";
import { useProjectEvidence } from "../../hooks/useProjectEvidence";
import { useFeedbackLog } from "../../hooks/useFeedbackLog";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useRole, ROLES } from "../../context/RoleContext";
import { sendFeedback } from "../../services/feedbackLogService";
import { getDisplayStatus, BOARD_COLUMNS } from "../../data/mockActions";
import { SPRINT_LABELS, getCrossValidationById } from "../../data/mockCrossValidation";
import { formatDateTime } from "../../lib/utils";
import { cn } from "../../lib/utils";

const LEDGER_CONFIG = {
  Confirmed: { icon: ShieldCheck, className: "text-status-confirmed-fg" },
  "Partially Supported": { icon: ShieldQuestion, className: "text-status-atrisk-fg" },
  "Not Supported": { icon: ShieldAlert, className: "text-status-dropped-fg" },
};

const EVIDENCE_STATUS_VARIANT = { "Pending Review": "warning", Verified: "success", Rejected: "danger" };

const DESTINATION_LABEL = { "component-2": "Gap Detection", "component-3": "Schedule" };

function StatTile({ label, value, icon: Icon, highlight }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0">
        <p className={cn("text-lg font-bold leading-none text-foreground", highlight)}>{value}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function ReportsPage() {
  const { activeProjectId, activeProject } = useActiveProject();
  const { role, currentUser } = useRole();
  const isPM = role === ROLES.PM;
  const navigate = useNavigate();

  const { data: crossValidation, loading: cvLoading } = useCrossValidation(activeProjectId);
  const { data: actions, loading: actionsLoading } = useActions(activeProjectId);
  const { data: evidence, loading: evidenceLoading } = useProjectEvidence(activeProjectId);
  const { data: feedbackLog, setData: setFeedbackLog, loading: feedbackLoading } = useFeedbackLog(activeProjectId);
  const loading = cvLoading || actionsLoading || evidenceLoading || feedbackLoading;

  // Sprint scope is specific to this page. Project scope already comes
  // from ProjectContext/the active-project route, so there's no separate
  // project filter here.
  const [sprintFilter, setSprintFilter] = useState("all");
  const [sendingReport, setSendingReport] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const projectSprints = useMemo(
    () => Object.entries(SPRINT_LABELS).filter(([, s]) => s.projectId === activeProjectId),
    [activeProjectId]
  );
  const sprintLabel = sprintFilter === "all" ? "All Sprints" : SPRINT_LABELS[sprintFilter]?.name ?? sprintFilter;

  const filteredCv = useMemo(
    () => (sprintFilter === "all" ? crossValidation : crossValidation.filter((cv) => cv.sprintId === sprintFilter)),
    [crossValidation, sprintFilter]
  );
  const filteredActions = useMemo(
    () =>
      sprintFilter === "all"
        ? actions
        : actions.filter((a) => a.sourceSprintId === sprintFilter || a.targetSprintId === sprintFilter),
    [actions, sprintFilter]
  );
  const filteredEvidence = useMemo(
    () => (sprintFilter === "all" ? evidence : evidence.filter((e) => e.sprintId === sprintFilter)),
    [evidence, sprintFilter]
  );
  const scopedFeedbackLog = useMemo(() => {
    if (sprintFilter === "all") return feedbackLog;
    return feedbackLog.filter((entry) => {
      if (entry.scope === "report") return true; // whole-project sends aren't sprint-scoped
      const cv = getCrossValidationById(entry.refId);
      return cv?.sprintId === sprintFilter;
    });
  }, [feedbackLog, sprintFilter]);

  // --- Executive summary -----------------------------------------------
  const reconciledCv = filteredCv.filter((cv) => cv.status === "Reconciled");
  const reconciledPct = filteredCv.length ? Math.round((reconciledCv.length / filteredCv.length) * 100) : 0;
  const displayStatuses = filteredActions.map((a) => getDisplayStatus(a));
  const overdueActions = filteredActions.filter((a, i) => displayStatuses[i] === "Overdue");
  const verifiedActionsCount = displayStatuses.filter((s) => s === "Verified").length;
  const recurringCount = filteredActions.filter((a) => a.recurrenceFlag).length;
  const evidenceVerifiedCount = filteredEvidence.filter((e) => e.status === "Verified").length;

  // --- Cross-validation consistency --------------------------------------
  const strongMatches = filteredCv.filter((cv) => cv.semanticScore >= 75).length;
  const partialMatches = filteredCv.filter((cv) => cv.semanticScore >= 50 && cv.semanticScore < 75).length;
  const mismatches = filteredCv.filter((cv) => cv.semanticScore < 50).length;
  const avgSemanticScore = filteredCv.length
    ? Math.round(filteredCv.reduce((sum, cv) => sum + cv.semanticScore, 0) / filteredCv.length)
    : 0;
  const avgConfidence = filteredCv.length
    ? Math.round(filteredCv.reduce((sum, cv) => sum + cv.confidence, 0) / filteredCv.length)
    : 0;

  // --- Actions / evidence / ledger status breakdowns ---------------------
  const actionStatusCounts = Object.fromEntries(BOARD_COLUMNS.map((s) => [s, displayStatuses.filter((d) => d === s).length]));
  const evidenceStatusCounts = {
    "Pending Review": filteredEvidence.filter((e) => e.status === "Pending Review").length,
    Verified: filteredEvidence.filter((e) => e.status === "Verified").length,
    Rejected: filteredEvidence.filter((e) => e.status === "Rejected").length,
  };
  const ledgerCounts = {
    Confirmed: filteredCv.filter((cv) => cv.ledgerResult === "Confirmed").length,
    "Partially Supported": filteredCv.filter((cv) => cv.ledgerResult === "Partially Supported").length,
    "Not Supported": filteredCv.filter((cv) => cv.ledgerResult === "Not Supported").length,
  };

  const handleSendReport = async () => {
    setSendingReport(true);
    const entry = await sendFeedback({
      projectId: activeProjectId,
      scope: "report",
      refId: null,
      refLabel: sprintFilter === "all" ? "Full Report" : `Report: ${sprintLabel}`,
      destinations: ["component-2", "component-3"],
      sentBy: currentUser?.name,
    });
    setFeedbackLog((prev) => [entry, ...prev]);
    setSendingReport(false);
    setToast(`Report sent to Gap Detection & Schedule.`);
  };

  const handleExport = (format) => {
    setToast(`Exported ${format}. Prototype simulation, no file was actually generated.`);
  };

  return (
    <div className="print-report space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">Sprint</label>
          <Select value={sprintFilter} onValueChange={setSprintFilter}>
            <SelectTrigger className="h-9 w-64 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sprints</SelectItem>
              {projectSprints.map(([id, s]) => (
                <SelectItem key={id} value={id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("JSON")}>
            <FileJson className="h-4 w-4" />
            Export JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("CSV")}>
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Executive summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Retrospective Intelligence Report</CardTitle>
          <CardDescription>
            {activeProject ? activeProject.name : "Project"} · {sprintLabel} · Generated {formatDateTime(new Date().toISOString())}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[4.5rem] w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <StatTile label="Cross-Validations Run" value={filteredCv.length} icon={GitCompareArrows} />
                <StatTile label="Reconciled" value={`${reconciledPct}%`} icon={CheckCircle2} />
                <StatTile label="Actions Verified" value={verifiedActionsCount} icon={BadgeCheck} highlight="text-status-confirmed-fg" />
                <StatTile label="Actions Overdue" value={overdueActions.length} icon={Clock3} highlight="text-status-dropped-fg" />
                <StatTile label="Evidence Verified" value={evidenceVerifiedCount} icon={ListChecks} />
                <StatTile label="Recurring Issues" value={recurringCount} icon={Repeat2} />
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                Of {filteredCv.length} cross-validation{filteredCv.length === 1 ? "" : "s"} run for {sprintLabel.toLowerCase()},{" "}
                {reconciledCv.length} ({reconciledPct}%) have been reconciled. {verifiedActionsCount} action
                {verifiedActionsCount === 1 ? " has" : "s have"} been verified with evidence
                {overdueActions.length > 0 ? (
                  <>
                    , while <span className="font-semibold text-status-dropped-fg">{overdueActions.length} remain overdue</span>
                  </>
                ) : (
                  " and none are currently overdue"
                )}
                . {recurringCount > 0
                  ? `${recurringCount} issue${recurringCount === 1 ? " has" : "s have"} recurred and been re-flagged for a future sprint.`
                  : "No issue has recurred across sprints yet."}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Cross-validation consistency results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cross-Validation Consistency Results</CardTitle>
          <CardDescription>
            How well the structured delay reason teams logged agrees with what the retrospective transcript's NLP
            extraction actually surfaced.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : filteredCv.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No cross-validation entries in this scope.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <StatTile label="Strong Match (≥75%)" value={strongMatches} icon={CheckCircle2} highlight="text-status-confirmed-fg" />
              <StatTile label="Partial Match (50–74%)" value={partialMatches} icon={AlertTriangle} highlight="text-status-atrisk-fg" />
              <StatTile label="Mismatch (<50%)" value={mismatches} icon={AlertTriangle} highlight="text-status-dropped-fg" />
              <StatTile label="Avg. Semantic Score" value={`${avgSemanticScore}%`} icon={GitCompareArrows} />
              <StatTile label="Avg. Confidence" value={`${avgConfidence}%`} icon={ShieldCheck} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reconciled causes list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reconciled Causes</CardTitle>
          <CardDescription>Every mismatch a PM has signed off on, with the cause as finally recorded.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">
              <Skeleton className="h-32 w-full" />
            </div>
          ) : reconciledCv.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No reconciled causes in this scope yet.</p>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Reconciled Cause</TableHead>
                    <TableHead>Sprint</TableHead>
                    <TableHead>Requirement</TableHead>
                    <TableHead>Semantic Match</TableHead>
                    <TableHead>Ledger Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconciledCv.map((cv) => (
                    <TableRow key={cv.id}>
                      <TableCell>
                        <button
                          onClick={() => navigate(`../cross-validation?cv=${cv.id}`)}
                          className="font-mono text-xs font-medium text-primary hover:underline"
                        >
                          {cv.id}
                        </button>
                      </TableCell>
                      <TableCell className="max-w-sm">
                        <p className="line-clamp-2 text-sm text-foreground/90">{cv.reconciledCause ?? cv.structuredCode}</p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {SPRINT_LABELS[cv.sprintId]?.name.replace(/^Sprint (\d+).*$/, "Sprint $1") ?? cv.sprintId}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{cv.linkedRequirementId}</TableCell>
                      <TableCell>
                        <MatchScoreBadge score={cv.semanticScore} />
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-xs font-medium",
                            LEDGER_CONFIG[cv.ledgerResult]?.className
                          )}
                        >
                          {(() => {
                            const Icon = LEDGER_CONFIG[cv.ledgerResult]?.icon ?? ShieldQuestion;
                            return <Icon className="h-3.5 w-3.5" />;
                          })()}
                          {cv.ledgerResult}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions Summary</CardTitle>
          <CardDescription>Work outcomes only, never a ranking of who did the work.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {BOARD_COLUMNS.map((status) => (
                  <div
                    key={status}
                    className={cn(
                      "rounded-xl border p-3 text-center",
                      status === "Overdue" && actionStatusCounts[status] > 0
                        ? "border-status-dropped-fg/40 bg-status-dropped-bg/30"
                        : "border-border"
                    )}
                  >
                    <p
                      className={cn(
                        "text-lg font-bold",
                        status === "Overdue" && actionStatusCounts[status] > 0 ? "text-status-dropped-fg" : "text-foreground"
                      )}
                    >
                      {actionStatusCounts[status]}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{status}</p>
                  </div>
                ))}
              </div>

              {overdueActions.length > 0 && (
                <div className="space-y-2 rounded-lg border border-status-dropped-fg/30 bg-status-dropped-bg/20 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-status-dropped-fg">
                    <Clock3 className="h-3.5 w-3.5" />
                    Overdue: needs attention
                  </p>
                  <ul className="space-y-1">
                    {overdueActions.map((a) => (
                      <li key={a.id} className="flex flex-wrap items-center gap-2 text-xs">
                        <button
                          onClick={() => navigate(`../actions?action=${a.id}`)}
                          className="font-medium text-primary hover:underline"
                        >
                          {a.title}
                        </button>
                        <span className="text-muted-foreground">
                          due {new Date(a.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Evidence status summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evidence Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(evidenceStatusCounts).map(([status, count]) => (
                <div key={status} className="rounded-xl border border-border p-3 text-center">
                  <Badge variant={EVIDENCE_STATUS_VARIANT[status]} className="mb-1">
                    {status}
                  </Badge>
                  <p className="text-lg font-bold text-foreground">{count}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recurrence summary: reuses RecurrenceMatrix, not a second dataset */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recurrence Summary</CardTitle>
          <CardDescription>Same recurrence detection the Learning Loop tab uses, scoped to this report's filter.</CardDescription>
        </CardHeader>
        <CardContent>{loading ? <Skeleton className="h-48 w-full" /> : <RecurrenceMatrix crossValidation={filteredCv} />}</CardContent>
      </Card>

      {/* Ledger outcomes summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ledger Outcomes Summary</CardTitle>
          <CardDescription>What the Traceability Ledger actually confirmed for each cross-validated cause.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(ledgerCounts).map(([result, count]) => {
                const Icon = LEDGER_CONFIG[result]?.icon ?? ShieldQuestion;
                return (
                  <div key={result} className="rounded-xl border border-border p-3 text-center">
                    <p className={cn("flex items-center justify-center gap-1.5 text-xs font-medium", LEDGER_CONFIG[result]?.className)}>
                      <Icon className="h-3.5 w-3.5" />
                      {result}
                    </p>
                    <p className="mt-1 text-lg font-bold text-foreground">{count}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data provenance: same honesty convention as Gap Detection's Model Health card */}
      <Card>
        <CardContent className="flex items-start gap-3 p-4">
          <Database className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="space-y-1 text-xs leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">Data provenance</p>
            <p>
              Reconciliation status, evidence records, action status/dates, and this project's team roster and sprint
              definitions reflect this session's actual recorded state. Nothing here is invented for
              display. Semantic cross-validation scores, NLP-extracted causes, and ledger fact-check results are
              prototype simulations; a production build would compute these from a live NLP service and the real
              Traceability Ledger rather than seeded mock data.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feedback-loop status */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">Feedback-Loop Status</CardTitle>
            <CardDescription>What's been sent downstream, and when, across this report and the Learning Loop queue.</CardDescription>
          </div>
          <div className="no-print shrink-0">
            {isPM ? (
              <Button size="sm" onClick={handleSendReport} disabled={sendingReport || loading}>
                <Send className={cn("h-4 w-4", sendingReport && "animate-pulse")} />
                {sendingReport ? "Sending…" : "Send Full Report"}
              </Button>
            ) : (
              <RestrictedButton label="Only Project Managers can send the full report" variant="default">
                <Send className="h-4 w-4" />
                Send Full Report
              </RestrictedButton>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : scopedFeedbackLog.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nothing has been sent downstream in this scope yet.</p>
          ) : (
            <ul className="space-y-2">
              {scopedFeedbackLog.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2.5 text-xs">
                  <Badge variant={entry.scope === "report" ? "secondary" : "outline"} className="shrink-0 text-[10px]">
                    {entry.scope === "report" ? "Report" : "Item"}
                  </Badge>
                  <span className="font-mono text-muted-foreground">{entry.refLabel}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium text-foreground">
                    {entry.destinations.map((d) => DESTINATION_LABEL[d]).join(" & ")}
                  </span>
                  {entry.sentBy && <span className="text-muted-foreground">by {entry.sentBy}</span>}
                  <span className="ml-auto text-muted-foreground">{formatDateTime(entry.sentAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {toast && (
        <div className="no-print fixed bottom-6 right-6 z-[60] flex max-w-sm items-start gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-2xl animate-slide-up">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-confirmed-fg" />
          <span className="flex-1">{toast}</span>
          <button onClick={() => setToast(null)} className="shrink-0 text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Send, Inbox } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { RecurrenceMatrix } from "./components/RecurrenceMatrix";
import { computeItemGates } from "./components/LearningLoopGateChecklist";
import { LearningLoopQueueCard } from "./components/LearningLoopQueueCard";
import { anonymizeExcerpt } from "./lib/anonymize";
import { useCrossValidation } from "../../hooks/useCrossValidation";
import { useActions } from "../../hooks/useActions";
import { useProjectEvidence } from "../../hooks/useProjectEvidence";
import { useFeedbackLog } from "../../hooks/useFeedbackLog";
import { useActiveProject } from "../../hooks/useActiveProject";
import { sendFeedback } from "../../services/feedbackLogService";

const DESTINATION_LABEL = { "component-2": "Gap Detection", "component-3": "Schedule" };

export function LearningLoopPage() {
  const { activeProjectId } = useActiveProject();
  const { data: crossValidation, loading: cvLoading } = useCrossValidation(activeProjectId);
  const { data: actions, loading: actionsLoading } = useActions(activeProjectId);
  const { data: evidence, loading: evidenceLoading } = useProjectEvidence(activeProjectId);
  // Shared with Reports' own "Feedback-Loop Status" section: every C2/C3
  // send from this queue lands in the same log, keyed by project, so
  // Reports can show a complete picture regardless of which page sent it.
  const { data: sentLog, setData: setSentLog, loading: feedbackLoading } = useFeedbackLog(activeProjectId);
  const loading = cvLoading || actionsLoading || evidenceLoading || feedbackLoading;

  // A reconciled cross-validation entry only reaches this queue once it's
  // evidence-backed and ledger-confirmed: the three inclusion criteria.
  // Anonymization and the reviewer-note check happen below, per item, as
  // *send*-eligibility gates rather than queue filters: an item can be
  // visible here (so a PM can see it needs attention) while still being
  // blocked from actually going out.
  const queue = useMemo(() => {
    return crossValidation
      .filter((cv) => cv.status === "Reconciled")
      .map((cv) => {
        const linkedActions = actions.filter((a) => a.reconciledCauseId === cv.id);
        const verifiedEvidenceCount = evidence.filter(
          (e) => linkedActions.some((a) => a.id === e.actionId) && e.status === "Verified"
        ).length;
        const ledgerOk = cv.ledgerResult === "Confirmed" || cv.ledgerResult === "Partially Supported";
        if (verifiedEvidenceCount === 0 || !ledgerOk) return null;

        const anonymized = anonymizeExcerpt(cv.evidenceExcerpt);
        const gates = computeItemGates({ cv, verifiedEvidenceCount, anonymized });
        return { cv, linkedActions, verifiedEvidenceCount, anonymized, gates, allMet: gates.every((g) => g.met) };
      })
      .filter(Boolean);
  }, [crossValidation, actions, evidence]);

  // Only this page's own item-level sends (scope "item"). Reports'
  // whole-project rollup sends (scope "report") live in the same shared
  // log but aren't about any one item, so they're excluded here and left
  // to Reports' own full feedback-loop history.
  const itemSends = useMemo(() => sentLog.filter((entry) => entry.scope === "item"), [sentLog]);

  // refId → sentAt of its (only ever one) auto-send. itemSends is
  // newest-first, so the first entry seen per item is the one that matters.
  const sentByItem = useMemo(() => {
    const map = new Map();
    itemSends.forEach((entry) => {
      if (!map.has(entry.refId)) map.set(entry.refId, entry.sentAt);
    });
    return map;
  }, [itemSends]);

  // Sending isn't a PM action: a reconciled cause that clears every gate
  // (see LearningLoopGateChecklist) hands itself off the moment it does,
  // same as ComponentThreeHandoffPanel does for a finalized impact
  // assessment. sentBy is null because nobody clicked anything.
  const handleSend = useCallback(
    async (cvId) => {
      const entry = await sendFeedback({
        projectId: activeProjectId,
        scope: "item",
        refId: cvId,
        refLabel: cvId,
        destinations: ["component-2", "component-3"],
        sentBy: null,
      });
      setSentLog((prev) => [entry, ...prev]);
    },
    [activeProjectId, setSentLog]
  );

  // Fires the auto-send exactly once per item. autoSentRef guards against
  // re-firing while sendFeedback's own round trip is still in flight and
  // sentByItem hasn't caught up yet.
  const autoSentRef = useRef(new Set());
  useEffect(() => {
    queue.forEach((item) => {
      const cvId = item.cv.id;
      if (item.allMet && !sentByItem.has(cvId) && !autoSentRef.current.has(cvId)) {
        autoSentRef.current.add(cvId);
        handleSend(cvId);
      }
    });
  }, [queue, sentByItem, handleSend]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recurrence Matrix</CardTitle>
          <CardDescription>
            Where the same structured cause keeps showing up across sprints, the exact pattern that
            justifies re-flagging an issue instead of letting it quietly repeat.
          </CardDescription>
        </CardHeader>
        <CardContent>{loading ? <Skeleton className="h-48 w-full" /> : <RecurrenceMatrix crossValidation={crossValidation} />}</CardContent>
      </Card>

      <div>
        <div className="mb-3 space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Feedback Queue</h3>
          <p className="max-w-2xl text-xs text-muted-foreground">
            Every entry here is a reconciled cross-validation cause with verified evidence and a supporting ledger
            result. Quoted evidence is shown with identities stripped and replaced by role, never a name. This is a
            feed of work outcomes for upstream planning, not a record of who did what.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        ) : queue.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-14 text-center">
            <Inbox className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No reconciled cause is both evidence-backed and ledger-confirmed yet.
            </p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Reconcile a mismatch on Cross-Validation, get its action's evidence verified, and it lands here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map((item) => (
              <LearningLoopQueueCard key={item.cv.id} item={item} sentAt={sentByItem.get(item.cv.id)} />
            ))}
          </div>
        )}
      </div>

      {itemSends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Log</CardTitle>
            <CardDescription>
              What this queue has handed off so far, most recent first. See Reports for the full project-wide
              feedback-loop history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {itemSends.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center gap-2 text-xs">
                  <Send className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="font-mono text-muted-foreground">{entry.refLabel}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium text-foreground">
                    {entry.destinations.map((d) => DESTINATION_LABEL[d]).join(" & ")}
                  </span>
                  <span className="ml-auto text-muted-foreground">
                    {new Date(entry.sentAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

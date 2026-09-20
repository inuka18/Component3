import { useNavigate } from "react-router-dom";
import { CheckCircle2, ShieldCheck, ShieldQuestion, EyeOff } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { LearningLoopGateChecklist } from "./LearningLoopGateChecklist";
import { SPRINT_LABELS } from "../../../data/mockCrossValidation";
import { formatRelativeTime } from "../../../lib/utils";

const LEDGER_ICON = { Confirmed: ShieldCheck, "Partially Supported": ShieldQuestion };

// One queued, reconciled cross-validation entry, gated for Gap Detection /
// Schedule handoff. The excerpt shown here is already anonymized by the
// caller. This component never sees the raw transcript text, so there's
// no path for a name to leak back in through a prop this component forgot
// to redact. Once every gate is met, the caller sends it automatically
// (see LearningLoopPage). sentAt is when that already happened.
export function LearningLoopQueueCard({ item, sentAt }) {
  const navigate = useNavigate();
  const { cv, anonymized, gates } = item;
  const LedgerIcon = LEDGER_ICON[cv.ledgerResult] ?? ShieldQuestion;
  const sprint = SPRINT_LABELS[cv.sprintId];

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] text-muted-foreground">{cv.id}</span>
              <button
                onClick={() => navigate(`../cross-validation?cv=${cv.id}`)}
                className="rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] font-medium text-primary hover:border-primary/40 hover:bg-primary/5 hover:underline"
              >
                {cv.linkedRequirementId} · {sprint?.name.replace(/^Sprint (\d+).*$/, "Sprint $1") ?? cv.sprintId}
              </button>
              <span className="flex items-center gap-1 text-[11px] font-medium text-status-confirmed-fg">
                <LedgerIcon className="h-3 w-3" />
                {cv.ledgerResult}
              </span>
            </div>
            <p className="text-sm font-medium leading-snug text-foreground">{cv.reconciledCause ?? cv.structuredCode}</p>
          </div>
          <Badge variant="outline" className="shrink-0 gap-1 text-[10px]">
            <EyeOff className="h-3 w-3" />
            Anonymized
          </Badge>
        </div>

        <blockquote className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-xs italic leading-relaxed text-muted-foreground">
          "{anonymized.text}"
        </blockquote>

        {cv.reviewerNotes && <p className="text-xs text-muted-foreground">Reviewer notes: {cv.reviewerNotes}</p>}

        <div className="border-t border-border pt-3">
          <LearningLoopGateChecklist gates={gates} />
        </div>

        {sentAt && (
          <div className="flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-status-confirmed-fg" />
            <span className="font-medium text-foreground">Sent to Gap Detection &amp; Schedule</span>
            <span>· {formatRelativeTime(sentAt)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

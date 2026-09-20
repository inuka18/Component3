import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "../../../lib/utils";

// The five criteria gating whether one reconciled cross-validation entry
// is safe to hand off as C2/C3 feedback, computed straight off real
// Component 4 state (never a manual checkbox someone can tick without the
// work actually being done), so "Send" being disabled always traces back
// to a specific, named reason.
export function computeItemGates({ cv, verifiedEvidenceCount, anonymized }) {
  return [
    {
      key: "reconciliation",
      label: "Reconciliation / Approval",
      met: cv.status === "Reconciled",
    },
    {
      key: "evidence",
      label: "Evidence Count",
      met: verifiedEvidenceCount >= 1,
      detail: `${verifiedEvidenceCount} verified`,
    },
    {
      key: "ledger",
      label: "Ledger Result",
      met: cv.ledgerResult === "Confirmed" || cv.ledgerResult === "Partially Supported",
      detail: cv.ledgerResult,
    },
    {
      key: "reviewerNote",
      label: "Reviewer Note",
      met: Boolean(cv.reviewerNotes?.trim()),
    },
    {
      key: "anonymization",
      label: "Anonymization",
      met: anonymized.residualNames.length === 0,
      detail: anonymized.residualNames.length > 0 ? `unresolved name: ${anonymized.residualNames.join(", ")}` : undefined,
    },
  ];
}

export function LearningLoopGateChecklist({ gates }) {
  const failedGates = gates.filter((g) => !g.met);

  return (
    <div className="space-y-1.5">
      {gates.map((gate) => (
        <div key={gate.key} className="flex items-start gap-2 text-xs">
          {gate.met ? (
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-confirmed-fg" />
          ) : (
            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-dropped-fg" />
          )}
          <span className={cn(gate.met ? "text-foreground/90" : "text-foreground/70")}>
            {gate.label}
            {gate.detail && <span className="text-muted-foreground">: {gate.detail}</span>}
          </span>
        </div>
      ))}
      {failedGates.length > 0 && (
        <p className="pt-1 text-xs font-medium text-status-dropped-fg">
          Cannot send: missing {failedGates.map((g) => g.label.toLowerCase()).join(", ")}.
        </p>
      )}
    </div>
  );
}

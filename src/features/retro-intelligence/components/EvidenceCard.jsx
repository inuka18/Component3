import { FileText, GitBranch, TrendingUp, FlaskConical, CalendarDays, ShieldCheck, Check, X } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { RestrictedButton } from "./RestrictedButton";
import { cn } from "../../../lib/utils";

const TYPE_ICON = {
  Document: FileText,
  Repository: GitBranch,
  "Sprint Metric": TrendingUp,
  "Test Result": FlaskConical,
  "Meeting Reference": CalendarDays,
};

const STATUS_VARIANT = { "Pending Review": "warning", Verified: "success", Rejected: "danger" };

const LEDGER_OUTCOME_CLASS = {
  Confirmed: "text-status-confirmed-fg",
  "Partially Supported": "text-status-atrisk-fg",
  "Not Supported": "text-status-dropped-fg",
};

export function EvidenceCard({ evidence, isPM, onVerify, onReject }) {
  const Icon = TYPE_ICON[evidence.type] ?? FileText;
  const canReview = evidence.status === "Pending Review";

  return (
    <Card>
      <CardContent className="space-y-2.5 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Icon className="h-3.5 w-3.5 text-primary" />
            {evidence.type}
          </span>
          <Badge variant={STATUS_VARIANT[evidence.status]} className="shrink-0 text-[10px]">
            {evidence.status}
          </Badge>
        </div>

        <p className="text-sm leading-relaxed text-foreground/90">{evidence.description}</p>
        <p className="text-xs text-muted-foreground">Source: {evidence.source}</p>

        {evidence.ledgerOutcome && (
          <p className={cn("flex items-center gap-1.5 text-xs font-medium", LEDGER_OUTCOME_CLASS[evidence.ledgerOutcome])}>
            <ShieldCheck className="h-3.5 w-3.5" />
            Ledger: {evidence.ledgerOutcome}
          </p>
        )}

        {canReview && (
          <div className="flex items-center gap-2 border-t border-border pt-2.5">
            {isPM ? (
              <>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onVerify?.(evidence)}>
                  <Check className="h-3.5 w-3.5" />
                  Verify
                </Button>
                <Button size="sm" variant="ghost" className="gap-1.5 text-status-dropped-fg hover:text-status-dropped-fg" onClick={() => onReject?.(evidence)}>
                  <X className="h-3.5 w-3.5" />
                  Reject
                </Button>
              </>
            ) : (
              <RestrictedButton label="Only Project Managers can verify evidence">
                <Check className="h-3.5 w-3.5" />
                Verify
              </RestrictedButton>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

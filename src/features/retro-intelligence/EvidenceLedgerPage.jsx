import { useState } from "react";
import { FileCheck2, Clock3, BadgeCheck, XCircle, Link2 } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { EvidenceTable } from "./components/EvidenceTable";
import { LedgerLookupPanel } from "./components/LedgerLookupPanel";
import { useProjectEvidence } from "../../hooks/useProjectEvidence";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useRole, ROLES } from "../../context/RoleContext";
import { reviewEvidenceEntry } from "../../services/evidenceService";
import { cn } from "../../lib/utils";

function KpiTile({ label, value, icon: Icon, highlight }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <p className={cn("text-lg font-bold leading-none text-foreground", highlight)}>{value}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function EvidenceLedgerPage() {
  const { activeProjectId } = useActiveProject();
  const { role } = useRole();
  const isPM = role === ROLES.PM;
  const { data: evidence, setData: setEvidence, loading } = useProjectEvidence(activeProjectId);
  const [busyId, setBusyId] = useState(null);

  const handleReview = async (item, status) => {
    setBusyId(item.id);
    const updated = await reviewEvidenceEntry(item.id, { status, ledgerOutcome: item.ledgerOutcome, actionId: item.actionId });
    setBusyId(null);
    setEvidence((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  const kpiValues = {
    total: evidence.length,
    pending: evidence.filter((e) => e.status === "Pending Review").length,
    verified: evidence.filter((e) => e.status === "Verified").length,
    rejected: evidence.filter((e) => e.status === "Rejected").length,
    ledgerLinked: evidence.filter((e) => Boolean(e.ledgerOutcome)).length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[4.5rem] w-full rounded-xl" />)
          : [
              { label: "Evidence Total", value: kpiValues.total, icon: FileCheck2 },
              { label: "Pending Review", value: kpiValues.pending, icon: Clock3, highlight: "text-status-atrisk-fg" },
              { label: "Verified", value: kpiValues.verified, icon: BadgeCheck, highlight: "text-status-confirmed-fg" },
              { label: "Rejected", value: kpiValues.rejected, icon: XCircle, highlight: "text-status-dropped-fg" },
              { label: "Ledger Events Linked", value: kpiValues.ledgerLinked, icon: Link2 },
            ].map((kpi) => <KpiTile key={kpi.label} {...kpi} />)}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Evidence</h3>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <EvidenceTable
            evidence={evidence}
            isPM={isPM}
            projectId={activeProjectId}
            busyId={busyId}
            onAccept={(item) => handleReview(item, "Verified")}
            onReject={(item) => handleReview(item, "Rejected")}
          />
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Rejecting keeps the original evidence record, marked Rejected, never deleted. Expand a row (where a linked
          requirement exists) to compare its claim against the ledger.
        </p>
      </div>

      <LedgerLookupPanel projectId={activeProjectId} />
    </div>
  );
}

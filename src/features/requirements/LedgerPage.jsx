import { useNavigate } from "react-router-dom";
import { ShieldCheck, Info } from "lucide-react";
import { LedgerTable } from "./components/LedgerTable";
import { useLedger } from "../../hooks/useLedger";
import { useActiveProject } from "../../hooks/useActiveProject";

export function LedgerPage() {
  const { activeProjectId } = useActiveProject();
  const { data: entries, loading } = useLedger(activeProjectId);
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-foreground/90">
          <span className="font-semibold">Immutable audit trail.</span> Every requirement status
          transition is recorded as a transaction on the{" "}
          <span className="font-medium">Ethereum Sepolia</span> testnet. Once written, an entry
          cannot be altered or deleted retroactively. This table is a read-only mirror of that
          on-chain ledger.
        </p>
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-status-confirmed-fg" />
        <span>{entries.length} verified transactions on record</span>
      </div>

      <LedgerTable
        entries={entries}
        loading={loading}
        onSelectRequirement={(id) => navigate(`/projects/${activeProjectId}/requirements/list?req=${id}`)}
      />
    </div>
  );
}

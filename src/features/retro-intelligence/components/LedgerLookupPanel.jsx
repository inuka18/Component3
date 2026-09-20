import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShieldCheck, ShieldAlert, ShieldQuestion, Link2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { LedgerTable } from "../../requirements/components/LedgerTable";
import { fetchLedgerEntriesForRequirement, fetchLedgerLookup } from "../../../services/ledgerService";
import { getRequirementById } from "../../../data/mockRequirements";
import { cn } from "../../../lib/utils";

const RESULT_CONFIG = {
  Confirmed: { icon: ShieldCheck, textClass: "text-status-confirmed-fg" },
  "Partially Supported": { icon: ShieldQuestion, textClass: "text-status-atrisk-fg" },
  "Not Supported": { icon: ShieldAlert, textClass: "text-status-dropped-fg" },
};

function OutcomeBadge({ result }) {
  if (!result) return null;
  const config = RESULT_CONFIG[result];
  const Icon = config?.icon ?? ShieldQuestion;
  return (
    <span className={cn("flex shrink-0 items-center gap-1.5 text-sm font-semibold", config?.textClass)}>
      <Icon className="h-4 w-4" />
      {result}
    </span>
  );
}

const VIA_LABEL = { requirement: "Requirement ID", action: "Action ID", "delay-log": "Delay-log ID" };

// The "Ledger Fact-Check" stage: a thin wrapper around the exact same
// LedgerTable / mockLedger.js Requirements already built
// (src/features/requirements/), not a second ledger dataset or UI.
//
// Two modes, one component:
//  - Scoped (pass `requirementId`): renders straight to that requirement's
//    ledger history, what CrossValidationPage uses per mismatch row, and
//    what the Evidence Ledger reuses again for its per-evidence Claim
//    Comparison (see EvidenceTable.jsx).
//  - Standalone (omit `requirementId`): renders its own search box that
//    resolves a requirement ID, an action ID, or a delay-log ID down to
//    the requirement whose ledger history answers it. Action/delay-log
//    IDs aren't ledger keys themselves, they're pointers through
//    mockCrossValidation (see ledgerService.js's resolveLedgerQuery).
export function LedgerLookupPanel({ requirementId, requirementTitle, ledgerResult, projectId }) {
  if (requirementId) {
    return (
      <ScopedLookup requirementId={requirementId} requirementTitle={requirementTitle} ledgerResult={ledgerResult} projectId={projectId} />
    );
  }
  return <SearchLookup projectId={projectId} />;
}

function ScopedLookup({ requirementId, requirementTitle, ledgerResult, projectId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchLedgerEntriesForRequirement(requirementId)
      .then((res) => {
        if (!cancelled) setEntries(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [requirementId]);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">Ledger Fact-Check</CardTitle>
          <CardDescription>
            {requirementTitle ? `${requirementId} · ${requirementTitle}` : requirementId}: every status transition
            recorded on the traceability ledger.
          </CardDescription>
        </div>
        <OutcomeBadge result={ledgerResult} />
      </CardHeader>
      <CardContent>
        <LedgerTable
          entries={entries}
          loading={loading}
          onSelectRequirement={(id) => navigate(`/projects/${projectId}/requirements/list?req=${id}`)}
        />
      </CardContent>
    </Card>
  );
}

function SearchLookup({ projectId }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null); // { resolved, entries }
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const runSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const res = await fetchLedgerLookup(query);
    setResult(res);
    setSearched(true);
    setLoading(false);
  };

  const resolved = result?.resolved;
  const requirement = resolved?.requirementId ? getRequirementById(resolved.requirementId) : null;
  // When the query resolved through a cross-validation entry (an action ID
  // or a delay-log ID), that entry's own ledgerResult IS the fact-check
  // outcome for the claim being traced. Surface it the same way the
  // scoped view does. A bare requirement-ID search has no single claim to
  // score, so no outcome badge is shown for it.
  const outcome = resolved?.via !== "requirement" ? resolved?.cv?.ledgerResult : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ledger Lookup</CardTitle>
        <CardDescription>
          Search by requirement ID (REQ-124), action ID (action-03), or delay-log ID (log-nc-09-1). Results come
          straight from the same traceability ledger Requirements' Ledger page reads.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={runSearch} className="flex max-w-md items-center gap-2">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="REQ-204, action-03, log-nc-09-1…" />
          <Button type="submit" size="sm" disabled={loading || !query.trim()} className="shrink-0 gap-1.5">
            <Search className="h-3.5 w-3.5" />
            {loading ? "Searching…" : "Search"}
          </Button>
        </form>

        {searched && !loading && (
          <>
            {!resolved || (resolved.via === "unknown" && !resolved.requirementId) ? (
              <p className="text-sm text-muted-foreground">
                No requirement, action, or delay-log record matches "{result.resolved?.query ?? query}".
              </p>
            ) : !resolved.requirementId ? (
              <p className="text-sm text-muted-foreground">
                Found {resolved.via === "action" ? "the action" : "the record"}, but it isn't linked to a requirement yet.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-border px-3 py-2">
                  <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <Link2 className="h-3.5 w-3.5 shrink-0" />
                    {VIA_LABEL[resolved.via]} <span className="font-mono text-foreground">{resolved.query}</span>
                    {resolved.cv && (
                      <>
                        <span>→</span>
                        <span className="font-mono text-foreground">{resolved.cv.id}</span>
                      </>
                    )}
                    <span>→</span>
                    <button
                      type="button"
                      onClick={() => navigate(`/projects/${projectId}/requirements/list?req=${resolved.requirementId}`)}
                      className="font-mono font-medium text-primary hover:underline"
                    >
                      {resolved.requirementId}
                    </button>
                    {requirement && <span>· {requirement.title}</span>}
                  </span>
                  <OutcomeBadge result={outcome} />
                </div>
                <LedgerTable
                  entries={result.entries}
                  loading={false}
                  onSelectRequirement={(id) => navigate(`/projects/${projectId}/requirements/list?req=${id}`)}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

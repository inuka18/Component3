import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Radar } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { GapTypeBadge } from "./components/GapTypeBadge";
import { SeverityBadge } from "./components/SeverityBadge";
import { GapDetailPanel } from "./components/GapDetailPanel";
import { useGaps } from "../../hooks/useGaps";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useRole, ROLES } from "../../context/RoleContext";
import { GAP_TYPES, SEVERITIES, GAP_STATUSES } from "../../data/mockGaps";
import { getRequirementById } from "../../data/mockRequirements";
import { markGapReviewed } from "../../services/gapDetectionService";
import { resolveRefRoute } from "../../lib/activityLinks";
import { cn } from "../../lib/utils";

const STATUS_VARIANT = { Open: "warning", Reviewed: "info", Propagated: "success" };

const TYPE_OPTIONS = ["all", ...GAP_TYPES];
const SEVERITY_OPTIONS = ["all", ...SEVERITIES];
const STATUS_OPTIONS = ["all", ...GAP_STATUSES];

function FilterChips({ label, options, value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-0.5 text-xs font-medium text-muted-foreground">{label}:</span>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium capitalize transition-colors",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {opt === "all" ? "All" : opt}
          </button>
        );
      })}
    </div>
  );
}

export function GapInventoryPage() {
  const { activeProjectId } = useActiveProject();
  const { role } = useRole();
  const isPM = role === ROLES.PM;
  const { data: gaps, setData: setGaps, loading } = useGaps(activeProjectId);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedGapId, setSelectedGapId] = useState(null);

  // Deep link support: Overview's "View Gap" / Recent Gap Alerts land here
  // with ?gap=<id> and open it automatically, same pattern as
  // Requirements/Schedule/Meetings/Retrospectives.
  useEffect(() => {
    const gapId = searchParams.get("gap");
    if (!gapId || loading) return;
    const match = gaps.find((g) => g.id === gapId);
    if (match) setSelectedGapId(match.id);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("gap");
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loading, gaps]);

  const filtered = useMemo(() => {
    return gaps
      .filter((g) => (typeFilter === "all" ? true : g.type === typeFilter))
      .filter((g) => (severityFilter === "all" ? true : g.severity === severityFilter))
      .filter((g) => (statusFilter === "all" ? true : g.status === statusFilter))
      .filter((g) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          g.id.toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.requirementId.toLowerCase().includes(q)
        );
      });
  }, [gaps, search, typeFilter, severityFilter, statusFilter]);

  const handleMarkReviewed = async (gapId) => {
    await markGapReviewed(gapId);
    setGaps((prev) => prev.map((g) => (g.id === gapId ? { ...g, status: "Reviewed" } : g)));
  };

  if (!loading && gaps.length === 0) {
    return (
      <EmptyState
        icon={Radar}
        title="No gaps detected yet"
        description="Once requirements and execution evidence exist for this project, run a detection pass from the Workspace tab to surface gaps here."
        action={null}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, title, description, or requirement ID…"
          className="pl-8 sm:max-w-md"
        />
      </div>

      <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-muted/30 p-3">
        <FilterChips label="Type" options={TYPE_OPTIONS} value={typeFilter} onChange={setTypeFilter} />
        <FilterChips label="Severity" options={SEVERITY_OPTIONS} value={severityFilter} onChange={setSeverityFilter} />
        <FilterChips label="Status" options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Requirement</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Change / Disruption</TableHead>
              <TableHead>Delay Type</TableHead>
              <TableHead>Affected Tasks</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-[8rem]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                  No gaps match the current filters.
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filtered.map((gap) => {
                const requirement = getRequirementById(gap.requirementId);
                const reqRoute = resolveRefRoute(gap.projectId, "requirement", gap.requirementId);
                return (
                  <TableRow key={gap.id} onClick={() => setSelectedGapId(gap.id)} className="cursor-pointer">
                    <TableCell className="font-mono text-xs font-medium text-primary">{gap.id}</TableCell>
                    <TableCell>
                      <GapTypeBadge type={gap.type} short />
                    </TableCell>
                    <TableCell className="max-w-[14rem]">
                      {requirement && reqRoute ? (
                        <Link
                          to={reqRoute}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex max-w-full items-center gap-1 text-xs font-medium text-foreground hover:text-primary"
                        >
                          <span className="font-mono text-primary">{requirement.id}</span>
                          <span className="truncate text-muted-foreground">· {requirement.title}</span>
                        </Link>
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">{gap.requirementId}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={gap.severity} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm font-medium text-foreground">
                      {gap.confidence}%
                    </TableCell>
                    <TableCell className="max-w-[12rem]">
                      <p className="truncate text-xs font-medium text-foreground">{gap.changeType}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{gap.disruptionType}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {gap.delayType ?? "N/A"}
                    </TableCell>
                    <TableCell className="text-center text-sm text-foreground">{gap.taskIds?.length ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[gap.status]} className="text-[10px]">
                        {gap.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {!loading && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {gaps.length} gaps
        </p>
      )}

      <GapDetailPanel
        gapId={selectedGapId}
        open={Boolean(selectedGapId)}
        onOpenChange={(open) => !open && setSelectedGapId(null)}
        isPM={isPM}
        onMarkReviewed={handleMarkReviewed}
      />
    </div>
  );
}

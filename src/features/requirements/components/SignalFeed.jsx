import { useEffect, useMemo, useRef, useState } from "react";
import {
  MessageSquare,
  Mail,
  StickyNote,
  MessagesSquare,
  Users,
  Check,
  X,
  Upload,
  Filter,
} from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Skeleton } from "../../../components/ui/skeleton";
import { Badge } from "../../../components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import { ClassificationBadge } from "./ClassificationBadge";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { UploadDocumentDialog } from "./UploadDocumentDialog";
import { CLASSIFICATIONS } from "../../../data/mockSignals";
import { getRequirementById } from "../../../data/mockRequirements";
import { formatRelativeTime, cn } from "../../../lib/utils";

const SOURCE_ICONS = {
  Standup: Users,
  Slack: MessagesSquare,
  Email: Mail,
  "Jira Comment": StickyNote,
  Teams: MessageSquare,
  "Document Upload": Upload,
};

const SOURCE_ORDER = ["Standup", "Slack", "Email", "Jira Comment", "Teams", "Document Upload"];

// IST (+05:30) calendar day. Every mock signal timestamp is written in
// that offset, and Signal Analytics' date-range params (from/to) are keyed
// the same way, so this has to resolve a timestamp to the same day that
// produced them regardless of the host machine's own local timezone.
function dateKey(iso) {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
}

// Formats a "YYYY-MM-DD" key for display, anchored to UTC on purpose, so
// a key produced by dateKey() above (already a plain calendar day, no
// time-of-day) can't get reinterpreted a day off by the host's own local
// timezone the way `new Date("2026-08-29T00:00:00")` (no offset) would.
function formatDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function RestrictedButton({ label, children }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0}>
          <Button variant="outline" size="sm" disabled className="pointer-events-none opacity-60">
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function SignalFeed({ signals, setSignals, loading, onSelectRequirement, isPM, highlightSignalId, presetFilters, onClearPresetFilters }) {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null); // { from, to } as "YYYY-MM-DD", or null
  const highlightRef = useRef(null);

  // A deep link from elsewhere (Signal Analytics' drill-through, or the
  // Alignment Score chart's "View in Signal Feed") lands here with either
  // a specific signal to surface, or a classification/source/date-range
  // to pre-apply, same filters the user could set by hand, just
  // pre-populated rather than a separate hidden view.
  useEffect(() => {
    if (highlightSignalId) {
      setSearch("");
      setClassFilter("all");
      setSourceFilter("all");
      setDateRange(null);
      return;
    }
    if (presetFilters) {
      setSearch("");
      setClassFilter(presetFilters.classification ?? "all");
      setSourceFilter(presetFilters.source ?? "all");
      setDateRange(presetFilters.from ? { from: presetFilters.from, to: presetFilters.to ?? presetFilters.from } : null);
    }
    // Depends on the individual fields, not the `presetFilters` object
    // itself. The caller rebuilds that object from URL search params on
    // every render, so keying off its reference would re-apply (and wipe
    // out any subsequent manual edit) on every unrelated re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightSignalId, presetFilters?.classification, presetFilters?.source, presetFilters?.from, presetFilters?.to]);

  useEffect(() => {
    if (!highlightSignalId || !highlightRef.current) return;
    highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightSignalId, loading]);

  const clearFilters = () => {
    setClassFilter("all");
    setSourceFilter("all");
    setDateRange(null);
    onClearPresetFilters?.();
  };

  const filtered = useMemo(() => {
    return signals
      .filter((s) => (classFilter === "all" ? true : s.classification === classFilter))
      .filter((s) => (sourceFilter === "all" ? true : s.source === sourceFilter))
      .filter((s) => (dateRange ? dateKey(s.timestamp) >= dateRange.from && dateKey(s.timestamp) <= dateRange.to : true))
      .filter((s) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return s.text.toLowerCase().includes(q) || s.channel.toLowerCase().includes(q);
      });
  }, [signals, search, classFilter, sourceFilter, dateRange]);

  const presetActive = classFilter !== "all" || sourceFilter !== "all" || Boolean(dateRange);
  const availableSources = useMemo(
    () => SOURCE_ORDER.filter((src) => signals.some((s) => s.source === src)),
    [signals]
  );

  const reviewSignal = (id, decision) => {
    setSignals((prev) => prev.map((s) => (s.id === id ? { ...s, reviewStatus: decision } : s)));
  };

  const handleUpload = (newSignals) => {
    setSignals((prev) => [...newSignals, ...prev]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search signal text or channel…"
          className="sm:flex-1"
        />
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Classification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All classifications</SelectItem>
            {CLASSIFICATIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {availableSources.map((src) => (
              <SelectItem key={src} value={src}>
                {src}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isPM ? (
          <div className="flex shrink-0 gap-2">
            <UploadDocumentDialog onUpload={handleUpload} projectId={signals[0]?.projectId} />
          </div>
        ) : (
          <div className="flex shrink-0 gap-2">
            <RestrictedButton label="Only Project Managers can upload documents">
              <Upload className="h-4 w-4" />
              Upload Document
            </RestrictedButton>
          </div>
        )}
      </div>

      {presetActive && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
          <Filter className="h-3.5 w-3.5 shrink-0" />
          <span>
            Filtered from Signal Analytics
            {classFilter !== "all" && `, ${classFilter}`}
            {sourceFilter !== "all" && `, ${sourceFilter}`}
            {dateRange && `, ${formatDateKey(dateRange.from)}${dateRange.to !== dateRange.from ? ` – ${formatDateKey(dateRange.to)}` : ""}`}
          </span>
          <button onClick={clearFilters} className="ml-auto shrink-0 font-medium hover:underline">
            Clear
          </button>
        </div>
      )}

      <div className="space-y-3">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </div>
          ))}

        {!loading && filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            No signals match the current filters.
          </div>
        )}

        {!loading &&
          filtered.map((signal) => {
            const SourceIcon = SOURCE_ICONS[signal.source] ?? MessageSquare;
            const mapped = signal.mappedRequirementId
              ? getRequirementById(signal.mappedRequirementId)
              : null;
            const isPending = signal.reviewStatus === "pending";
            const isRejected = signal.reviewStatus === "rejected";

            const isHighlighted = signal.id === highlightSignalId;

            return (
              <div
                key={signal.id}
                ref={isHighlighted ? highlightRef : undefined}
                className={cn(
                  "rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm animate-slide-up",
                  isPending ? "border-primary/30 bg-primary/[0.03]" : "border-border",
                  isRejected && "opacity-60",
                  isHighlighted && "ring-2 ring-primary border-primary/40"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                      <SourceIcon className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-medium text-foreground">{signal.author}</span>
                    <span className="hidden sm:inline">· {signal.channel}</span>
                    <span>· {formatRelativeTime(signal.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isPending && (
                      <Badge variant="warning" className="text-[10px]">
                        Pending Review
                      </Badge>
                    )}
                    {isRejected && (
                      <Badge variant="danger" className="text-[10px]">
                        Rejected
                      </Badge>
                    )}
                    <ClassificationBadge classification={signal.classification} />
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-foreground/90">"{signal.text}"</p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <ConfidenceMeter value={signal.confidence} />

                  <div className="flex items-center gap-2">
                    {mapped ? (
                      <button
                        onClick={() => onSelectRequirement(mapped.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                      >
                        <span className="font-mono">{mapped.id}</span>
                        <span className="hidden sm:inline">· {mapped.title}</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        Unmatched
                      </span>
                    )}

                    {isPending && isPM && (
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 border-status-confirmed-fg/40 px-2 text-status-confirmed-fg hover:bg-status-confirmed-bg"
                          onClick={() => reviewSignal(signal.id, "accepted")}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 border-status-dropped-fg/40 px-2 text-status-dropped-fg hover:bg-status-dropped-bg"
                          onClick={() => reviewSignal(signal.id, "rejected")}
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {!loading && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {signals.length} signals
        </p>
      )}
    </div>
  );
}

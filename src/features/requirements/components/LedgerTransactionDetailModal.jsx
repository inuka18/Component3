import { useEffect, useState } from "react";
import {
  Link2,
  Unlink,
  Copy,
  Check,
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowUpRight,
  Blocks,
  Globe,
} from "lucide-react";
import { Dialog, DialogContent } from "../../../components/ui/dialog";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../components/ui/tooltip";
import { StatusBadge } from "./StatusBadge";
import { ClassificationBadge } from "./ClassificationBadge";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { getTriggeringSignalForEntry } from "../../../data/mockLedger";
import { formatDateTime, truncateHash, cn } from "../../../lib/utils";

const EVENT_ICON = { "Manual Link Added": Link2, "Manual Link Removed": Unlink };

// A transaction's full drill-down: deliberately styled as a distinct
// "verified record" rather than an ordinary detail sheet: a dark chrome
// header band (the same --sidebar-bg token the app's own always-dark
// sidebar uses, not a new color), monospace throughout for every
// hash/technical value, and a chain-link motif tying the header to the
// verification section below it.
export function LedgerTransactionDetailModal({ entry, open, onOpenChange, onSelectRequirement }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  if (!entry) return null;

  const isManual = entry.eventType === "Manual Link Added" || entry.eventType === "Manual Link Removed";
  const isCreated = entry.eventType === "Requirement Created";
  const EventIcon = EVENT_ICON[entry.eventType];
  const signal = getTriggeringSignalForEntry(entry);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(entry.txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access denied (e.g. insecure context), nothing to
      // recover to, the hash is still right there to select by hand.
    }
  };

  const goToRequirement = (id) => {
    onOpenChange(false);
    onSelectRequirement(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
        {/* Header band: always-dark chrome regardless of app theme, same
            token the sidebar itself uses, so this reads as infrastructure
            rather than an ordinary form. */}
        <div className="relative overflow-hidden bg-sidebar px-6 py-5 text-sidebar-foreground">
          <Link2 className="pointer-events-none absolute -right-3 -top-3 h-24 w-24 rotate-12 text-sidebar-foreground/[0.06]" />
          <div className="relative flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-sidebar-foreground/60">
            <ShieldCheck className="h-3.5 w-3.5" />
            Transaction · Block #{entry.blockNumber.toLocaleString()}
          </div>
          <div className="relative mt-2 flex flex-wrap items-center gap-2">
            <span className="break-all font-mono text-base font-semibold text-sidebar-foreground">{entry.txHash}</span>
            <button
              onClick={handleCopy}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-sidebar-foreground/20 px-2 py-1 text-[11px] font-medium text-sidebar-foreground/90 transition-colors hover:bg-sidebar-foreground/10"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="relative mt-3">
            {isManual ? (
              <Badge variant="ripple" className="gap-1 text-[10px]">
                {EventIcon && <EventIcon className="h-3 w-3" />}
                {entry.eventType}
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 border-sidebar-foreground/25 bg-transparent text-[10px] text-sidebar-foreground/90">
                {entry.eventType}
              </Badge>
            )}
          </div>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6 scrollbar-thin">
          {/* Block / network info */}
          <dl className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <dt className="flex items-center gap-1 text-muted-foreground">
                <Blocks className="h-3 w-3" />
                Block
              </dt>
              <dd className="mt-1 font-mono font-medium text-foreground">#{entry.blockNumber.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Timestamp</dt>
              <dd className="mt-1 font-medium text-foreground">{formatDateTime(entry.timestamp)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-muted-foreground">
                <Globe className="h-3 w-3" />
                Network
              </dt>
              <dd className="mt-1 font-medium text-foreground">Ethereum Sepolia Testnet</dd>
            </div>
          </dl>

          {/* Requirement(s) */}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {isManual ? "Requirements Linked" : "Requirement"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => goToRequirement(entry.requirementId)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
              >
                <span className="font-mono text-primary">{entry.requirementId}</span>
                <span className="truncate text-muted-foreground">· {entry.requirementTitle}</span>
              </button>
              {entry.relatedRequirementId && (
                <>
                  <ArrowUpRight className="h-3.5 w-3.5 rotate-45 text-muted-foreground" />
                  <button
                    onClick={() => goToRequirement(entry.relatedRequirementId)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                  >
                    <span className="font-mono text-primary">{entry.relatedRequirementId}</span>
                    <span className="truncate text-muted-foreground">· {entry.relatedRequirementTitle}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Status transition, or the manual event + who/reason */}
          {isManual ? (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Event</p>
              <div className="flex items-center gap-2">
                <Badge variant="ripple" className="gap-1">
                  {EventIcon && <EventIcon className="h-3.5 w-3.5" />}
                  {entry.eventType}
                </Badge>
                {entry.actor && <span className="text-xs text-muted-foreground">by {entry.actor}</span>}
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{entry.eventType}</p>
              <div className="flex items-center gap-2.5">
                {entry.previousStatus ? (
                  <StatusBadge status={entry.previousStatus} />
                ) : (
                  <span className="rounded-full border border-dashed border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                    Created
                  </span>
                )}
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <StatusBadge status={entry.newStatus} />
              </div>
            </div>
          )}

          {/* Triggering signal (Status Change) / reason (Manual Link) */}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {isManual ? "Reason" : isCreated ? "Source" : "Triggering Signal"}
            </p>
            <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3.5">
              {signal && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <ClassificationBadge classification={signal.classification} />
                  <span className="text-[11px] text-muted-foreground">{signal.source}</span>
                </div>
              )}
              <p className="text-sm leading-relaxed text-foreground/90">{entry.triggeringSignal}</p>
              {signal && (
                <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5">
                  <ConfidenceMeter value={signal.confidence} />
                  <span className="text-[11px] text-muted-foreground">{signal.author}</span>
                </div>
              )}
            </div>
          </div>

          {/* Verification */}
          <div className="rounded-lg border border-status-confirmed-fg/25 bg-status-confirmed-bg/30 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-sm font-medium text-status-confirmed-fg">
                <ShieldCheck className="h-4 w-4" />
                Signature Verified
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-status-confirmed-fg/15 px-2 py-0.5 text-[10px] font-medium text-status-confirmed-fg">
                <Lock className="h-2.5 w-2.5" />
                Immutable, cannot be altered retroactively
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 border-t border-status-confirmed-fg/20 pt-2.5 text-xs">
              <Link2 className="h-3.5 w-3.5 shrink-0 text-status-confirmed-fg/70" />
              <span className="text-muted-foreground">Previous Block Hash:</span>
              <span className="font-mono text-foreground/80">{truncateHash(entry.previousBlockHash)}</span>
            </div>
          </div>

          <div className="flex justify-end border-t border-border pt-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button variant="outline" size="sm" disabled className={cn("pointer-events-none gap-1.5 opacity-60")}>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    View on Explorer
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Testnet explorer link, prototype only</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

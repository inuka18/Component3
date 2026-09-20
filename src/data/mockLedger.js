// Traceability ledger, derived directly from mockRequirements.js status
// histories so every ledger row is guaranteed to match the requirement
// detail panel it corresponds to (same statuses, signals, timestamps).
// In production this table would be populated by listening to on-chain
// events rather than computed client-side, but the shape is identical.
//
// Two entry shapes share this one array, discriminated by `eventType`:
//  - "Status Change" (the original, still fully derived from
//    mockRequirements, untouched by anything below): previousStatus/
//    newStatus carry the transition, `requirementId` is the one
//    requirement involved.
//  - "Manual Link Added" / "Manual Link Removed" (appended live by the
//    Network Map's manual-linking feature, see mockManualLinks.js):
//    previousStatus/newStatus are null, `requirementId` +
//    `relatedRequirementId` are the two requirements the link connects,
//    `triggeringSignal` carries the human-entered reason, and `actor`
//    records who did it: a manual override is exactly as auditable as
//    anything the system produces on its own, never a silent backdoor.

import { mockRequirements } from "./mockRequirements";
import { mockSignals } from "./mockSignals";

export const EVENT_TYPES = ["Status Change", "Requirement Created", "Manual Link Added", "Manual Link Removed"];

// Placeholder predecessor for the very first block in the chain, never a
// real requirement's hash, just a recognizable "nothing came before this"
// value, same format as every other hash here.
const GENESIS_HASH = `0x${"0".repeat(16)}`;

function pseudoHash(seed) {
  // Deterministic-looking mock tx hash, not cryptographically meaningful.
  let h1 = 0x2f6e2b1;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    h1 = (h1 ^ c) * 16777619;
    h2 = (h2 + c * 2654435761) >>> 0;
  }
  const hex1 = (h1 >>> 0).toString(16).padStart(8, "0").slice(0, 8);
  const hex2 = (h2 >>> 0).toString(16).padStart(8, "0").slice(0, 8);
  return `0x${hex1}${hex2}`;
}

function buildLedger() {
  const entries = [];
  mockRequirements.forEach((req) => {
    req.statusHistory.forEach((entry, idx) => {
      const previousStatus = idx === 0 ? null : req.statusHistory[idx - 1].status;
      const seed = `${req.id}-${idx}-${entry.timestamp}`;
      entries.push({
        txHash: pseudoHash(seed),
        projectId: req.projectId,
        eventType: "Status Change",
        requirementId: req.id,
        requirementTitle: req.title,
        relatedRequirementId: null,
        relatedRequirementTitle: null,
        previousStatus,
        newStatus: entry.status,
        triggeringSignal: entry.signal,
        actor: null,
        timestamp: entry.timestamp,
        blockNumber: 4_812_000 + entries.length * 17,
        previousBlockHash: null,
      });
    });
  });

  // Chain each entry to whichever one immediately precedes it in true
  // chronological order. A real chain's "previous block" is always
  // global order, not per-requirement order, so this has to be a second
  // pass over a chronologically-sorted view rather than computed inline
  // above.
  const chronological = [...entries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  chronological.forEach((entry, i) => {
    entry.previousBlockHash = i === 0 ? GENESIS_HASH : chronological[i - 1].txHash;
  });

  // Most recent first, like a real block explorer feed.
  return entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export const mockLedger = buildLedger();

let ledgerSeq = mockLedger.length;

// Appended by the Network Map's manual-link feature (create or remove),
// the ledger's only writable path, deliberately narrow: it can only ever
// add a "Manual Link Added"/"Manual Link Removed" record, never touch or
// rewrite a Status Change entry the automatic pipeline already wrote.
export function appendManualLinkLedgerEntry({
  projectId,
  eventType,
  sourceId,
  sourceTitle,
  targetId,
  targetTitle,
  reason,
  actor,
}) {
  ledgerSeq += 1;
  const seed = `manual-${sourceId}-${targetId}-${eventType}-${Date.now()}-${ledgerSeq}`;
  const entry = {
    txHash: pseudoHash(seed),
    projectId,
    eventType,
    requirementId: sourceId,
    requirementTitle: sourceTitle,
    relatedRequirementId: targetId,
    relatedRequirementTitle: targetTitle,
    previousStatus: null,
    newStatus: null,
    triggeringSignal: reason,
    actor,
    timestamp: new Date().toISOString(),
    blockNumber: 4_812_000 + ledgerSeq * 17,
    // mockLedger is always kept most-recent-first, so whatever currently
    // sits at index 0 (before this entry is unshifted in) is this
    // entry's true chronological predecessor.
    previousBlockHash: mockLedger[0]?.txHash ?? GENESIS_HASH,
  };
  // Most-recent-first, same convention buildLedger() sorts to initially.
  mockLedger.unshift(entry);
  return entry;
}

// Appended once per requirement created via the SRS onboarding upload
// (see requirementsService.createRequirementsFromSRS), the moment a
// requirement is baselined straight from an authoritative document
// instead of extracted from a signal. Shaped exactly like a "Status
// Change" entry (previousStatus null -> "Confirmed"), so it renders
// through the same "Created" pill the very first entry of any hand-built
// requirement already does, just tagged with its own eventType so the
// origin is traceable back to the uploaded document rather than a quote.
export function appendRequirementCreatedLedgerEntry({ projectId, requirementId, requirementTitle, sourceDocument, actor }) {
  ledgerSeq += 1;
  const seed = `req-created-${requirementId}-${Date.now()}-${ledgerSeq}`;
  const entry = {
    txHash: pseudoHash(seed),
    projectId,
    eventType: "Requirement Created",
    requirementId,
    requirementTitle,
    relatedRequirementId: null,
    relatedRequirementTitle: null,
    previousStatus: null,
    newStatus: "Confirmed",
    triggeringSignal: `Detected from the uploaded SRS document "${sourceDocument}".`,
    actor,
    timestamp: new Date().toISOString(),
    blockNumber: 4_812_000 + ledgerSeq * 17,
    previousBlockHash: mockLedger[0]?.txHash ?? GENESIS_HASH,
  };
  mockLedger.unshift(entry);
  return entry;
}

// The Traceability Ledger UI never stores a signal *id* on a "Status
// Change" entry: mockRequirements.js's own statusHistory only ever
// carries the signal as freeform quoted text. Some (not all, see
// mockSignals.js's own header comment) of those quotes are deliberately
// mirrored word-for-word by a real mockSignals.js record, so this
// recovers that link by matching quoted text rather than a stored id.
// Returns null for a "Manual Link" entry (no signal involved) or a
// Status Change entry whose quote has no mirrored signal record.
export function getTriggeringSignalForEntry(entry) {
  if (entry.eventType !== "Status Change" || !entry.triggeringSignal) return null;
  return (
    mockSignals.find(
      (s) => s.mappedRequirementId === entry.requirementId && entry.triggeringSignal.includes(s.text)
    ) ?? null
  );
}

export function getLedgerEntriesForRequirement(requirementId) {
  // A manual link is one event about two requirements, not two separate
  // events, so it surfaces in either requirement's own ledger history
  // without ever appearing as a duplicate row.
  return mockLedger.filter(
    (entry) => entry.requirementId === requirementId || entry.relatedRequirementId === requirementId
  );
}

export function getLedgerForProject(projectId) {
  return mockLedger.filter((entry) => entry.projectId === projectId);
}

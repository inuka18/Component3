import { getManualLinksForProject, findManualLink, addManualLink, removeManualLink } from "../data/mockManualLinks";
import { appendManualLinkLedgerEntry } from "../data/mockLedger";
import { getRequirementById } from "../data/mockRequirements";
import { delay } from "./simulatedLatency";

export async function fetchManualLinks(projectId) {
  await delay(350);
  return getManualLinksForProject(projectId);
}

// PM-only (enforced in the UI, not re-checked here, same trust boundary
// every other service in this app uses). Writes the link, then writes the
// matching ledger entry in the same call, so the two can never drift out
// of sync with each other.
export async function createManualLink({ projectId, sourceId, targetId, reason, createdBy }) {
  await delay(400);
  if (findManualLink(sourceId, targetId)) {
    throw new Error("These requirements are already linked.");
  }
  const link = addManualLink({ projectId, sourceId, targetId, reason, createdBy });

  const source = getRequirementById(sourceId);
  const target = getRequirementById(targetId);
  appendManualLinkLedgerEntry({
    projectId,
    eventType: "Manual Link Added",
    sourceId,
    sourceTitle: source?.title ?? sourceId,
    targetId,
    targetTitle: target?.title ?? targetId,
    reason,
    actor: createdBy,
  });

  return link;
}

export async function deleteManualLink(link, removedBy) {
  await delay(350);
  const removed = removeManualLink(link.id);
  if (!removed) return null;

  const source = getRequirementById(removed.sourceId);
  const target = getRequirementById(removed.targetId);
  appendManualLinkLedgerEntry({
    projectId: removed.projectId,
    eventType: "Manual Link Removed",
    sourceId: removed.sourceId,
    sourceTitle: source?.title ?? removed.sourceId,
    targetId: removed.targetId,
    targetTitle: target?.title ?? removed.targetId,
    reason: `Removed (originally: "${removed.reason}")`,
    actor: removedBy,
  });

  return removed;
}

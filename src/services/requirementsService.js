// Data-access layer for requirements. Every consumer (hooks, components)
// talks to this module, never to mockRequirements.js directly. When a real
// backend exists, only the bodies below need to change to `fetch(...)`
// calls; callers are unaffected.
import { mockRequirements, getRequirementById, createRequirement, CLUSTERS, RESOURCE_ROLES } from "../data/mockRequirements";
import { appendRequirementCreatedLedgerEntry } from "../data/mockLedger";
import { delay } from "./simulatedLatency";

export async function fetchRequirements(projectId) {
  await delay(500);
  if (!projectId) return mockRequirements;
  return mockRequirements.filter((r) => r.projectId === projectId);
}

export async function fetchRequirementById(id) {
  await delay(300);
  const req = getRequirementById(id);
  if (!req) throw new Error(`Requirement ${id} not found`);
  return req;
}

export async function fetchClusters() {
  await delay(200);
  return CLUSTERS;
}

export async function fetchResourceRoles() {
  await delay(150);
  return RESOURCE_ROLES;
}

// PM-only: DetectRequirementsDialog's confirm step, baselining a project
// that has no requirements yet. Every checked item lands here with what
// the review screen lets a PM edit (title, description, category,
// resourceRole, defaulted to "Unassigned" but overridable per row) plus
// the cluster the mock detection pass inferred. granularity is the one
// field this flow always defaults (harder to judge upfront for a
// brand-new requirement than role is), left for a PM to set later from
// the requirement detail panel same as any other record. One
// createRequirement() call plus one "Requirement Created" ledger entry
// per item, the same two-writes-per-call shape createManualLink uses, so
// a requirement's origin is exactly as auditable whether it came from an
// SRS upload or a signal.
export async function createRequirementsFromSRS({ projectId, items, sourceDocument, actor }) {
  await delay(400);
  return items.map((item) => {
    const requirement = createRequirement({
      projectId,
      title: item.title,
      description: item.description,
      resourceRole: item.resourceRole,
      granularity: "Sprint Commitment",
      cluster: item.cluster,
      category: item.category,
      sourceLabel: `Detected from the uploaded SRS document "${sourceDocument}".`,
    });
    appendRequirementCreatedLedgerEntry({
      projectId,
      requirementId: requirement.id,
      requirementTitle: requirement.title,
      sourceDocument,
      actor,
    });
    return requirement;
  });
}

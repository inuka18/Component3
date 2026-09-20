// Data-access layer for Component 2: Gap Detection. Every consumer (hooks,
// components) talks to this module, never to the mock data files directly,
// same convention as requirementsService.js. Status-changing actions
// (Mark Reviewed, Send to C3, Retrain Model) mutate the shared mock-data
// module in place so the change is visible everywhere that re-reads it,
// consistent with how invites/transcripts/action items behave elsewhere in
// this prototype (no backend, session-only persistence).
import { mockGaps, getGapById } from "../data/mockGaps";
import { mockExecutionEvidence, getExecutionEvidenceByIds } from "../data/mockExecutionEvidence";
import { mockResourceCapacity } from "../data/mockResourceCapacity";
import { mockModelHealth } from "../data/mockModelHealth";
import { mockRequirements, getRequirementById } from "../data/mockRequirements";
import { mockTasks } from "../data/mockSchedule";
import { mockPropagationRuns, getPropagationRunsForProject } from "../data/mockPropagationRuns";
import { delay } from "./simulatedLatency";

const SEVERITY_RANK = { High: 3, Medium: 2, Low: 1 };
const RISK_LEVELS = ["Low", "Medium", "High"];

function riskAt(severity, delta) {
  const idx = RISK_LEVELS.indexOf(severity);
  return RISK_LEVELS[Math.min(2, Math.max(0, idx + delta))];
}

export async function fetchGaps(projectId) {
  await delay(500);
  const scoped = projectId ? mockGaps.filter((g) => g.projectId === projectId) : mockGaps;
  return [...scoped].sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt));
}

export async function fetchGapById(id) {
  await delay(300);
  const gap = getGapById(id);
  if (!gap) throw new Error(`Gap ${id} not found`);
  return gap;
}

export async function fetchExecutionEvidence(projectId) {
  await delay(450);
  const scoped = projectId ? mockExecutionEvidence.filter((e) => e.projectId === projectId) : mockExecutionEvidence;
  return [...scoped].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function fetchExecutionEvidenceForGap(gap) {
  await delay(250);
  return getExecutionEvidenceByIds(gap?.evidenceIds);
}

export async function fetchResourceCapacity(projectId) {
  await delay(450);
  return projectId ? mockResourceCapacity.filter((c) => c.projectId === projectId) : mockResourceCapacity;
}

export async function fetchModelHealth() {
  await delay(300);
  return mockModelHealth;
}

// Requirements Tracked / Execution Coverage / gap-type counts / affected
// tasks / sprint risk: everything the Overview page's KPI row and Recent
// Gap Alerts card need, computed from the same source data every other
// page in this feature reads.
export async function fetchGapOverviewMetrics(projectId) {
  await delay(550);

  const requirements = projectId
    ? mockRequirements.filter((r) => r.projectId === projectId)
    : mockRequirements;
  const tasks = projectId ? mockTasks.filter((t) => t.projectId === projectId) : mockTasks;
  const gaps = projectId ? mockGaps.filter((g) => g.projectId === projectId) : mockGaps;

  const requirementIdsWithTasks = new Set(tasks.map((t) => t.requirementId));
  const coveredCount = requirements.filter((r) => requirementIdsWithTasks.has(r.id)).length;
  const executionCoveragePct = requirements.length
    ? Math.round((coveredCount / requirements.length) * 100)
    : 0;

  const forwardGaps = gaps.filter((g) => g.type === "Forward").length;
  const backwardGaps = gaps.filter((g) => g.type === "Backward").length;
  const resourceGaps = gaps.filter((g) => g.type === "Resource").length;
  const highSeverityGaps = gaps.filter((g) => g.severity === "High").length;

  const affectedTaskIds = new Set(gaps.flatMap((g) => g.taskIds ?? []));

  const sprintRisk = highSeverityGaps >= 3 ? "High" : highSeverityGaps >= 1 ? "Medium" : "Low";

  const alerts = [...gaps]
    .sort((a, b) => {
      const rank = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
      if (rank !== 0) return rank;
      return new Date(b.detectedAt) - new Date(a.detectedAt);
    })
    .slice(0, 3)
    .map((g) => ({ ...g, requirement: getRequirementById(g.requirementId) }));

  return {
    requirementsTracked: requirements.length,
    executionCoveragePct,
    forwardGaps,
    backwardGaps,
    resourceGaps,
    highSeverityGaps,
    affectedTasks: affectedTaskIds.size,
    sprintRisk,
    alerts,
  };
}

// ---- Mutating actions (PM-only at the UI layer via RestrictedButton) ----

export async function markGapReviewed(gapId) {
  await delay(400);
  const gap = getGapById(gapId);
  if (gap && gap.status === "Open") gap.status = "Reviewed";
  return gap;
}

export async function sendGapToC3(gapId) {
  await delay(400);
  const gap = getGapById(gapId);
  if (gap) gap.status = "Propagated";
  return gap;
}

// Simulates a fresh detection pass. The Workspace page runs a short
// animated sequence (requirement comparison → evidence analysis →
// resource analysis → classification → dependency analysis) then reports
// this result. No backend exists to actually re-run semantic comparison,
// so the breakdown is a fixed, illustrative result rather than being
// recomputed from mockGaps. The Overview/Inventory/Assessment pages
// already compute their own live counts from that data on every visit, so
// nothing here needs to reconcile with those numbers for them to reflect
// the current, real state whenever the user goes back to them.
export async function runDetection(projectId) {
  await delay(400);
  return {
    scannedAt: new Date().toISOString(),
    projectId: projectId ?? null,
    forward: 7,
    backward: 4,
    resource: 3,
    total: 14,
  };
}

// Simulates retraining the classifier from validated Component 4 (Retro
// Intelligence) instances. Bumps the version, folds the pending C4
// instances into the training count, and nudges F1 up slightly. Explicitly
// a prototype simulation; see the note rendered in ModelHealthCard.
export async function retrainModel() {
  await delay(1600);
  const [major, minor, patch] = mockModelHealth.version.replace(/^v/, "").split(".").map(Number);
  mockModelHealth.version = `v${major}.${minor}.${patch + 1}`;
  mockModelHealth.trainingInstances += mockModelHealth.newC4Instances;
  mockModelHealth.f1Score = Math.min(0.99, +(mockModelHealth.f1Score + 0.01).toFixed(2));
  mockModelHealth.lastRetrained = new Date().toISOString();
  mockModelHealth.newC4Instances = 0;
  return mockModelHealth;
}

// ---- Impact Propagation → Impact Assessment handoff ----
// The Propagation page ("the engine") calls computeImpactBreakdown() and
// recordPropagationRun() once per calculation. The Assessment page ("the
// report") only ever reads the resulting records via
// fetchPropagationRuns(). It never recomputes a breakdown itself.

// Derives Day/Week/Sprint impact figures from the same ripple traversal
// and schedule-impact number the Propagation page already computed,
// scaled per granularity, not re-derived from scratch.
export function computeImpactBreakdown(gap, ripple, scheduleImpact) {
  const directTasks = ripple.branches.map((b) => b.directTask);
  const downstreamTasks = ripple.branches.flatMap((b) => b.downstream.flatMap((level) => level.tasks));
  const allTasks = [...directTasks, ...downstreamTasks];
  const totalStoryPoints = allTasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
  const uniqueRequirementIds = new Set(allTasks.map((t) => t.requirementId).filter(Boolean));

  const dayWorkload = Math.round(scheduleImpact * 0.35);
  const weekWorkload = scheduleImpact;
  const sprintPoints = Math.max(totalStoryPoints, Math.round(scheduleImpact / 4));

  return {
    dayImpact: {
      affectedTasks: ripple.directCount,
      workloadImpact: `+${dayWorkload}h`,
      expectedSlip: dayWorkload >= 8 ? "1 day" : "0.5 days",
      risk: riskAt(gap.severity, -1),
    },
    weekImpact: {
      affectedTasks: ripple.directCount + ripple.downstreamCount,
      workloadImpact: `+${weekWorkload}h`,
      expectedSlip: `${Math.max(1, Math.round(weekWorkload / 8))} days`,
      risk: gap.severity,
    },
    sprintImpact: {
      affectedCommitments: uniqueRequirementIds.size || (ripple.directCount > 0 ? 1 : 0),
      storyPointsAtRisk: sprintPoints,
      expectedSprintSlip: `${Math.max(1, Math.round(weekWorkload / 6))} days`,
      risk: ripple.downstreamCount > 0 ? riskAt(gap.severity, 1) : gap.severity,
    },
  };
}

// Appends a new run, newest first, matching how every other list in this
// feature is ordered. Handing it to Schedule isn't a separate step a PM
// triggers later. Finalizing the assessment IS the handoff, so sentToC3
// is set the same moment the run is recorded.
export function recordPropagationRun({ gap, dayImpact, weekImpact, sprintImpact }) {
  const timestamp = new Date().toISOString();
  const run = {
    id: `run-${Date.now()}`,
    projectId: gap.projectId,
    gapId: gap.id,
    timestamp,
    dayImpact,
    weekImpact,
    sprintImpact,
    sentToC3: true,
    sentToC3At: timestamp,
  };
  mockPropagationRuns.unshift(run);
  return run;
}

export async function fetchPropagationRuns(projectId) {
  await delay(450);
  return getPropagationRunsForProject(projectId);
}

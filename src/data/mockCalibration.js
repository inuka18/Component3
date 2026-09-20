// Default calibration weights for Component 2's propagation formula:
//   Schedule Impact = Base Impact × Gap-Type Weight × Change/Disruption
//                      Weight × Dependency Factor
// These are seed/default values only: the Propagation page lets a PM
// edit them inline (session-only, like the calibration weights on the
// Workspace page). Every gap in mockGaps.js carries a `disruptionCategory`
// key matching one of the categories below, so the formula always
// resolves to a real weight rather than a guess made at render time.

export const GAP_TYPE_CALIBRATION = [
  { key: "Forward", example: "Missing implementation", weight: 1.2 },
  { key: "Backward", example: "Unauthorized scope", weight: 1.15 },
  { key: "Resource", example: "Missing capacity", weight: 1.3 },
];

export const CHANGE_DISRUPTION_CALIBRATION = {
  requirement: [
    { key: "requirement-expansion", label: "Requirement Expansion", example: "New scope", weight: 1.35 },
    { key: "requirement-reduction", label: "Requirement Reduction", example: "Dropped feature", weight: 0.6 },
    {
      key: "requirement-constraint-change",
      label: "Requirement Constraint Change",
      example: "Rework",
      weight: 1.25,
    },
    { key: "missing-implementation", label: "Missing Implementation", example: "Forgotten requirement", weight: 1.2 },
  ],
  resource: [
    { key: "developer-absence", label: "Developer Absence", example: "PTO", weight: 1.4 },
    { key: "qa-unavailability", label: "QA Unavailability", example: "Capacity shortage", weight: 1.25 },
    { key: "client-feedback-delay", label: "Client Feedback Delay", example: "Waiting", weight: 1.1 },
    { key: "dependency-block", label: "Dependency Block", example: "Blocked task", weight: 1.3 },
  ],
};

export function flattenDisruptionCalibration() {
  return [...CHANGE_DISRUPTION_CALIBRATION.requirement, ...CHANGE_DISRUPTION_CALIBRATION.resource];
}

// Base Impact (hours) before any multiplier is applied, scaled by the
// gap's own severity rating.
export const BASE_IMPACT_HOURS = { High: 16, Medium: 10, Low: 6 };

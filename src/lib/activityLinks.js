// Shared resolver for "what page does this event/notification point at":
// used by both the Dashboard's Activity Feed and the top-bar Notifications
// dropdown so an entry that references a requirement, task, meeting, or
// retrospective can be clicked straight through to it instead of being a
// dead end. Falls back to the section's landing page when no specific
// item id is known (e.g. a general "gap detected" AI flag).
export function resolveRefRoute(projectId, refType, refId) {
  if (!projectId) return null;
  const base = `/projects/${projectId}`;
  switch (refType) {
    case "requirement":
      return refId ? `${base}/requirements/list?req=${refId}` : `${base}/requirements`;
    case "task":
      return refId ? `${base}/schedule/week?task=${refId}` : `${base}/schedule`;
    case "meeting":
      return refId ? `${base}/meetings?meeting=${refId}` : `${base}/meetings`;
    case "retro":
      return refId
        ? `${base}/retro-intelligence/retrospectives?retro=${refId}`
        : `${base}/retro-intelligence/retrospectives`;
    case "gap":
      return refId ? `${base}/gap-detection/inventory?gap=${refId}` : `${base}/gap-detection/overview`;
    default:
      return base;
  }
}

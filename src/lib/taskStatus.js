// Shared task-status/cause helpers: the single source of truth for "late",
// "at risk", and status color/label for every feature that reads task
// records off src/data/mockSchedulePhases.js. Both Component 3's Schedule
// feature (src/features/schedule/) and the base-product Kanban Board
// (src/features/board/) import from here rather than from each other, so
// neither feature depends on the other's internals. They're independent
// views sharing a data source and a status vocabulary, nothing else.
//
// TASK_STATUSES (see mockSchedulePhases.js) has four values: not-started,
// in-progress, review, done. A status change made on the Kanban board
// writes directly to the same task object the Gantt reads, so it shows up
// there immediately, and vice versa.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function flattenTasks(phases) {
  return phases.flatMap((phase) => phase.tasks.map((task) => ({ ...task, phaseId: phase.id, phaseName: phase.name })));
}

export function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / MS_PER_DAY);
}

// Positive = running late (actual end after baseline end). Zero or
// negative = on time or ahead.
export function varianceDays(task) {
  return daysBetween(task.baselineEnd, task.end);
}

export function isLate(task) {
  return varianceDays(task) > 0;
}

// The single source of truth for "does this task need attention right
// now": used for the Needs Attention list, At Risk KPI counts, and the
// buffer-deficit calculation. A done task that finished a couple of days
// late is still worth showing as a red bar in the Gantt (isLate() covers
// that), but it's finished. There's no ongoing risk left to manage, so
// it's excluded here unless explicitly flagged critical.
export function isAtRisk(task) {
  if (task.status === "done") return Boolean(task.critical);
  return task.critical || isLate(task);
}

export function setTaskStatus(task, status) {
  task.status = status;
  if (status === "done") task.progress = 100;
  else if (status === "not-started") task.progress = 0;
}

const CAUSE_STYLE = {
  "requirement-change": {
    label: "Requirement Change",
    badgeVariant: "default", // primary/blue
    dotClass: "bg-primary",
    fillClass: "fill-primary",
    textClass: "text-primary",
  },
  "resource-disruption": {
    label: "Resource Disruption",
    badgeVariant: "warning", // amber
    dotClass: "bg-status-atrisk-fg",
    fillClass: "fill-status-atrisk-fg",
    textClass: "text-status-atrisk-fg",
  },
  "ripple-propagation": {
    label: "Ripple Propagation",
    badgeVariant: "ripple", // purple
    dotClass: "bg-status-ripple-fg",
    fillClass: "fill-status-ripple-fg",
    textClass: "text-status-ripple-fg",
  },
};

export function causeStyle(type) {
  return (
    CAUSE_STYLE[type] ?? {
      label: type ?? "Unknown",
      badgeVariant: "outline",
      dotClass: "bg-muted-foreground",
      fillClass: "fill-muted-foreground",
      textClass: "text-muted-foreground",
    }
  );
}

// Task bar / status-dot / card color: green for on-track or done, red for
// anything late or flagged critical, blue for in review, muted for work
// that hasn't started.
export function statusBarClass(task) {
  if (task.status === "done") return isLate(task) ? "bg-status-dropped-fg" : "bg-status-confirmed-fg";
  if (isAtRisk(task)) return "bg-status-dropped-fg";
  if (task.status === "not-started") return "bg-muted-foreground/40";
  if (task.status === "review") return "bg-status-modified-fg";
  return "bg-primary";
}

export function statusBadgeVariant(task) {
  if (task.status === "done") return isLate(task) ? "danger" : "success";
  if (isAtRisk(task)) return "danger";
  if (task.status === "not-started") return "outline";
  if (task.status === "review") return "info";
  return "default";
}

export function statusLabel(task) {
  if (task.status === "done") return "Done";
  if (task.status === "review") return "Review";
  if (task.status === "in-progress") return "In Progress";
  return "Not Started";
}

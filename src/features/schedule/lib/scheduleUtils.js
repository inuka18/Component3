// Date/variance/color helpers for Component 3: Schedule. Every view (Day/
// Week/Sprint/Project Timeline) and every chart component reads task
// timing through these so "late", "critical", and "today" always mean the
// same thing everywhere.
//
// The status/cause helpers (flattenTasks, isAtRisk, statusLabel,
// causeStyle, etc.) live in src/lib/taskStatus.js instead of here. They're
// shared with the base-product Kanban Board (src/features/board/), which
// reads the exact same task records and status field but must not depend
// on this feature's internals. Re-exported below so every existing import
// of them from "../lib/scheduleUtils" across this feature keeps working
// unchanged.
import { TODAY } from "../../../data/mockSchedulePhases";
import { daysBetween } from "../../../lib/taskStatus";

export { TODAY };
export {
  flattenTasks,
  daysBetween,
  varianceDays,
  isLate,
  isAtRisk,
  setTaskStatus,
  causeStyle,
  statusBarClass,
  statusBadgeVariant,
  statusLabel,
} from "../../../lib/taskStatus";

// Actual (not baseline) span of a task, in whole days. Used by the
// Day View's "actual vs. planned" bar chart.
export function durationDays(task) {
  return Math.max(daysBetween(task.start, task.end), 0);
}
export function baselineDurationDays(task) {
  return Math.max(daysBetween(task.baselineStart, task.baselineEnd), 0);
}

// Mutates the task's actual start/end in place by a day offset. This is
// the ONE place Gantt drag-to-reschedule writes back to. It deliberately
// only touches start/end, never baselineStart/baselineEnd: the baseline
// is the original plan, so every downstream variance/at-risk calculation
// keeps comparing the new position against it automatically. Tasks are
// read straight off the shared mockSchedulePhases module (no clone
// anywhere in the read path), so this mutation is visible everywhere
// else in the app immediately, same as every other direct-mutation flow
// in this prototype.
export function rescheduleTaskByDays(task, deltaDays) {
  if (!deltaDays) return;
  task.start = addDays(new Date(task.start), deltaDays).toISOString();
  task.end = addDays(new Date(task.end), deltaDays).toISOString();
}

// The Buffer Redistribution action's mutator: pulls a critical task's
// *end* in by a day (recovering slip) without moving its start, unlike
// rescheduleTaskByDays which shifts the whole task. Compressing rather
// than shifting is what "sourcing buffer from elsewhere" means here.
export function pullTaskInByDays(task, days) {
  if (!days) return;
  task.end = addDays(new Date(task.end), -days).toISOString();
}

export function formatShortDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDayOfWeek(iso) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function isSameDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

// Does a task's actual window touch a given [rangeStart, rangeEnd] span at
// all. Used to pool tasks into the Day/Week/Sprint/Project granularity
// levels on the Schedule Overview's variance chart.
export function overlapsRange(task, rangeStart, rangeEnd) {
  return new Date(task.start) <= rangeEnd && new Date(task.end) >= rangeStart;
}

export function isTaskActiveOn(task, day) {
  const start = new Date(task.start);
  const end = new Date(task.end);
  const d = new Date(day);
  d.setHours(12, 0, 0, 0);
  return d >= startOfDay(start) && d <= endOfDay(end);
}

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Sunday-start week containing `date`.
export function startOfWeek(date) {
  const d = startOfDay(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// A single task's remaining points as of `day`. Linearly ramps that
// task's OWN progress between its actual start (0% complete) and either
// its actual completion date for a done task (100% by then) or TODAY at
// its live progress% for one still open, rather than holding it at full
// points until an all-or-nothing snap on completion day. There's no real
// historical per-day progress snapshot to read, so this is the closest
// smooth reconstruction of "how much of this task was probably burned by
// day D" the available data supports, and, summed across a whole task
// pool with staggered start/end dates, it produces a genuinely
// continuous-looking decline instead of a flat line with one cliff at
// the end.
function remainingForTask(task, day) {
  const pts = task.storyPoints || 0;
  const taskStart = startOfDay(new Date(task.start));
  if (day < taskStart) return pts;

  if (task.status === "done") {
    const taskEnd = startOfDay(new Date(task.end));
    if (day >= taskEnd) return 0;
    const span = Math.max(daysBetween(taskStart, taskEnd), 1);
    const elapsed = daysBetween(taskStart, day);
    return pts * (1 - elapsed / span);
  }

  // Still open, ramp toward its live progress% by TODAY. Never
  // evaluated past TODAY (computeBurndownSeries stops there), so there's
  // no "flat at progress% forever after" case to handle.
  const span = Math.max(daysBetween(taskStart, TODAY), 1);
  const elapsed = daysBetween(taskStart, day);
  const fraction = Math.min(Math.max(elapsed / span, 0), 1);
  return pts * (1 - (fraction * (task.progress || 0)) / 100);
}

// Multi-level burndown data: for every day in [rangeStart, rangeEnd],
// the ideal/planned remaining effort (a straight line from the task
// pool's total story points down to zero at rangeEnd) and the actual
// remaining effort as of that day (see remainingForTask). Days after
// TODAY carry `actual: null` (hasn't happened yet); only `planned`
// extends there.
//
// `poolForDay`, when passed, lets BurndownChart reuse this one function
// for its Day/Week/Sprint overlay lines: each recomputes "remaining"
// against a differently-scoped task pool per day (e.g. only tasks active
// that specific day) while every line still shares this same x-axis.
// Without it, `tasks` is used unchanged for every day (the Sprint-level
// line, and the Planned baseline).
export function computeBurndownSeries(tasks, rangeStart, rangeEnd, { poolForDay } = {}) {
  const start = startOfDay(rangeStart);
  const end = startOfDay(rangeEnd);
  const totalDays = Math.max(daysBetween(start, end), 1);
  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  const series = [];
  for (let i = 0; i <= totalDays; i++) {
    const day = addDays(start, i);
    const pool = poolForDay ? poolForDay(day) : tasks;
    const planned = Math.max(0, totalPoints - (totalPoints / totalDays) * i);

    const actual = day <= TODAY ? pool.reduce((sum, t) => sum + remainingForTask(t, day), 0) : null;

    series.push({
      date: day.toISOString(),
      planned: Math.round(planned * 10) / 10,
      actual: actual === null ? null : Math.round(actual * 10) / 10,
    });
  }
  return series;
}

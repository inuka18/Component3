import { useMemo, useState } from "react";
import {
  computeBurndownSeries,
  isTaskActiveOn,
  overlapsRange,
  startOfWeek,
  endOfDay,
  addDays,
  isSameDay,
  formatShortDate,
  TODAY,
} from "../lib/scheduleUtils";
import { cn } from "../../../lib/utils";

const CHART_W = 480;
const LEFT_PAD = 34;
const RIGHT_PAD = 10;
const TOP_PAD = 14;
const BOTTOM_PAD = 24;
const Y_TICKS = 4;

const LEVELS = [
  { key: "sprint", label: "Sprint", swatchClass: "bg-status-confirmed-fg", defaultOn: true },
  { key: "week", label: "Week", swatchClass: "bg-primary/60", defaultOn: false },
  { key: "day", label: "Day", swatchClass: "bg-primary/30", defaultOn: false },
];

function dayPool(tasks, day) {
  return tasks.filter((t) => isTaskActiveOn(t, day));
}
function weekPool(tasks, day) {
  const ws = startOfWeek(day);
  return tasks.filter((t) => overlapsRange(t, ws, endOfDay(addDays(ws, 6))));
}

// The direct visual expression of Component 3's "four simultaneous
// levels" claim: a proper multi-line burndown, not a bar list. One
// Planned/Ideal baseline (navy dashed), a Sprint-level Actual line
// segment-colored by whether each day tracked at/ahead (green) or
// behind (red) plan, and two opt-in overlay lines, Week- and Day-level
// Actual, recomputed against a narrower task pool per day so they read
// noisier/finer-grained than the smoothed Sprint line, in a related but
// visually distinct shade of the same primary hue (same "actual"
// concept, different granularity).
export function BurndownChart({ tasks, rangeStart, rangeEnd, onSelectDay, highlightDate, height = 220 }) {
  const [enabled, setEnabled] = useState(() =>
    Object.fromEntries(LEVELS.map((l) => [l.key, l.defaultOn]))
  );

  const sprintSeries = useMemo(() => computeBurndownSeries(tasks, rangeStart, rangeEnd), [tasks, rangeStart, rangeEnd]);
  const weekSeries = useMemo(
    () => (enabled.week ? computeBurndownSeries(tasks, rangeStart, rangeEnd, { poolForDay: (d) => weekPool(tasks, d) }) : null),
    [tasks, rangeStart, rangeEnd, enabled.week]
  );
  const daySeries = useMemo(
    () => (enabled.day ? computeBurndownSeries(tasks, rangeStart, rangeEnd, { poolForDay: (d) => dayPool(tasks, d) }) : null),
    [tasks, rangeStart, rangeEnd, enabled.day]
  );

  const n = sprintSeries.length;
  const chartH = height;
  const plotW = CHART_W - LEFT_PAD - RIGHT_PAD;
  const plotH = chartH - TOP_PAD - BOTTOM_PAD;
  const maxValue = Math.max(1, ...sprintSeries.map((p) => Math.max(p.planned, p.actual ?? 0)));

  const xAt = (i) => LEFT_PAD + (n <= 1 ? 0 : (i / (n - 1)) * plotW);
  const yAt = (v) => TOP_PAD + (1 - v / maxValue) * plotH;

  const yTicks = Array.from({ length: Y_TICKS + 1 }, (_, i) => Math.round((maxValue / Y_TICKS) * i));
  const xTickEvery = n <= 10 ? 1 : Math.ceil(n / 8);

  const todayIdx = sprintSeries.findIndex((p) => isSameDay(p.date, TODAY));
  const highlightIdx = highlightDate ? sprintSeries.findIndex((p) => isSameDay(p.date, highlightDate)) : -1;
  const showHighlight = highlightIdx >= 0 && highlightIdx !== todayIdx;

  const linePath = (series, key) =>
    series
      .map((p, i) => (p[key] == null ? null : `${xAt(i)},${yAt(p[key])}`))
      .filter(Boolean)
      .join(" ");

  const clickable = Boolean(onSelectDay);

  // Points with a real (non-null) actual value, up to and including
  // today, everything from here on is unknowable, so nothing renders.
  const knownPoints = sprintSeries.map((p, i) => ({ ...p, i })).filter((p) => p.actual != null);
  const latest = knownPoints[knownPoints.length - 1] ?? null;

  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  let varianceText = "No data yet, this window hasn't started.";
  let projectedText = "N/A";
  if (latest) {
    const diff = Math.round((latest.actual - latest.planned) * 10) / 10;
    varianceText = diff > 0.5 ? `+${diff} pts behind plan` : diff < -0.5 ? `${Math.abs(diff)} pts ahead of plan` : "On track";
    const daysElapsed = Math.max(latest.i, 1);
    const burned = totalPoints - latest.actual;
    const velocity = burned / daysElapsed;
    if (velocity > 0 && latest.actual > 0) {
      const projectedDate = addDays(new Date(latest.date), Math.ceil(latest.actual / velocity));
      projectedText = formatShortDate(projectedDate);
    } else if (latest.actual <= 0) {
      projectedText = "Done";
    } else {
      projectedText = "Insufficient velocity yet";
    }
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <svg width="14" height="8" className="shrink-0">
            <line x1="0" y1="4" x2="14" y2="4" className="stroke-foreground" strokeWidth={2} strokeDasharray="3,2" />
          </svg>
          Planned
        </span>
        {LEVELS.map((level) => (
          <button
            key={level.key}
            type="button"
            onClick={() => setEnabled((prev) => ({ ...prev, [level.key]: !prev[level.key] }))}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors",
              enabled[level.key]
                ? "border-primary/40 bg-primary/5 text-foreground"
                : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", level.swatchClass)} />
            {level.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <svg
          width="100%"
          viewBox={`0 0 ${CHART_W} ${chartH}`}
          className="min-w-[260px]"
          style={{ aspectRatio: `${CHART_W} / ${chartH}`, height: "auto" }}
        >
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={LEFT_PAD} y1={yAt(v)} x2={CHART_W - RIGHT_PAD} y2={yAt(v)} className="stroke-border" strokeWidth={1} strokeDasharray="2,3" />
              <text x={LEFT_PAD - 5} y={yAt(v) + 3} textAnchor="end" className="fill-muted-foreground text-[9px]">
                {v}
              </text>
            </g>
          ))}

          {sprintSeries.map((p, i) =>
            i % xTickEvery === 0 ? (
              <text key={p.date} x={xAt(i)} y={chartH - 6} textAnchor="middle" className="fill-muted-foreground text-[9px]">
                {formatShortDate(p.date)}
              </text>
            ) : null
          )}

          {showHighlight && (
            <line x1={xAt(highlightIdx)} y1={TOP_PAD} x2={xAt(highlightIdx)} y2={chartH - BOTTOM_PAD} className="stroke-status-atrisk-fg" strokeWidth={2} strokeDasharray="1,2" />
          )}
          {todayIdx >= 0 && (
            <g>
              <line x1={xAt(todayIdx)} y1={TOP_PAD} x2={xAt(todayIdx)} y2={chartH - BOTTOM_PAD} className="stroke-primary/70" strokeWidth={1.5} />
              <text x={xAt(todayIdx)} y={TOP_PAD - 4} textAnchor="middle" className="fill-primary text-[8px] font-semibold">
                TODAY
              </text>
            </g>
          )}

          {daySeries && (
            <polyline points={linePath(daySeries, "actual")} fill="none" className="stroke-primary/30" strokeWidth={1.5} />
          )}
          {weekSeries && (
            <polyline points={linePath(weekSeries, "actual")} fill="none" className="stroke-primary/60" strokeWidth={1.5} />
          )}

          <polyline points={linePath(sprintSeries, "planned")} fill="none" className="stroke-foreground" strokeWidth={2} strokeDasharray="4,3" />

          {enabled.sprint &&
            sprintSeries.slice(1).map((p, idx) => {
              const i = idx + 1;
              const prev = sprintSeries[i - 1];
              if (prev.actual == null || p.actual == null) return null;
              const behind = p.actual > p.planned;
              return (
                <line
                  key={p.date}
                  x1={xAt(i - 1)}
                  y1={yAt(prev.actual)}
                  x2={xAt(i)}
                  y2={yAt(p.actual)}
                  className={behind ? "stroke-status-dropped-fg" : "stroke-status-confirmed-fg"}
                  strokeWidth={2.5}
                />
              );
            })}

          {enabled.sprint &&
            knownPoints.map((p) => (
              <circle
                key={p.date}
                cx={xAt(p.i)}
                cy={yAt(p.actual)}
                r={clickable ? 4 : 3}
                className={cn(
                  p.actual > p.planned ? "fill-status-dropped-fg" : "fill-status-confirmed-fg",
                  clickable && "cursor-pointer"
                )}
                onClick={clickable ? () => onSelectDay(new Date(p.date)) : undefined}
              >
                <title>
                  {formatShortDate(p.date)}: {p.actual} remaining (planned {p.planned})
                </title>
              </circle>
            ))}
        </svg>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg border border-border bg-muted/30 p-2">
          <p className={cn("text-sm font-bold", varianceText.includes("behind") ? "text-status-dropped-fg" : "text-status-confirmed-fg")}>
            {varianceText}
          </p>
          <p className="text-[10px] text-muted-foreground">Current Variance</p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-2">
          <p className="text-sm font-bold text-foreground">{projectedText}</p>
          <p className="text-[10px] text-muted-foreground">Projected Completion</p>
        </div>
      </div>

      {clickable && (
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground">🖱️ Click a point to see that day's task breakdown</p>
      )}
    </div>
  );
}

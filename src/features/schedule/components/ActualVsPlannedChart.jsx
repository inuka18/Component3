import { durationDays, baselineDurationDays } from "../lib/scheduleUtils";

const LABEL_W = 160;
const BAR_MAX_W = 260;
const ROW_H = 30;
const ROW_GAP = 10;
const TOP_PAD = 8;
const AXIS_TICK_COUNT = 5;

// Per-task "actual vs. planned" duration bar, shared by Day View (today's
// tasks) and the Week/Sprint InsightsDrawer (that window's tasks). One row
// per task: a blue bar for the actual duration up to the planned length,
// a red segment for whatever runs past it (the overrun), and a navy tick
// marking exactly where the planned duration would have ended. A task
// that finished within its planned span never grows a red segment; the
// tick simply sits at or past the end of the blue bar.
export function ActualVsPlannedChart({ tasks, onSelectTask }) {
  if (tasks.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No tasks to chart.</p>;
  }

  const maxDays = Math.max(1, ...tasks.map((t) => Math.max(durationDays(t), baselineDurationDays(t), 1)));
  const chartW = LABEL_W + BAR_MAX_W + 40;
  const chartH = TOP_PAD + tasks.length * (ROW_H + ROW_GAP) + 24;
  const ticks = Array.from({ length: AXIS_TICK_COUNT }, (_, i) => Math.round((i / (AXIS_TICK_COUNT - 1)) * maxDays));

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} className="min-w-full">
        {ticks.map((d) => {
          const x = LABEL_W + (d / maxDays) * BAR_MAX_W;
          return (
            <g key={d}>
              <line x1={x} y1={TOP_PAD} x2={x} y2={chartH - 20} className="stroke-border" strokeWidth={1} strokeDasharray="2,3" />
              <text x={x} y={chartH - 6} textAnchor="middle" className="fill-muted-foreground text-[9px]">
                {d}d
              </text>
            </g>
          );
        })}

        {tasks.map((task, i) => {
          const actual = Math.max(durationDays(task), 0.3);
          const planned = baselineDurationDays(task);
          const blueDays = Math.min(actual, planned || actual);
          const redDays = Math.max(0, actual - planned);
          const y = TOP_PAD + i * (ROW_H + ROW_GAP);
          const barY = y + ROW_H / 2 - 5;
          const blueW = (blueDays / maxDays) * BAR_MAX_W;
          const redW = (redDays / maxDays) * BAR_MAX_W;
          const tickX = LABEL_W + (planned / maxDays) * BAR_MAX_W;
          const clickable = Boolean(onSelectTask);
          return (
            <g
              key={task.id}
              className={clickable ? "cursor-pointer" : undefined}
              onClick={clickable ? () => onSelectTask(task) : undefined}
            >
              <rect x={0} y={y} width={chartW} height={ROW_H} rx={5} className={clickable ? "fill-transparent transition-colors hover:fill-primary/5" : "fill-transparent"} />
              <text x={0} y={y + ROW_H / 2 + 3} className="fill-foreground text-[10px] font-medium">
                {task.name.length > 24 ? `${task.name.slice(0, 23)}…` : task.name}
              </text>

              <rect x={LABEL_W} y={barY} width={BAR_MAX_W} height={10} rx={5} className="fill-muted" />
              <rect x={LABEL_W} y={barY} width={blueW} height={10} rx={redW > 0 ? 0 : 5} className="fill-primary" />
              {redW > 0 && <rect x={LABEL_W + blueW} y={barY} width={redW} height={10} rx={5} className="fill-status-dropped-fg" />}

              {planned > 0 && (
                <>
                  <line x1={tickX} y1={y + ROW_H / 2 - 9} x2={tickX} y2={y + ROW_H / 2 + 8} className="stroke-foreground" strokeWidth={2} />
                  <polygon
                    points={`${tickX - 3},${y + ROW_H / 2 - 9} ${tickX + 3},${y + ROW_H / 2 - 9} ${tickX},${y + ROW_H / 2 - 4}`}
                    className="fill-foreground"
                  />
                </>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-1 flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-primary" />
          Actual
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-status-dropped-fg" />
          Overrun
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 bg-foreground" />
          Planned target
        </span>
      </div>
    </div>
  );
}

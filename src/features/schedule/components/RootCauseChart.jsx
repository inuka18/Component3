import { flattenTasks, causeStyle } from "../lib/scheduleUtils";
import { cn } from "../../../lib/utils";

const CAUSE_ORDER = ["requirement-change", "resource-disruption", "ripple-propagation"];
const LABEL_W = 96;
const BAR_MAX_W = 220;
const ROW_H = 34;
const ROW_GAP = 12;
const TOP_PAD = 8;
const AXIS_TICKS = [0, 25, 50, 75, 100];

// Breaks down every task carrying a delay cause by its type: the three
// categories Component 3 tracks, color-matched to the same categories
// GapDetection's causal chain and Propagation calibration tables use.
// Accepts either `phases` (single project, the InsightsDrawer usage) or
// a pre-flattened, already cause-carrying `tasks` array spanning multiple
// projects (the Overview page's portfolio-wide usage). Rows only become
// clickable, with the hover highlight, trailing chevron, and hint
// caption, when a caller passes `onSelectCause`.
export function RootCauseChart({ phases, tasks, onSelectCause }) {
  const causeTasks = tasks ?? flattenTasks(phases ?? []).filter((t) => t.cause);
  const total = causeTasks.length;

  if (total === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No delay causes recorded right now.</p>;
  }

  const rows = CAUSE_ORDER.map((type) => ({
    type,
    style: causeStyle(type),
    count: causeTasks.filter((t) => t.cause.type === type).length,
  })).filter((row) => row.count > 0);

  const chartW = LABEL_W + BAR_MAX_W + 60;
  const chartH = TOP_PAD + rows.length * (ROW_H + ROW_GAP) + 20;
  const clickable = Boolean(onSelectCause);

  return (
    <div>
      <div className="overflow-x-auto scrollbar-thin">
        <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} className="min-w-full">
          {AXIS_TICKS.map((pct) => {
            const x = LABEL_W + (pct / 100) * BAR_MAX_W;
            return (
              <g key={pct}>
                <line x1={x} y1={TOP_PAD} x2={x} y2={chartH - 18} className="stroke-border" strokeWidth={1} strokeDasharray="2,3" />
                <text x={x} y={chartH - 6} textAnchor="middle" className="fill-muted-foreground text-[9px]">
                  {pct}%
                </text>
              </g>
            );
          })}

          {rows.map(({ type, style, count }, i) => {
            const pct = Math.round((count / total) * 100);
            const barW = Math.max((count / total) * BAR_MAX_W, 3);
            const y = TOP_PAD + i * (ROW_H + ROW_GAP);
            return (
              <g
                key={type}
                className={clickable ? "cursor-pointer" : undefined}
                onClick={clickable ? () => onSelectCause(type) : undefined}
              >
                <rect
                  x={0}
                  y={y}
                  width={chartW}
                  height={ROW_H}
                  rx={6}
                  className={cn("fill-transparent transition-colors", clickable && "hover:fill-primary/5")}
                />
                <circle cx={4} cy={y + ROW_H / 2 - 9} r={3} className={style.fillClass} />
                <text x={12} y={y + ROW_H / 2 - 6} className="fill-foreground text-[11px] font-medium">
                  {style.label}
                </text>
                <text x={0} y={y + ROW_H / 2 + 9} className="fill-muted-foreground text-[9px]">
                  {count} task{count === 1 ? "" : "s"} · {pct}%
                </text>
                <rect x={LABEL_W} y={y + ROW_H / 2 - 5} width={BAR_MAX_W} height={10} rx={5} className="fill-muted" />
                <rect x={LABEL_W} y={y + ROW_H / 2 - 5} width={barW} height={10} rx={5} className={style.fillClass} />
                {clickable && (
                  <text x={chartW - 4} y={y + ROW_H / 2 + 4} textAnchor="end" className="fill-muted-foreground text-xs">
                    ›
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {clickable && (
        <p className="mt-1 text-center text-[10px] text-muted-foreground">
          🖱️ Click any row to see the task-level breakdown
        </p>
      )}
    </div>
  );
}

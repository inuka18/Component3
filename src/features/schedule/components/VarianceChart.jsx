const LABEL_W = 100;
const BAR_MAX_W = 220;
const ROW_H = 36;
const ROW_GAP = 14;
const TOP_PAD = 10;
const AXIS_TICKS = [0, 25, 50, 75, 100];

// One row per planning granularity (Day/Week/Sprint/Project), each a
// stacked horizontal bar showing the mix of on-track (green) vs. delayed
// (red) tasks in that level's task pool, with a navy tick marking the
// planned target (100% on track, i.e. nothing slipping). Every row is
// clickable, opening the task-level breakdown for that level in
// VarianceDrillDownModal.
export function VarianceChart({ levels, onSelectLevel }) {
  const rows = levels.filter((level) => level.total > 0);
  const chartW = LABEL_W + BAR_MAX_W + 60;
  const chartH = TOP_PAD + rows.length * (ROW_H + ROW_GAP) + 20;

  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No tasks to chart yet.</p>;
  }

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

          {rows.map((level, i) => {
            const y = TOP_PAD + i * (ROW_H + ROW_GAP);
            const barY = y + ROW_H / 2 - 6;
            const onTrackW = (level.onTrackCount / level.total) * BAR_MAX_W;
            const delayedW = (level.delayedCount / level.total) * BAR_MAX_W;
            const targetX = LABEL_W + BAR_MAX_W;
            const clipId = `variance-bar-${level.key}`;
            return (
              <g key={level.key} className="cursor-pointer" onClick={() => onSelectLevel(level)}>
                <rect x={0} y={y} width={chartW} height={ROW_H} rx={6} className="fill-transparent transition-colors hover:fill-primary/5" />
                <text x={0} y={y + ROW_H / 2 - 6} className="fill-foreground text-[11px] font-semibold">
                  {level.label}
                </text>
                <text x={0} y={y + ROW_H / 2 + 9} className="fill-muted-foreground text-[9px]">
                  {level.total} task{level.total === 1 ? "" : "s"} · {level.totalSlip}d slip
                </text>

                <defs>
                  <clipPath id={clipId}>
                    <rect x={LABEL_W} y={barY} width={BAR_MAX_W} height={12} rx={6} />
                  </clipPath>
                </defs>
                <rect x={LABEL_W} y={barY} width={BAR_MAX_W} height={12} rx={6} className="fill-muted" />
                <g clipPath={`url(#${clipId})`}>
                  <rect x={LABEL_W} y={barY} width={onTrackW} height={12} className="fill-status-confirmed-fg" />
                  {delayedW > 0 && (
                    <rect x={LABEL_W + onTrackW} y={barY} width={delayedW} height={12} className="fill-status-dropped-fg" />
                  )}
                </g>
                <rect x={LABEL_W} y={barY} width={BAR_MAX_W} height={12} rx={6} className="fill-none stroke-border" strokeWidth={1} />

                <line x1={targetX} y1={y + ROW_H / 2 - 12} x2={targetX} y2={y + ROW_H / 2 + 10} className="stroke-foreground" strokeWidth={2} />
                <polygon
                  points={`${targetX - 3},${y + ROW_H / 2 - 12} ${targetX + 3},${y + ROW_H / 2 - 12} ${targetX},${y + ROW_H / 2 - 7}`}
                  className="fill-foreground"
                />

                <text x={chartW - 4} y={y + ROW_H / 2 + 4} textAnchor="end" className="fill-muted-foreground text-xs">
                  ›
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-1 flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-status-confirmed-fg" />
          On track
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-status-dropped-fg" />
          Delayed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 bg-foreground" />
          Planned target
        </span>
      </div>
      <p className="mt-1 text-center text-[10px] text-muted-foreground">🖱️ Click any row to see the task-level breakdown</p>
    </div>
  );
}

const LABEL_W = 96;
const BAR_MAX_W = 200;
const ROW_H = 24;
const ROW_GAP = 12;
const TOP_PAD = 6;

// Fixed hue order: identity (which source is which color) never changes
// just because a date range makes one source disappear from the list.
// Slots 1–6 are the validated categorical palette (--series-1..6 in
// index.css): light-mode slots 3/4/5 sit below the 3:1 contrast floor on
// their own, so every bar carries a direct name+count label (the
// "relief" the validator requires) rather than leaning on color alone.
const SOURCE_ORDER = ["Standup", "Slack", "Email", "Jira Comment", "Teams", "Document Upload"];
const SLOT_FILL = ["fill-series-1", "fill-series-2", "fill-series-3", "fill-series-4", "fill-series-5", "fill-series-6"];

export function SourceBreakdownChart({ sourceCounts, onSelectSource }) {
  const rows = sourceCounts.filter((s) => s.count > 0);
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No signals in this period.</p>;
  }

  const chartW = LABEL_W + BAR_MAX_W + 70;
  const chartH = TOP_PAD + rows.length * (ROW_H + ROW_GAP);
  const maxCount = Math.max(...rows.map((r) => r.count));

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} className="min-w-full">
        {rows.map((row, i) => {
          const y = TOP_PAD + i * (ROW_H + ROW_GAP);
          const barY = y + ROW_H / 2 - 8;
          const w = Math.max((row.count / maxCount) * BAR_MAX_W, 4);
          const slot = SOURCE_ORDER.indexOf(row.source);
          const fillClass = SLOT_FILL[slot === -1 ? 0 : slot % SLOT_FILL.length];

          return (
            <g key={row.source} className="cursor-pointer" onClick={() => onSelectSource(row.source)}>
              <rect x={0} y={y} width={chartW} height={ROW_H} rx={6} className="fill-transparent transition-colors hover:fill-primary/5" />
              <text x={0} y={y + ROW_H / 2 + 4} className="fill-foreground text-xs font-medium">
                {row.source}
              </text>
              <rect x={LABEL_W} y={barY} width={BAR_MAX_W} height={16} rx={4} className="fill-muted" />
              <rect x={LABEL_W} y={barY} width={w} height={16} rx={4} className={fillClass}>
                <title>
                  {row.source}: {row.count} signal{row.count === 1 ? "" : "s"}
                </title>
              </rect>
              <text x={LABEL_W + w + 8} y={y + ROW_H / 2 + 4} className="fill-foreground text-xs font-semibold">
                {row.count}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

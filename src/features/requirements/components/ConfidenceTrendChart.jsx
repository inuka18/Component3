import { cn } from "../../../lib/utils";

const PLOT_H = 150;
const TOP_PAD = 14;
const BOTTOM_PAD = 30;
const Y_AXIS_W = 30;
const Y_TICKS = [0, 25, 50, 75, 100];

// Same three tiers ConfidenceMeter.jsx already draws (>=85 confirmed-green,
// 65-84 at-risk-amber, below that muted), a point's color is just that
// established tiering, not a new scale invented for this chart.
function tierFill(confidence) {
  if (confidence >= 85) return "fill-status-confirmed-fg";
  if (confidence >= 65) return "fill-status-atrisk-fg";
  return "fill-muted-foreground";
}

export function ConfidenceTrendChart({ buckets, threshold = 85, onSelectPoint }) {
  const withData = buckets.filter((b) => b.avgConfidence !== null);
  if (withData.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No signals in this period.</p>;
  }

  const slotGap = buckets.length <= 6 ? 48 : 18;
  const slotW = 22 + slotGap;
  const chartW = Y_AXIS_W + buckets.length * slotW + 12;
  const chartH = TOP_PAD + PLOT_H + BOTTOM_PAD;

  const xFor = (i) => Y_AXIS_W + i * slotW + slotW / 2;
  const yFor = (v) => TOP_PAD + PLOT_H - (v / 100) * PLOT_H;

  const linePoints = buckets
    .map((b, i) => (b.avgConfidence === null ? null : `${xFor(i)},${yFor(b.avgConfidence)}`))
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <div className="overflow-x-auto scrollbar-thin">
        <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} className="min-w-full">
          {Y_TICKS.map((t) => (
            <g key={t}>
              <line x1={Y_AXIS_W} y1={yFor(t)} x2={chartW} y2={yFor(t)} className="stroke-border" strokeWidth={1} />
              <text x={Y_AXIS_W - 6} y={yFor(t) + 3} textAnchor="end" className="fill-muted-foreground text-[9px]">
                {t}
              </text>
            </g>
          ))}

          {/* Auto-apply threshold reference: a fixed, labeled line, not a
              data series, so it never enters the legend as if it were one. */}
          <line
            x1={Y_AXIS_W}
            y1={yFor(threshold)}
            x2={chartW}
            y2={yFor(threshold)}
            className="stroke-foreground/50"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text x={chartW - 4} y={yFor(threshold) - 5} textAnchor="end" className="fill-foreground/70 text-[9px] font-medium">
            Auto-apply threshold: {threshold}%
          </text>

          <polyline points={linePoints} fill="none" className="stroke-primary" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {buckets.map((b, i) => {
            if (b.avgConfidence === null) return null;
            const x = xFor(i);
            const y = yFor(b.avgConfidence);
            return (
              <circle
                key={b.key}
                cx={x}
                cy={y}
                r={5}
                strokeWidth={2}
                className={cn(tierFill(b.avgConfidence), "cursor-pointer")}
                style={{ stroke: "hsl(var(--card))" }}
                onClick={() => onSelectPoint(b)}
              >
                <title>
                  {b.label}: {b.avgConfidence}% avg confidence ({b.total} signal{b.total === 1 ? "" : "s"})
                </title>
              </circle>
            );
          })}

          {buckets.map((b, i) => (
            <text key={b.key} x={xFor(i)} y={chartH - BOTTOM_PAD + 14} textAnchor="middle" className="fill-muted-foreground text-[9px]">
              {b.label}
            </text>
          ))}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-status-confirmed-fg" />
          ≥85% (auto-apply tier)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-status-atrisk-fg" />
          65–84%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-muted-foreground" />
          &lt;65%
        </span>
      </div>
    </div>
  );
}

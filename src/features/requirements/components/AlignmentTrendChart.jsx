import { cn } from "../../../lib/utils";

// Same raw-SVG-plus-Tailwind-fill-classes approach as Schedule's
// VarianceChart: a plain line chart, no charting library. Each point is
// colored by its own day's zone (green/amber/red, the same status-*
// tokens used everywhere else in this app for exactly this tiering), and
// a day with a `driverSignalId` gets a larger, ringed, clickable marker.
const Y_AXIS_W = 30;
const POINT_GAP = 42;
const PLOT_H = 150;
const TOP_PAD = 14;
const BOTTOM_PAD = 26;
const Y_TICKS = [0, 25, 50, 75, 100];

function zoneStroke(score) {
  if (score >= 80) return "stroke-status-confirmed-fg";
  if (score >= 60) return "stroke-status-atrisk-fg";
  return "stroke-status-dropped-fg";
}
function zoneFill(score) {
  if (score >= 80) return "fill-status-confirmed-fg";
  if (score >= 60) return "fill-status-atrisk-fg";
  return "fill-status-dropped-fg";
}

function shortDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function AlignmentTrendChart({ history, selectedDate, onSelectPoint }) {
  if (history.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No alignment history yet.</p>;
  }

  const chartW = Y_AXIS_W + (history.length - 1) * POINT_GAP + 24;
  const chartH = TOP_PAD + PLOT_H + BOTTOM_PAD;
  const xFor = (i) => Y_AXIS_W + i * POINT_GAP;
  const yFor = (score) => TOP_PAD + PLOT_H - (score / 100) * PLOT_H;

  const y80 = yFor(80);
  const y60 = yFor(60);
  const polylinePoints = history.map((d, i) => `${xFor(i)},${yFor(d.alignmentScore)}`).join(" ");

  return (
    <div>
      <div className="overflow-x-auto scrollbar-thin">
        <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} className="min-w-full">
          {/* Zone backdrop: Strong / Moderate / Significant, top to bottom */}
          <rect x={Y_AXIS_W} y={TOP_PAD} width={chartW - Y_AXIS_W} height={y80 - TOP_PAD} className="fill-status-confirmed-bg/50" />
          <rect x={Y_AXIS_W} y={y80} width={chartW - Y_AXIS_W} height={y60 - y80} className="fill-status-atrisk-bg/50" />
          <rect x={Y_AXIS_W} y={y60} width={chartW - Y_AXIS_W} height={TOP_PAD + PLOT_H - y60} className="fill-status-dropped-bg/40" />

          {Y_TICKS.map((tick) => {
            const y = yFor(tick);
            return (
              <g key={tick}>
                <line x1={Y_AXIS_W} y1={y} x2={chartW} y2={y} className="stroke-border" strokeWidth={1} strokeDasharray="2,3" />
                <text x={Y_AXIS_W - 5} y={y + 3} textAnchor="end" className="fill-muted-foreground text-[9px]">
                  {tick}
                </text>
              </g>
            );
          })}

          <polyline points={polylinePoints} fill="none" className="stroke-foreground/60" strokeWidth={1.5} />

          {history.map((d, i) => {
            const x = xFor(i);
            const y = yFor(d.alignmentScore);
            const isDip = Boolean(d.driverSignalId);
            const isSelected = selectedDate === d.date;
            const showLabel = isDip || i % 2 === 0;

            return (
              <g key={d.date}>
                {isDip && (
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 9 : 7}
                    className={cn("fill-none", zoneStroke(d.alignmentScore))}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    strokeDasharray={isSelected ? undefined : "2,2"}
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isDip ? 4 : 3}
                  className={cn(zoneFill(d.alignmentScore), isDip && "cursor-pointer")}
                  onClick={isDip ? () => onSelectPoint(d) : undefined}
                >
                  <title>
                    {shortDate(d.date)}: {d.alignmentScore}%{isDip ? " · signal-linked drop, click for detail" : ""}
                  </title>
                </circle>
                {showLabel && (
                  <text x={x} y={chartH - 6} textAnchor="middle" className="fill-muted-foreground text-[9px]">
                    {shortDate(d.date)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-status-confirmed-fg" />
          Strong
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-status-atrisk-fg" />
          Moderate
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-status-dropped-fg" />
          Significant
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-dashed border-muted-foreground" />
          Signal-linked drop
        </span>
      </div>
    </div>
  );
}

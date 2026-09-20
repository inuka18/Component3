import { CLASSIFICATION_CONFIG } from "./ClassificationBadge";
import { cn } from "../../../lib/utils";

// Fixed bottom-to-top stacking order: identity (color) always sits at the
// same position in every bar regardless of which classifications are
// present that day, so a reader never has to re-learn the stack.
const STACK_ORDER = ["Constraint", "Expectation", "Completion", "Conflict", "None"];
const BAR_W = 22;
const PLOT_H = 160;
const TOP_PAD = 14;
const BOTTOM_PAD = 30;
const Y_AXIS_W = 28;

// Same fg tokens ClassificationBadge.jsx's CLASSIFICATION_CONFIG points at
// (the saturated color already used for solid marks elsewhere, e.g.
// VarianceChart), as literal `fill-*` classes rather than derived via
// string replacement, since Tailwind's build-time scanner only generates
// CSS for class names it can find written out somewhere, not ones
// assembled at runtime.
const FILL_CLASS = {
  Constraint: "fill-class-constraint-fg",
  Expectation: "fill-class-expectation-fg",
  Completion: "fill-class-completion-fg",
  Conflict: "fill-class-conflict-fg",
  None: "fill-class-none-fg",
};
function fillClassFor(classification) {
  return FILL_CLASS[classification] ?? "fill-muted-foreground";
}

function niceMax(value) {
  if (value <= 5) return 5;
  const step = value <= 20 ? 5 : value <= 60 ? 10 : 20;
  return Math.ceil(value / step) * step;
}

export function ClassificationDistributionChart({ buckets, onSelectSegment }) {
  if (buckets.length === 0 || buckets.every((b) => b.total === 0)) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No signals in this period.</p>;
  }

  // Weekly buckets (fewer, wider labels like "Jul 30 – Aug 5") get more
  // breathing room per slot than the tighter daily view.
  const slotGap = buckets.length <= 6 ? 48 : 18;
  const slotW = BAR_W + slotGap;
  const chartW = Y_AXIS_W + buckets.length * slotW + 12;
  const chartH = TOP_PAD + PLOT_H + BOTTOM_PAD;

  const maxTotal = niceMax(Math.max(1, ...buckets.map((b) => b.total)));
  const yFor = (v) => TOP_PAD + PLOT_H - (v / maxTotal) * PLOT_H;
  const baseline = yFor(0);
  const yTicks = maxTotal <= 5 ? [0, maxTotal] : [0, Math.round(maxTotal / 2), maxTotal];

  return (
    <div>
      <div className="overflow-x-auto scrollbar-thin">
        <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} className="min-w-full">
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={Y_AXIS_W} y1={yFor(t)} x2={chartW} y2={yFor(t)} className="stroke-border" strokeWidth={1} />
              <text x={Y_AXIS_W - 6} y={yFor(t) + 3} textAnchor="end" className="fill-muted-foreground text-[9px]">
                {t}
              </text>
            </g>
          ))}

          {buckets.map((bucket, i) => {
            const x = Y_AXIS_W + i * slotW + (slotW - BAR_W) / 2;
            const stackTop = yFor(bucket.total);
            const clipId = `dist-bar-${bucket.key}`;
            let cursor = baseline;

            return (
              <g key={bucket.key}>
                <defs>
                  <clipPath id={clipId}>
                    <rect x={x} y={stackTop} width={BAR_W} height={Math.max(baseline - stackTop, 0)} rx={4} />
                  </clipPath>
                </defs>
                {bucket.total === 0 ? (
                  <rect x={x} y={baseline - 2} width={BAR_W} height={2} className="fill-border" rx={1} />
                ) : (
                  <g clipPath={`url(#${clipId})`}>
                    {STACK_ORDER.map((cls) => {
                      const count = bucket.counts[cls] ?? 0;
                      if (count === 0) return null;
                      const segH = (count / maxTotal) * PLOT_H;
                      const segY = cursor - segH;
                      cursor = segY;
                      return (
                        <rect
                          key={cls}
                          x={x}
                          y={segY + 1}
                          width={BAR_W}
                          height={Math.max(segH - 2, 0)}
                          className={cn(fillClassFor(cls), "cursor-pointer")}
                          onClick={() => onSelectSegment(bucket, cls)}
                        >
                          <title>
                            {bucket.label}: {cls}: {count}
                          </title>
                        </rect>
                      );
                    })}
                  </g>
                )}
                <text x={x + BAR_W / 2} y={chartH - BOTTOM_PAD + 14} textAnchor="middle" className="fill-muted-foreground text-[9px]">
                  {bucket.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-foreground">
        {STACK_ORDER.map((cls) => {
          const config = CLASSIFICATION_CONFIG[cls];
          const Icon = config.icon;
          return (
            <span key={cls} className="flex items-center gap-1.5">
              <Icon className={cn("h-3 w-3", config.fg)} />
              {cls}
            </span>
          );
        })}
      </div>
    </div>
  );
}

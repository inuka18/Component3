import { useState } from "react";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "reactflow";
import { Link2, X } from "lucide-react";

// The visually-distinct edge type for a human-created link: the same
// "ripple" purple token Schedule already uses as its one deliberately
// distinct third hue (no automatic edge or cluster swatch on this map
// uses it), a dashed pattern the automatic edges don't use, and a small
// persistent "manual" pill at the midpoint, reads as deliberate at a
// glance, not something the algorithm produced. The pill also carries
// the only way to remove one: an "×" that only appears on hover, and
// only when `canRemove` is true (PM viewing it, false for a Team
// Member, who can see but never edit a manual link).
export function ManualLinkEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) {
  const [hovered, setHovered] = useState(false);
  const [path, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });

  return (
    <>
      <BaseEdge id={id} path={path} style={{ stroke: "hsl(var(--status-ripple-fg))", strokeWidth: 1.8, strokeDasharray: "6 3" }} />
      {/* Wide, invisible hit-target so hovering near (not just exactly on) the thin path reveals the remove control. */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      <EdgeLabelRenderer>
        <div
          style={{ position: "absolute", transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`, pointerEvents: "all" }}
          className="nodrag nopan"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="flex items-center gap-1 rounded-full border border-status-ripple-fg/30 bg-status-ripple-bg px-1.5 py-0.5 shadow-sm">
            <Link2 className="h-2.5 w-2.5 text-status-ripple-fg" />
            {data?.canRemove && hovered && (
              <button
                onClick={() => data.onRemove(data.link)}
                title="Remove manual link"
                className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-status-dropped-fg hover:bg-status-dropped-bg"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

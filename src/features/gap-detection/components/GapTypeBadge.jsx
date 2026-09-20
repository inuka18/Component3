import { TrendingUp, RotateCcw, Users2 } from "lucide-react";
import { cn } from "../../../lib/utils";

// Reuses the same "class-*" color tokens the Requirements feature's
// ClassificationBadge draws from, so a new categorical color scale didn't
// need to be introduced just for this feature.
const TYPE_CONFIG = {
  Forward: {
    icon: TrendingUp,
    bg: "bg-class-expectation-bg",
    fg: "text-class-expectation-fg",
    label: "Forward Gap",
  },
  Backward: {
    icon: RotateCcw,
    bg: "bg-class-conflict-bg",
    fg: "text-class-conflict-fg",
    label: "Backward Gap",
  },
  Resource: {
    icon: Users2,
    bg: "bg-class-constraint-bg",
    fg: "text-class-constraint-fg",
    label: "Resource Gap",
  },
};

export function GapTypeBadge({ type, className, short = false }) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.Forward;
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.bg,
        config.fg,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {short ? type : config.label}
    </span>
  );
}

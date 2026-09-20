import { ShieldAlert, Target, CheckCheck, Zap, CircleDashed } from "lucide-react";
import { cn } from "../../../lib/utils";

// Exported so Signal Analytics' charts key off this exact same
// classification → color mapping rather than a second, driftable copy.
export const CLASSIFICATION_CONFIG = {
  Constraint: {
    icon: ShieldAlert,
    bg: "bg-class-constraint-bg",
    fg: "text-class-constraint-fg",
  },
  Expectation: {
    icon: Target,
    bg: "bg-class-expectation-bg",
    fg: "text-class-expectation-fg",
  },
  Completion: {
    icon: CheckCheck,
    bg: "bg-class-completion-bg",
    fg: "text-class-completion-fg",
  },
  Conflict: {
    icon: Zap,
    bg: "bg-class-conflict-bg",
    fg: "text-class-conflict-fg",
  },
  None: {
    icon: CircleDashed,
    bg: "bg-class-none-bg",
    fg: "text-class-none-fg",
  },
};

export function ClassificationBadge({ classification, className }) {
  const config = CLASSIFICATION_CONFIG[classification] ?? CLASSIFICATION_CONFIG.None;
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
      {classification}
    </span>
  );
}

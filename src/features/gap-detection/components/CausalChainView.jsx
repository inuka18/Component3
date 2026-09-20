import {
  TrendingUp,
  RotateCcw,
  Users2,
  SearchX,
  Clock,
  ListChecks,
  Gauge,
  CalendarClock,
} from "lucide-react";
import { mockTasks } from "../../../data/mockSchedule";

// The root-cause step and the mechanism/consequence pair that follows it
// are type-specific: everything downstream of "Task Affected" is the
// same shape regardless of gap type, since that's the shared propagation
// path every gap eventually takes toward sprint risk.
const TYPE_CHAIN = {
  Forward: {
    icon: TrendingUp,
    rootLabel: "Forward Gap",
    mechanismIcon: SearchX,
    mechanismLabel: "Missing Implementation",
    consequenceIcon: Clock,
    consequenceLabel: "Development Delay",
  },
  Backward: {
    icon: RotateCcw,
    rootLabel: "Backward Gap",
    mechanismIcon: SearchX,
    mechanismLabel: "Undocumented Execution",
    consequenceIcon: Clock,
    consequenceLabel: "Requirement Drift",
  },
  Resource: {
    icon: Users2,
    rootLabel: "Resource Gap",
    mechanismIcon: SearchX,
    mechanismLabel: "Capacity Deficit",
    consequenceIcon: Clock,
    consequenceLabel: "Overallocation Risk",
  },
};

// Shared step-building logic, used both by the visual timeline below and
// by getCausalChainLabels() for the Component 3 handoff panel's JSON, so
// the two representations of "what happened" never drift apart.
function buildChainSteps(gap) {
  const config = TYPE_CHAIN[gap.type] ?? TYPE_CHAIN.Forward;
  const tasks = (gap.taskIds ?? []).map((id) => mockTasks.find((t) => t.id === id)).filter(Boolean);

  return [
    { icon: config.icon, label: config.rootLabel, detail: gap.changeType },
    { icon: config.mechanismIcon, label: config.mechanismLabel, detail: gap.disruptionType },
    {
      icon: config.consequenceIcon,
      label: config.consequenceLabel,
      detail: gap.delayType ?? "Ripple effect on planned delivery",
    },
    {
      icon: ListChecks,
      label: "Task Affected",
      detail: tasks.length > 0 ? tasks.map((t) => t.title).join("; ") : "No task linked yet",
    },
    {
      icon: Gauge,
      label: "Weekly Workload Increase",
      detail: `${gap.evidenceCount} evidence record${gap.evidenceCount === 1 ? "" : "s"} across ${tasks.length} task${tasks.length === 1 ? "" : "s"} this sprint`,
    },
    {
      icon: CalendarClock,
      label: "Sprint Commitment Risk",
      detail: `${gap.severity} severity: ${gap.impactSummary}`,
    },
  ];
}

// Plain-string version of the chain (labels only), what the Component 3
// handoff panel's JSON block serializes as `causalChain`.
export function getCausalChainLabels(gap) {
  if (!gap) return [];
  return buildChainSteps(gap).map((step) => step.label);
}

// Renders the causal chain from root-cause classification through to its
// downstream scheduling consequence, computed from the gap record itself
// rather than stored as its own mock structure, the same way
// StatusTimeline derives its view from a requirement's statusHistory.
// e.g. Forward Gap → Missing Implementation → Development Delay →
// Task Affected → Weekly Workload Increase → Sprint Commitment Risk.
export function CausalChainView({ gap }) {
  if (!gap) return null;
  const steps = buildChainSteps(gap);

  return (
    <ol className="relative space-y-5 border-l border-border pl-6">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        return (
          <li key={idx} className="relative">
            <span className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary/10 text-primary">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <p className="text-sm font-semibold leading-snug text-foreground">{step.label}</p>
            {step.detail && (
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{step.detail}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

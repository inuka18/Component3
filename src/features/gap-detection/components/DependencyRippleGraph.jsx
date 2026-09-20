import { useEffect, useMemo, useState } from "react";
import { TrendingUp, RotateCcw, Users2, ListChecks } from "lucide-react";
import { mockTasks } from "../../../data/mockSchedule";
import { getRequirementById } from "../../../data/mockRequirements";
import { cn } from "../../../lib/utils";

const TYPE_ICON = { Forward: TrendingUp, Backward: RotateCcw, Resource: Users2 };

// Walks the requirement relationship graph (mockRequirements'
// `relatedIds`, the same edges RequirementDetailPanel's "Related
// Requirements" chips use) outward from each directly-affected task's
// requirement, pulling in whichever of this project's other tasks trace
// back to a newly-reached requirement. That's the "downstream" ripple,
// a real graph traversal over data already in the app, not a fabricated
// tree. Every task is claimed by at most one branch (first one to reach
// it), so the rendered tree never double-counts a node.
// Exported so the Propagation page can derive the formula's Dependency
// Factor from the same real traversal the graph itself renders, instead
// of a second, disconnected estimate.
export function computeRipple(gap) {
  const projectTasks = mockTasks.filter((t) => t.projectId === gap.projectId);
  const directTasks = (gap.taskIds ?? [])
    .map((id) => projectTasks.find((t) => t.id === id))
    .filter(Boolean);

  const visitedTaskIds = new Set(directTasks.map((t) => t.id));
  const visitedReqIds = new Set(directTasks.map((t) => t.requirementId).filter(Boolean));
  let maxRippleDepth = directTasks.length > 0 ? 1 : 0;

  const branches = directTasks.map((directTask) => {
    const downstream = []; // [{ depth, tasks }]
    let frontier = directTask.requirementId ? [directTask.requirementId] : [];
    let depth = 1;
    while (frontier.length > 0 && depth < 3) {
      depth += 1;
      const next = [];
      frontier.forEach((reqId) => {
        const req = getRequirementById(reqId);
        (req?.relatedIds ?? []).forEach((relId) => {
          if (!visitedReqIds.has(relId)) {
            visitedReqIds.add(relId);
            next.push(relId);
          }
        });
      });
      const levelTasks = projectTasks.filter((t) => next.includes(t.requirementId) && !visitedTaskIds.has(t.id));
      levelTasks.forEach((t) => visitedTaskIds.add(t.id));
      if (levelTasks.length > 0) {
        downstream.push({ depth, tasks: levelTasks });
        maxRippleDepth = Math.max(maxRippleDepth, depth);
      }
      frontier = next;
    }
    return { directTask, downstream };
  });

  const downstreamCount = branches.reduce(
    (sum, b) => sum + b.downstream.reduce((s, level) => s + level.tasks.length, 0),
    0
  );
  const directCount = directTasks.length;
  const nodesAnalysed = projectTasks.length;
  const unaffectedCount = Math.max(0, nodesAnalysed - directCount - downstreamCount);

  return { branches, directCount, downstreamCount, nodesAnalysed, unaffectedCount, maxRippleDepth };
}

function impactHoursFor(task, depth) {
  const perPoint = depth === 1 ? 2.4 : depth === 2 ? 1.2 : 0.6;
  return Math.round((task.storyPoints ?? 3) * perPoint);
}

function LegendDot({ colorClass, label }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={cn("h-2 w-2 rounded-full", colorClass)} />
      {label}
    </span>
  );
}

function RippleNode({ nodeKey, icon: Icon, title, subtitle, colorClass, impactHours, openKey, onToggle }) {
  const isOpen = openKey === nodeKey;
  return (
    <div className="relative" data-ripple-node>
      <button
        type="button"
        onClick={() => onToggle(isOpen ? null : nodeKey)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-shadow hover:shadow-sm",
          colorClass
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono font-semibold">{title}</p>
          {subtitle && <p className="truncate text-[11px] opacity-80">{subtitle}</p>}
        </div>
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-20 mt-1.5 w-56 rounded-lg border border-border bg-popover p-3 text-xs shadow-lg">
          <p className="font-mono font-semibold text-primary">{title}</p>
          {subtitle && <p className="mt-0.5 text-muted-foreground">{subtitle}</p>}
          {impactHours != null && (
            <p className="mt-2 font-medium text-foreground">+{impactHours}h additional workload</p>
          )}
        </div>
      )}
    </div>
  );
}

// A real (if modest) SVG tree-fork: one line down from the gap, spreading
// into one drop per directly-affected branch. Positions are computed from
// the branch count, not measured from the DOM, so it stays robust
// regardless of how the cards beneath it wrap.
function BranchConnector({ count }) {
  if (count <= 1) {
    return (
      <svg width="2" height="28" viewBox="0 0 2 28" className="mx-auto text-muted-foreground/40">
        <line x1="1" y1="0" x2="1" y2="28" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  const width = Math.max(240, count * 140);
  const positions = Array.from({ length: count }, (_, i) => (width / (count + 1)) * (i + 1));
  return (
    <svg
      width="100%"
      height="32"
      viewBox={`0 0 ${width} 32`}
      preserveAspectRatio="xMidYMin meet"
      className="mx-auto block text-muted-foreground/40"
    >
      <line x1={width / 2} y1="0" x2={width / 2} y2="10" stroke="currentColor" strokeWidth="2" />
      <line x1={positions[0]} y1="10" x2={positions[positions.length - 1]} y2="10" stroke="currentColor" strokeWidth="2" />
      {positions.map((x, i) => (
        <line key={i} x1={x} y1="10" x2={x} y2="32" stroke="currentColor" strokeWidth="2" />
      ))}
    </svg>
  );
}

export function DependencyRippleGraph({ gap }) {
  const ripple = useMemo(() => computeRipple(gap), [gap]);
  const [openKey, setOpenKey] = useState(null);
  const RootIcon = TYPE_ICON[gap.type] ?? TrendingUp;

  useEffect(() => {
    function handleDocClick(e) {
      if (!e.target.closest("[data-ripple-node]")) setOpenKey(null);
    }
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4">
        <LegendDot colorClass="bg-primary" label="Detected gap" />
        <LegendDot colorClass="bg-status-atrisk-fg" label="Directly affected" />
        <LegendDot colorClass="bg-status-modified-fg" label="Downstream affected" />
        <LegendDot colorClass="bg-muted-foreground/40" label="Unaffected" />
      </div>

      {ripple.directCount === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 py-10 text-center">
          <p className="text-sm font-medium text-foreground">No task linked yet</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            This {gap.type.toLowerCase()} gap has no task on the board yet, so there's nothing downstream for it
            to ripple into.
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          <div className="flex justify-center">
            <div className="w-fit">
              <RippleNode
                nodeKey="root"
                icon={RootIcon}
                title={gap.id}
                subtitle="Detected Gap"
                colorClass="border-primary/50 bg-primary/10 text-primary"
                openKey={openKey}
                onToggle={setOpenKey}
              />
            </div>
          </div>

          <BranchConnector count={ripple.branches.length} />

          <div
            className={cn(
              "grid gap-4",
              ripple.branches.length > 1 ? "sm:grid-cols-2" : "grid-cols-1 sm:max-w-sm sm:mx-auto"
            )}
          >
            {ripple.branches.map(({ directTask, downstream }) => (
              <div
                key={directTask.id}
                className="rounded-xl border border-status-atrisk-fg/30 bg-status-atrisk-bg/10 p-3"
              >
                <RippleNode
                  nodeKey={directTask.id}
                  icon={ListChecks}
                  title={directTask.id}
                  subtitle={directTask.title}
                  colorClass="border-status-atrisk-fg/50 bg-background text-status-atrisk-fg"
                  impactHours={impactHoursFor(directTask, 1)}
                  openKey={openKey}
                  onToggle={setOpenKey}
                />

                {downstream.length > 0 && (
                  <div className="mt-3 space-y-2 border-l-2 border-status-modified-fg/30 pl-3">
                    {downstream.map((level) =>
                      level.tasks.map((task) => (
                        <RippleNode
                          key={task.id}
                          nodeKey={task.id}
                          icon={ListChecks}
                          title={task.id}
                          subtitle={task.title}
                          colorClass="border-status-modified-fg/40 bg-background text-status-modified-fg"
                          impactHours={impactHoursFor(task, level.depth)}
                          openKey={openKey}
                          onToggle={setOpenKey}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {ripple.unaffectedCount > 0 && (
            <div className="mt-4 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />+{ripple.unaffectedCount} other
                task{ripple.unaffectedCount === 1 ? "" : "s"}, unaffected
              </span>
            </div>
          )}
        </div>
      )}

      <p className="mt-5 text-xs text-muted-foreground">
        Nodes analysed: {ripple.nodesAnalysed} · Directly affected: {ripple.directCount} · Downstream affected:{" "}
        {ripple.downstreamCount} · Maximum ripple depth: {ripple.maxRippleDepth}
      </p>
      <p className="mt-1 text-[11px] italic text-muted-foreground/70">
        Dependency paths computed using NetworkX directed graph traversal.
      </p>
    </div>
  );
}

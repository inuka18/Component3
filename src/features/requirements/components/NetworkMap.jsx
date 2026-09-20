import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { ArrowUpRight, Link2, X, MousePointerClick } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { RequirementNode } from "./RequirementNode";
import { ClusterBackgroundNode } from "./ClusterBackgroundNode";
import { ManualLinkEdge } from "./ManualLinkEdge";
import { ManualLinkDialog } from "./ManualLinkDialog";
import { RestrictedButton } from "./RestrictedButton";
import { StatusBadge } from "./StatusBadge";
import { buildNetworkLayout } from "../../../lib/networkLayout";
import { CLUSTERS } from "../../../data/mockRequirements";
import { cn } from "../../../lib/utils";

const nodeTypes = {
  requirementNode: RequirementNode,
  clusterBackground: ClusterBackgroundNode,
};
const edgeTypes = {
  manual: ManualLinkEdge,
};

const STATUS_LEGEND = [
  { status: "Confirmed", swatch: "bg-status-confirmed-fg" },
  { status: "At Risk", swatch: "bg-status-atrisk-fg" },
  { status: "Modified", swatch: "bg-status-modified-fg" },
  { status: "Dropped", swatch: "bg-status-dropped-fg" },
];

export function NetworkMap({ requirements, onOpenRequirement, isPM, manualLinks, onCreateManualLink, onRemoveManualLink }) {
  const wrapperRef = useRef(null);
  const [popover, setPopover] = useState(null);
  const [linkMode, setLinkMode] = useState(false);
  const [pendingSourceId, setPendingSourceId] = useState(null);
  const [dialogPair, setDialogPair] = useState(null); // { source, target }
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // The automatic layout (nodes + Pathfinder-style edges), entirely
  // unchanged from before this feature existed, still memoized on
  // `requirements` alone, so nothing about it reacts to manual links.
  const layout = useMemo(() => buildNetworkLayout(requirements, CLUSTERS), [requirements]);

  const requirementById = useMemo(() => new Map(requirements.map((r) => [r.id, r])), [requirements]);

  const isAlreadyLinked = useCallback(
    (aId, bId) => {
      const a = requirementById.get(aId);
      if (a?.relatedIds?.includes(bId)) return true;
      return manualLinks.some((l) => (l.sourceId === aId && l.targetId === bId) || (l.sourceId === bId && l.targetId === aId));
    },
    [requirementById, manualLinks]
  );

  const handleRemoveLinkRequest = useCallback(
    async (link) => {
      await onRemoveManualLink(link);
      const source = requirementById.get(link.sourceId);
      const target = requirementById.get(link.targetId);
      setToast(`Removed manual link between ${source?.id ?? link.sourceId} and ${target?.id ?? link.targetId}.`);
    },
    [onRemoveManualLink, requirementById]
  );

  // Manual edges are computed separately from the automatic layout and
  // merged in below, kept out of buildNetworkLayout() entirely, so that
  // function's output (and the drag positions derived from it) never
  // changes shape because a manual link was added or removed.
  const manualEdges = useMemo(
    () =>
      manualLinks
        .filter((link) => requirementById.has(link.sourceId) && requirementById.has(link.targetId))
        .map((link) => ({
          id: link.id,
          source: link.sourceId,
          target: link.targetId,
          type: "manual",
          data: { link, canRemove: isPM, onRemove: handleRemoveLinkRequest },
          zIndex: 20,
        })),
    [manualLinks, requirementById, isPM, handleRemoveLinkRequest]
  );

  const [nodes, , onNodesChange] = useNodesState(layout.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([...layout.edges, ...manualEdges]);

  // Only the edge list is kept in sync when manual links change, node
  // positions (and the automatic edges themselves) are left alone.
  useEffect(() => {
    setEdges([...layout.edges, ...manualEdges]);
  }, [layout.edges, manualEdges, setEdges]);

  const clusterCount = useMemo(
    () => new Set(requirements.map((r) => r.cluster)).size,
    [requirements]
  );
  const alignmentScore = 91; // Illustrative, would be computed by the ML alignment model.

  const cancelLinking = useCallback(() => {
    setPendingSourceId(null);
  }, []);

  const handleNodeClick = useCallback(
    (event, node) => {
      if (node.type !== "requirementNode") return;

      if (linkMode) {
        if (pendingSourceId === node.id) {
          cancelLinking();
          return;
        }
        if (!pendingSourceId) {
          setPendingSourceId(node.id);
          return;
        }
        if (isAlreadyLinked(pendingSourceId, node.id)) {
          setToast("These requirements are already linked.");
          cancelLinking();
          return;
        }
        setDialogPair({ source: requirementById.get(pendingSourceId), target: requirementById.get(node.id) });
        return;
      }

      const bounds = wrapperRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const x = Math.min(event.clientX - bounds.left, bounds.width - 260);
      const y = Math.min(event.clientY - bounds.top, bounds.height - 160);
      setPopover({ requirement: node.data.requirement, x, y });
    },
    [linkMode, pendingSourceId, isAlreadyLinked, requirementById, cancelLinking]
  );

  const handleConfirmLink = async (reason) => {
    if (!dialogPair) return;
    setSubmitting(true);
    try {
      await onCreateManualLink({ sourceId: dialogPair.source.id, targetId: dialogPair.target.id, reason });
      setToast(`Linked ${dialogPair.source.id} and ${dialogPair.target.id}.`);
      setDialogPair(null);
      cancelLinking();
    } catch (err) {
      setToast(err.message || "Couldn't create that link.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLinkMode = () => {
    setLinkMode((v) => !v);
    cancelLinking();
    setPopover(null);
  };

  return (
    <div
      ref={wrapperRef}
      className="relative h-[calc(100vh-14rem)] min-h-[520px] w-full overflow-hidden rounded-xl border border-border bg-card"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onPaneClick={() => {
          setPopover(null);
          cancelLinking();
        }}
        onMove={() => setPopover(null)}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--border))" />
        <Controls showInteractive={false} />

        <Panel position="top-left">
          <div className="rounded-lg border border-border bg-card/95 px-3.5 py-2.5 text-xs shadow-sm backdrop-blur">
            <span className="font-semibold text-foreground">{requirements.length} requirements</span>
            <span className="mx-1.5 text-muted-foreground">·</span>
            <span className="text-muted-foreground">{clusterCount} clusters detected</span>
            <span className="mx-1.5 text-muted-foreground">·</span>
            <span className="font-semibold text-primary">Alignment score: {alignmentScore}%</span>
          </div>
        </Panel>

        <Panel position="top-right">
          <div className="flex flex-col items-end gap-2">
            {isPM ? (
              <Button
                size="sm"
                variant={linkMode ? "default" : "outline"}
                className={cn("gap-1.5 bg-card/95 shadow-sm backdrop-blur", linkMode && "bg-primary")}
                onClick={toggleLinkMode}
              >
                <Link2 className="h-3.5 w-3.5" />
                {linkMode ? "Linking Mode: On" : "Link Requirements"}
              </Button>
            ) : (
              <div className="rounded-lg bg-card/95 shadow-sm backdrop-blur">
                <RestrictedButton label="Only Project Managers can add or remove manual links">
                  <Link2 className="h-3.5 w-3.5" />
                  Link Requirements
                </RestrictedButton>
              </div>
            )}

            {linkMode && (
              <div className="flex max-w-[15rem] items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-[11px] text-primary shadow-sm backdrop-blur">
                <MousePointerClick className="h-3.5 w-3.5 shrink-0" />
                {pendingSourceId
                  ? `Now click the requirement to link with ${pendingSourceId}.`
                  : "Click a requirement, then click another to link them."}
              </div>
            )}
          </div>
        </Panel>

        <Panel position="bottom-left">
          <div className="rounded-lg border border-border bg-card/95 px-3.5 py-3 text-xs shadow-sm backdrop-blur">
            <p className="mb-2 font-semibold text-foreground">Live Status</p>
            <div className="flex flex-col gap-1.5">
              {STATUS_LEGEND.map((item) => (
                <div key={item.status} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${item.swatch}`} />
                  <span className="text-muted-foreground">{item.status}</span>
                </div>
              ))}
            </div>
            <div className="my-2 border-t border-border" />
            <p className="mb-1.5 font-semibold text-foreground">Connections</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="h-0 w-4 border-t border-muted-foreground/60" />
                <span className="text-muted-foreground">Automatic (detected)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-0 w-4 border-t-[1.8px] border-dashed border-status-ripple-fg" />
                <Link2 className="h-2.5 w-2.5 text-status-ripple-fg" />
                <span className="text-muted-foreground">Manual (human-linked)</span>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {popover && (
        <div
          className="absolute z-20 w-64 animate-fade-in rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-xl"
          style={{ left: popover.x, top: popover.y }}
        >
          <span className="font-mono text-[11px] font-medium text-primary">{popover.requirement.id}</span>
          <p className="mt-1 text-sm font-semibold leading-snug">{popover.requirement.title}</p>
          <div className="mt-2.5">
            <StatusBadge status={popover.requirement.liveStatus} />
          </div>
          <button
            onClick={() => onOpenRequirement(popover.requirement.id)}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View full detail panel
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      )}

      <ManualLinkDialog
        open={Boolean(dialogPair)}
        onOpenChange={(open) => !open && setDialogPair(null)}
        source={dialogPair?.source}
        target={dialogPair?.target}
        onConfirm={handleConfirmLink}
        submitting={submitting}
      />

      {toast && (
        <div className="absolute bottom-4 right-4 z-30 flex max-w-sm items-start gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-2xl animate-slide-up">
          <span className="flex-1">{toast}</span>
          <button onClick={() => setToast(null)} className="shrink-0 text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

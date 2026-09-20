import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, ListChecks, Activity, FileClock, BadgeCheck, Clock3, Repeat2, X, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { ActionKanbanColumn } from "./components/ActionKanbanColumn";
import { CreateActionDialog } from "./components/CreateActionDialog";
import { ActionDetailPanel } from "./components/ActionDetailPanel";
import { RestrictedButton } from "./components/RestrictedButton";
import { BOARD_COLUMNS, getDisplayStatus } from "../../data/mockActions";
import { getTeamMemberById } from "../../data/mockTeam";
import { useActions } from "../../hooks/useActions";
import { useTeam } from "../../hooks/useTeam";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useRole, ROLES } from "../../context/RoleContext";
import { updateActionStatus, deleteActionEntry } from "../../services/actionsService";
import { cn } from "../../lib/utils";

const COLUMN_ACCENT = {
  Open: "",
  "In Progress": "bg-primary/5",
  "Evidence Submitted": "bg-status-atrisk-bg/40",
  Verified: "bg-status-confirmed-bg/40",
  Overdue: "bg-status-dropped-bg/40",
};

function KpiTile({ label, value, icon: Icon, highlight }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <p className={cn("text-lg font-bold leading-none text-foreground", highlight)}>{value}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActionTrackerPage() {
  const { activeProjectId } = useActiveProject();
  const { role, currentUser } = useRole();
  const isPM = role === ROLES.PM;
  const { data: actions, setData: setActions, loading } = useActions(activeProjectId);
  const { data: team } = useTeam(activeProjectId);
  const [selected, setSelected] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null); // an existing, unowned action | null
  const [draggedActionId, setDraggedActionId] = useState(null);
  const [toast, setToast] = useState(null); // { message, undo? }
  const [searchParams, setSearchParams] = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const actionId = searchParams.get("action");
    if (!actionId || loading) return;
    const match = actions.find((a) => a.id === actionId);
    if (match) setSelected(match);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("action");
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loading, actions]);

  const showToast = (message, undo) => {
    setToast({ message, undo });
    if (!undo) setTimeout(() => setToast((t) => (t?.message === message ? null : t)), 5000);
  };

  const isOwnedByCurrentUser = (action) => getTeamMemberById(action.ownerId)?.name === currentUser?.name;

  // PM can drag any action; a Team Member only their own.
  const canDrag = (action) => isPM || isOwnedByCurrentUser(action);

  // "Overdue" is computed, never a valid drop target for anyone. A Team
  // Member's only self-service move is into Evidence Submitted:
  // verifying work is a PM-only judgment call, never a drag gesture.
  const canDropHere = (status) => {
    if (status === "Overdue") return false;
    if (isPM) return true;
    return status === "Evidence Submitted";
  };

  const kpis = actions.map((a) => getDisplayStatus(a));
  const kpiValues = {
    total: actions.length,
    active: kpis.filter((s) => ["Open", "In Progress", "Evidence Submitted"].includes(s)).length,
    evidencePending: kpis.filter((s) => s === "Evidence Submitted").length,
    verified: kpis.filter((s) => s === "Verified").length,
    overdue: kpis.filter((s) => s === "Overdue").length,
    recurring: actions.filter((a) => a.recurrenceFlag).length,
  };

  const handleDrop = async (status, actionId) => {
    const action = actions.find((a) => a.id === actionId);
    if (!action || !canDrag(action) || !canDropHere(status)) return;
    const current = getDisplayStatus(action);
    if (status === current || status === action.status) return;
    const previousStatus = action.status;
    const updated = await updateActionStatus(actionId, status, isPM ? `Moved to ${status} by PM.` : `Moved to ${status} by ${currentUser.name}.`);
    setActions((prev) => prev.map((a) => (a.id === actionId ? updated : a)));
    showToast(`Moved "${action.title}" to ${status}.`, async () => {
      const reverted = await updateActionStatus(actionId, previousStatus, "Reverted via Undo.");
      setActions((prev) => prev.map((a) => (a.id === actionId ? reverted : a)));
      setToast(null);
    });
  };

  const handleActionCreated = (action) => {
    setActions((prev) => [action, ...prev]);
    showToast(`Created "${action.title}".`, async () => {
      await deleteActionEntry(action.id);
      setActions((prev) => prev.filter((a) => a.id !== action.id));
      setToast(null);
    });
  };

  const handleActionAssigned = (updated) => {
    setActions((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setSelected((prev) => (prev?.id === updated.id ? updated : prev));
    showToast(`Assigned "${updated.title}".`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[4.5rem] w-full rounded-xl" />)
          : [
              { label: "Total", value: kpiValues.total, icon: ListChecks },
              { label: "Active", value: kpiValues.active, icon: Activity },
              { label: "Evidence Pending", value: kpiValues.evidencePending, icon: FileClock },
              { label: "Verified", value: kpiValues.verified, icon: BadgeCheck },
              { label: "Overdue", value: kpiValues.overdue, icon: Clock3, highlight: "text-status-dropped-fg" },
              { label: "Recurring", value: kpiValues.recurring, icon: Repeat2 },
            ].map((kpi) => <KpiTile key={kpi.label} {...kpi} />)}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-xs text-muted-foreground">
          These track work outcomes, status, evidence, verification, never who's ahead. No individual scores, rankings, or
          performance comparisons are shown anywhere in this feature.
        </p>
        {isPM ? (
          <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Create Action
          </Button>
        ) : (
          <RestrictedButton label="Only Project Managers can create actions">
            <Plus className="h-3.5 w-3.5" />
            Create Action
          </RestrictedButton>
        )}
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-x-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-72 shrink-0 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {BOARD_COLUMNS.map((status) => (
            <ActionKanbanColumn
              key={status}
              status={status}
              actions={actions.filter((a) => getDisplayStatus(a) === status)}
              projectId={activeProjectId}
              draggedActionId={draggedActionId}
              canDrag={canDrag}
              canDropHere={canDropHere}
              onSelectAction={setSelected}
              onDrop={handleDrop}
              onDragStart={setDraggedActionId}
              onDragEnd={() => setDraggedActionId(null)}
              accentClassName={COLUMN_ACCENT[status]}
            />
          ))}
        </div>
      )}

      <CreateActionDialog open={createOpen} onOpenChange={setCreateOpen} projectId={activeProjectId} team={team} onCreated={handleActionCreated} />

      {isPM && (
        <CreateActionDialog
          open={Boolean(assignTarget)}
          onOpenChange={(open) => !open && setAssignTarget(null)}
          projectId={activeProjectId}
          team={team}
          action={assignTarget}
          onAssigned={handleActionAssigned}
        />
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-thin">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="leading-snug">{selected.title}</DialogTitle>
                <DialogDescription>Action detail: evidence, history, and verification.</DialogDescription>
              </DialogHeader>
              <ActionDetailPanel
                key={`${selected.id}-${refreshKey}`}
                action={selected}
                projectId={activeProjectId}
                isPM={isPM}
                isOwner={isOwnedByCurrentUser(selected)}
                onEvidenceChange={() => setRefreshKey((k) => k + 1)}
                onAssignRequest={setAssignTarget}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] flex max-w-sm items-start gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-2xl animate-slide-up">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-confirmed-fg" />
          <span className="flex-1">{toast.message}</span>
          {toast.undo && (
            <button onClick={toast.undo} className="shrink-0 whitespace-nowrap text-xs font-semibold text-primary hover:underline">
              Undo
            </button>
          )}
          <button onClick={() => setToast(null)} className="shrink-0 text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

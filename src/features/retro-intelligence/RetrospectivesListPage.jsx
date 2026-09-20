import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ClipboardList, PenLine } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { RetroDetailDialog } from "./components/RetroDetailDialog";
import { StartRetroDialog } from "./components/StartRetroDialog";
import { useRetrospectives } from "../../hooks/useRetrospectives";
import { useActions } from "../../hooks/useActions";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useRole, ROLES } from "../../context/RoleContext";
import { formatDateTime, cn } from "../../lib/utils";

// Drafts surface first: they're the ones still needing attention.
function sortRetros(list) {
  return [...list].sort((a, b) => {
    if (a.status !== b.status) return a.status === "draft" ? -1 : 1;
    return new Date(b.date) - new Date(a.date);
  });
}

export function RetrospectivesListPage() {
  const { activeProjectId } = useActiveProject();
  const { role, currentUser } = useRole();
  const isPM = role === ROLES.PM;
  const { data: retros, setData: setRetros, loading } = useRetrospectives(activeProjectId);
  // The same action data the Actions tab reads. A retro's own action list
  // (inside RetroDetailDialog) is just this, filtered to one retroId.
  const { data: actions, setData: setActions, loading: actionsLoading } = useActions(activeProjectId);
  const [selected, setSelected] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Deep link support: Activity Feed / Notifications items pointing at a
  // retrospective land here with ?retro=<id> and open it automatically.
  useEffect(() => {
    const retroId = searchParams.get("retro");
    if (!retroId || loading) return;
    const match = retros.find((r) => r.id === retroId);
    if (match) setSelected(match);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("retro");
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loading, retros]);

  const handleStart = (retro) => {
    setRetros((prev) => sortRetros([{ ...retro, projectId: activeProjectId }, ...prev]));
  };

  const handleActionUpdate = (updated) => {
    setActions((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const sortedRetros = sortRetros(retros);

  return (
    <div>
      <PageHeader
        title="Retrospectives"
        description={
          isPM
            ? "Sprint-boundary retrospectives, logged after each sprint closes."
            : "View past retrospectives and keep your own action items up to date."
        }
        actions={isPM && <StartRetroDialog onStart={handleStart} />}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3.5 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-5/6" />
                <Skeleton className="h-3.5 w-4/6" />
              </CardContent>
            </Card>
          ))}

        {!loading && sortedRetros.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            No retrospectives logged for this project yet.
          </div>
        )}

        {!loading &&
          sortedRetros.map((retro) => {
            const isDraft = retro.status === "draft";
            const actionCount = actions.filter((a) => a.retroId === retro.id).length;
            return (
              <button key={retro.id} onClick={() => setSelected(retro)} className="text-left">
                <Card
                  className={cn(
                    "h-full transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md",
                    isDraft ? "border-dashed border-status-atrisk-fg/40" : "hover:border-primary/40"
                  )}
                >
                  <CardHeader>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="w-fit text-[10px]">
                        Sprint {retro.sprintNumber}
                      </Badge>
                      {isDraft && (
                        <Badge variant="warning" className="w-fit gap-1 text-[10px]">
                          <PenLine className="h-3 w-3" />
                          Draft
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base leading-snug">{retro.sprintName}</CardTitle>
                    <p className="text-xs text-muted-foreground">{formatDateTime(retro.date)}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {retro.highlights.length > 0 ? (
                      <ul className="space-y-1.5">
                        {retro.highlights.slice(0, 3).map((h, i) => (
                          <li key={i} className="flex gap-2 text-sm leading-snug text-foreground/90">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                            <span className="line-clamp-2">{h}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {isDraft ? "Not yet discussed." : "No discussion highlights recorded yet."}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                      <ClipboardList className="h-3.5 w-3.5" />
                      {actionsLoading ? "…" : `${actionCount} action item${actionCount === 1 ? "" : "s"}`}
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
      </div>

      <RetroDetailDialog
        retro={selected}
        actions={actions}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        isPM={isPM}
        currentUser={currentUser}
        projectId={activeProjectId}
        onActionUpdate={handleActionUpdate}
      />
    </div>
  );
}

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetTitle,
  SheetDescription,
} from "../../../components/ui/sheet";
import { Skeleton } from "../../../components/ui/skeleton";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { StatusBadge } from "./StatusBadge";
import { StatusTimeline } from "./StatusTimeline";
import { useRequirement } from "../../../hooks/useRequirements";
import { getClusterMeta, getRequirementById } from "../../../data/mockRequirements";

export function RequirementDetailPanel({ requirementId, open, onOpenChange, onSelectRequirement }) {
  const { data: requirement, loading } = useRequirement(requirementId);
  const clusterMeta = requirement ? getClusterMeta(requirement.cluster) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0">
        {loading || !requirement ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <span className="font-mono text-xs font-medium text-primary">{requirement.id}</span>
              <SheetTitle>{requirement.title}</SheetTitle>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <StatusBadge status={requirement.liveStatus} />
                {clusterMeta && (
                  <Badge variant="outline" className="gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: clusterMeta.color }}
                    />
                    {clusterMeta.label}
                  </Badge>
                )}
              </div>
            </SheetHeader>

            <SheetBody className="scrollbar-thin">
              <section>
                <SheetDescription className="leading-relaxed text-foreground/90">
                  {requirement.description}
                </SheetDescription>
              </section>

              <dl className="mt-5 grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-4 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Affected Resource Role
                  </dt>
                  <dd className="mt-1 font-medium text-foreground">{requirement.resourceRole}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Granularity Level
                  </dt>
                  <dd className="mt-1 font-medium text-foreground">{requirement.granularity}</dd>
                </div>
              </dl>

              <Separator className="my-6" />

              <section>
                <h4 className="mb-4 text-sm font-semibold text-foreground">Status History</h4>
                <StatusTimeline history={requirement.statusHistory} />
              </section>

              {requirement.relatedIds?.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <section>
                    <h4 className="mb-3 text-sm font-semibold text-foreground">Related Requirements</h4>
                    <div className="flex flex-wrap gap-2">
                      {requirement.relatedIds.map((relId) => {
                        const related = getRequirementById(relId);
                        return (
                          <button
                            key={relId}
                            onClick={() => onSelectRequirement(relId)}
                            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                          >
                            <span className="font-mono text-primary">{relId}</span>
                            {related && <span className="truncate text-muted-foreground">· {related.title}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}
            </SheetBody>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

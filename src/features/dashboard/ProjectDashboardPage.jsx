import { useMemo } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { SummaryCard } from "./components/SummaryCard";
import { StatusBreakdownChart } from "./components/StatusBreakdownChart";
import { ActivityFeed } from "./components/ActivityFeed";
import { MyTasksCard } from "./components/MyTasksCard";
import { MyActionItemsCard } from "./components/MyActionItemsCard";
import { Skeleton } from "../../components/ui/skeleton";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { useDashboardSummary } from "../../hooks/useDashboardSummary";
import { useRequirementsStatusBreakdown } from "../../hooks/useRequirementsStatusBreakdown";
import { useActivity } from "../../hooks/useActivity";
import { useSchedule } from "../../hooks/useSchedule";
import { useActions } from "../../hooks/useActions";
import { useCurrentMember } from "../../hooks/useCurrentMember";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useRole, ROLES } from "../../context/RoleContext";

function SummaryCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <div className="border-t border-border pt-3">
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectDashboardPage() {
  const { activeProject, activeProjectId } = useActiveProject();
  const { role } = useRole();
  const isPM = role === ROLES.PM;

  const { data: summary, loading } = useDashboardSummary(activeProjectId);
  const { data: statusBreakdown, loading: breakdownLoading } = useRequirementsStatusBreakdown(activeProjectId);
  const { data: activity, loading: activityLoading } = useActivity(activeProjectId);
  const currentMember = useCurrentMember(activeProjectId);

  // Team Member view is centered on their own tasks/action items, the PM
  // branch below simply doesn't render these, so the fetch is unused but
  // still correctly project-scoped rather than pulling every project.
  const { data: tasks, loading: tasksLoading } = useSchedule(activeProjectId);
  const { data: actions, loading: actionsLoading } = useActions(activeProjectId);

  const myTasks = useMemo(
    () => (currentMember ? tasks.filter((t) => t.assigneeId === currentMember.id) : []),
    [tasks, currentMember]
  );
  const myActionItems = useMemo(
    () => (currentMember ? actions.filter((a) => a.ownerId === currentMember.id) : []),
    [actions, currentMember]
  );

  return (
    <div>
      <PageHeader
        title={activeProject ? `${activeProject.name} Dashboard` : "Dashboard"}
        description={
          isPM
            ? activeProject?.description ?? "Full project health overview."
            : "Your tasks and action items on this project, first."
        }
      />

      {isPM ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SummaryCardSkeleton key={i} />)
              : summary.map((item) => <SummaryCard key={item.id} item={item} />)}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <StatusBreakdownChart
                data={statusBreakdown}
                loading={breakdownLoading}
                projectName={activeProject?.name}
              />
            </div>
            <div className="xl:col-span-2">
              <ActivityFeed data={activity} loading={activityLoading} />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MyTasksCard tasks={myTasks} loading={tasksLoading} projectId={activeProjectId} />
            <MyActionItemsCard items={myActionItems} loading={actionsLoading} projectId={activeProjectId} />
          </div>

          {/* Project-wide metrics, de-emphasized behind "my work" for this role */}
          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Project snapshot
            </p>
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                : summary.map((item) => (
                    <div key={item.id}>
                      <p className="text-xs text-muted-foreground">{item.title}</p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">{item.metricLabel}</p>
                    </div>
                  ))}
            </div>
          </div>

          <div className="mt-6">
            <ActivityFeed
              data={activity}
              loading={activityLoading}
              description="Recent events across this project."
            />
          </div>
        </>
      )}
    </div>
  );
}

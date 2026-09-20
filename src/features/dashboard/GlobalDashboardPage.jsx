import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Card } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { TeamCapacityCard } from "./components/TeamCapacityCard";
import { SprintProgressCard } from "./components/SprintProgressCard";
import { UpcomingMeetingsCard } from "./components/UpcomingMeetingsCard";
import { ActivityFeed } from "./components/ActivityFeed";
import { useGlobalOverview } from "../../hooks/useGlobalOverview";
import { useProject } from "../../context/ProjectContext";
import { useRole, ROLES } from "../../context/RoleContext";
import { HEALTH_STATUS } from "../../data/mockProjects";

export function GlobalDashboardPage() {
  const { currentUser, role } = useRole();
  const { projects, extraTeamForProject } = useProject();
  const isPM = role === ROLES.PM;
  const { data, loading } = useGlobalOverview({ projects, currentUser, isPM, extraTeamForProject });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={
          isPM
            ? `Welcome back, ${currentUser?.name?.split(" ")[0]}. Here's how everything is tracking across your projects.`
            : `Welcome back, ${currentUser?.name?.split(" ")[0]}. Here's what's on your plate right now.`
        }
      />

      <div className="mb-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {isPM ? "Your Projects" : "Your Project"}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}

          {!loading && projects.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              You're not staffed on any projects yet.
            </div>
          )}

          {!loading &&
            projects.map((p) => {
              const health = HEALTH_STATUS[p.health] ?? HEALTH_STATUS["on-track"];
              return (
                <Link key={p.id} to={`/projects/${p.id}`} className="group block">
                  <Card className="flex items-center gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                      style={{ backgroundColor: p.colorTag }}
                    >
                      {p.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <span className={`h-1.5 w-1.5 rounded-full ${health.dotClass}`} />
                        {health.label}
                      </span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                  </Card>
                </Link>
              );
            })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TeamCapacityCard groups={data.capacity} loading={loading} isPM={isPM} />
        <SprintProgressCard sprints={data.sprints} loading={loading} isPM={isPM} />
        <UpcomingMeetingsCard meetings={data.meetings} loading={loading} isPM={isPM} />
        <ActivityFeed
          data={data.activity}
          loading={loading}
          showProject
          description={isPM ? "Recent events across all your projects." : "Recent events involving you."}
          emptyLabel={isPM ? "No recent activity yet." : "No recent activity involving you yet."}
        />
      </div>
    </div>
  );
}

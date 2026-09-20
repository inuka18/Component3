import { useNavigate } from "react-router-dom";
import { Users2, ArrowUpRight } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { CreateProjectDialog } from "./components/CreateProjectDialog";
import { useProjects } from "../../hooks/useProjects";
import { useProject } from "../../context/ProjectContext";
import { useRole, ROLES } from "../../context/RoleContext";
import { getTeamForProject } from "../../data/mockTeam";
import { HEALTH_STATUS } from "../../data/mockProjects";
import { formatDateTime } from "../../lib/utils";

function ProjectCardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3.5 w-full" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3.5 w-1/3" />
      </CardContent>
    </Card>
  );
}

export function ProjectsPage() {
  const { role } = useRole();
  const { projects: visibleProjects, extraTeamForProject } = useProject();
  const { loading } = useProjects();
  const navigate = useNavigate();

  const openProject = (id) => {
    navigate(`/projects/${id}`);
  };

  return (
    <div>
      <PageHeader
        title="Projects"
        description={
          role === ROLES.PM
            ? "Every project you manage or contribute to."
            : "Projects you're currently staffed on."
        }
        actions={role === ROLES.PM ? <CreateProjectDialog /> : null}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)}

        {!loading && visibleProjects.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            You're not staffed on any projects yet.
          </div>
        )}

        {!loading &&
          visibleProjects.map((project) => {
            const teamSize = getTeamForProject(project.id).length + extraTeamForProject(project.id).length;
            const health = HEALTH_STATUS[project.health] ?? HEALTH_STATUS["on-track"];

            return (
              <button key={project.id} onClick={() => openProject(project.id)} className="group text-left">
                <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/40">
                  <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-8 w-8 shrink-0 rounded-lg"
                        style={{ backgroundColor: project.colorTag }}
                      />
                      <CardTitle className="text-base">{project.name}</CardTitle>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {project.shortDescription}
                    </p>

                    <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Users2 className="h-3.5 w-3.5" />
                        {teamSize} members
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${health.dotClass}`} />
                        <span className="text-xs font-medium text-muted-foreground">{health.label}</span>
                      </span>
                    </div>

                    <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{project.activeSprint.name}</span>
                      <br />
                      through {formatDateTime(project.activeSprint.endDate)}
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
      </div>
    </div>
  );
}

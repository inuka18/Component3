import { useMemo, useState } from "react";
import { X, Users } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { Card, CardContent } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { InviteMemberDialog } from "./components/InviteMemberDialog";
import { TeamMemberDetailDialog } from "./components/TeamMemberDetailDialog";
import { useTeam } from "../../hooks/useTeam";
import { useSchedule } from "../../hooks/useSchedule";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useMemberProfile } from "../../hooks/useMemberProfile";
import { useProject } from "../../context/ProjectContext";
import { useRole, ROLES } from "../../context/RoleContext";
import { cn } from "../../lib/utils";

function capacityColor(pct) {
  if (pct > 100) return "bg-status-dropped-fg";
  if (pct >= 80) return "bg-status-atrisk-fg";
  return "bg-status-confirmed-fg";
}

export function TeamPage() {
  const { activeProjectId, activeProject } = useActiveProject();
  const { allProjects, extraTeamForProject, inviteMember, removeExtraTeamMember } = useProject();
  const { role, currentUser } = useRole();
  const { data: fetchedTeam, setData: setFetchedTeam, loading } = useTeam(activeProjectId);
  const { data: tasks } = useSchedule(activeProjectId);
  const [selectedMember, setSelectedMember] = useState(null);
  const { data: profile, loading: profileLoading } = useMemberProfile(selectedMember, {
    allProjects,
    extraTeamForProject,
  });

  const members = useMemo(
    () => [...fetchedTeam, ...extraTeamForProject(activeProjectId)],
    [fetchedTeam, extraTeamForProject, activeProjectId]
  );

  const handleInvite = ({ name, email, jobTitle, projectIds }) => {
    inviteMember({ name, email, jobTitle, projectIds });
  };

  // Static seed members (fetchedTeam) are removed from local page state only;
  // invited members live in the shared extraTeam store in ProjectContext and
  // need to be removed there so the removal is visible everywhere else too.
  const handleRemove = (id) => {
    if (extraTeamForProject(activeProjectId).some((m) => m.id === id)) {
      removeExtraTeamMember(id);
    } else {
      setFetchedTeam((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const isPM = role === ROLES.PM;
  const memberTasks = selectedMember ? tasks.filter((t) => t.assigneeId === selectedMember.id) : [];
  const isSelf = selectedMember?.name === currentUser?.name;
  const canSeeTasks = isPM || isSelf;

  return (
    <div>
      <PageHeader
        title="Team"
        description={activeProject ? `Everyone staffed on ${activeProject.name}.` : "Project team roster."}
        actions={
          isPM ? (
            <InviteMemberDialog projects={allProjects} defaultProjectId={activeProjectId} onInvite={handleInvite} />
          ) : null
        }
      />

      {!loading && members.length === 0 && (
        <EmptyState
          icon={Users}
          title="No team members yet"
          description={
            isPM
              ? "Invite people to staff this project. They'll show up here with their workload and assigned tasks."
              : "No one has been added to this project's roster yet."
          }
          action={
            isPM ? (
              <InviteMemberDialog projects={allProjects} defaultProjectId={activeProjectId} onInvite={handleInvite} />
            ) : null
          }
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-3 p-4">
                <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}

        {!loading &&
          members.map((member) => (
            <Card key={member.id} className="group relative">
              {isPM && member.appRole !== "pm" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(member.id);
                  }}
                  aria-label={`Remove ${member.name}`}
                  className="absolute right-3 top-3 z-10 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-destructive group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={() => setSelectedMember(member)} className="w-full text-left">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 text-sm">
                      <AvatarFallback>{member.initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{member.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{member.jobTitle}</p>
                    </div>
                    {member.appRole === "pm" && (
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        PM
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Workload</span>
                      <span className="font-medium text-foreground">{member.workloadPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full transition-all", capacityColor(member.workloadPercent))}
                        style={{ width: `${Math.min(member.workloadPercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                    <span>{member.assignedTasksCount} assigned tasks</span>
                    {member.email && <span className="truncate">{member.email}</span>}
                  </div>
                </CardContent>
              </button>
            </Card>
          ))}
      </div>

      <TeamMemberDetailDialog
        member={selectedMember}
        tasks={memberTasks}
        canSeeTasks={canSeeTasks}
        profile={profile}
        profileLoading={profileLoading}
        open={Boolean(selectedMember)}
        onOpenChange={(open) => !open && setSelectedMember(null)}
      />
    </div>
  );
}

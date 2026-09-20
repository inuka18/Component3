import { useNavigate } from "react-router-dom";
import { NetworkMap } from "./components/NetworkMap";
import { Skeleton } from "../../components/ui/skeleton";
import { useRequirements } from "../../hooks/useRequirements";
import { useManualLinks } from "../../hooks/useManualLinks";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useRole, ROLES } from "../../context/RoleContext";
import { createManualLink, deleteManualLink } from "../../services/manualLinksService";

export function NetworkMapPage() {
  const { activeProjectId } = useActiveProject();
  const { role, currentUser } = useRole();
  const isPM = role === ROLES.PM;
  const { data: requirements, loading } = useRequirements(activeProjectId);
  const { data: manualLinks, setData: setManualLinks, loading: linksLoading } = useManualLinks(activeProjectId);
  const navigate = useNavigate();

  const handleCreateManualLink = async ({ sourceId, targetId, reason }) => {
    const link = await createManualLink({
      projectId: activeProjectId,
      sourceId,
      targetId,
      reason,
      createdBy: currentUser?.name ?? "Unknown",
    });
    setManualLinks((prev) => [...prev, link]);
    return link;
  };

  const handleRemoveManualLink = async (link) => {
    await deleteManualLink(link, currentUser?.name ?? "Unknown");
    setManualLinks((prev) => prev.filter((l) => l.id !== link.id));
  };

  if (loading || linksLoading) {
    return <Skeleton className="h-[calc(100vh-14rem)] min-h-[520px] w-full rounded-xl" />;
  }

  return (
    <NetworkMap
      requirements={requirements}
      onOpenRequirement={(id) => navigate(`/projects/${activeProjectId}/requirements/list?req=${id}`)}
      isPM={isPM}
      manualLinks={manualLinks}
      onCreateManualLink={handleCreateManualLink}
      onRemoveManualLink={handleRemoveManualLink}
    />
  );
}

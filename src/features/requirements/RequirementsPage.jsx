import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { RequirementsTable } from "./components/RequirementsTable";
import { SignalFeed } from "./components/SignalFeed";
import { RequirementDetailPanel } from "./components/RequirementDetailPanel";
import { useRequirements } from "../../hooks/useRequirements";
import { useSignals } from "../../hooks/useSignals";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useRole, ROLES } from "../../context/RoleContext";

export function RequirementsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeProjectId } = useActiveProject();
  const { role } = useRole();
  const { data: requirements, setData: setRequirements, loading: reqLoading } = useRequirements(activeProjectId);
  const { data: signals, setData: setSignals, loading: sigLoading } = useSignals(activeProjectId);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleRequirementsCreated = useCallback(({ requirements: created, fileName }) => {
    setRequirements((prev) => [...created, ...prev]);
    setToast(`${created.length} requirement${created.length === 1 ? "" : "s"} added from ${fileName}.`);
  }, [setRequirements]);

  const activeTab = searchParams.get("tab") === "signals" ? "signals" : "list";
  const activeReqId = searchParams.get("req");
  const highlightSignalId = searchParams.get("signal");

  // A Signal Analytics drill-through lands here with any subset of these:
  // undefined fields just mean "don't pre-apply that filter".
  const presetClassification = searchParams.get("classification");
  const presetSource = searchParams.get("source");
  const presetFrom = searchParams.get("from");
  const presetTo = searchParams.get("to");
  const hasPreset = Boolean(presetClassification || presetSource || presetFrom);
  const presetFilters = hasPreset
    ? { classification: presetClassification, source: presetSource, from: presetFrom, to: presetTo }
    : null;

  const clearPresetFilters = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("classification");
      next.delete("source");
      next.delete("from");
      next.delete("to");
      return next;
    });
  }, [setSearchParams]);

  const setActiveTab = useCallback(
    (tab) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (tab === "list") next.delete("tab");
        else next.set("tab", tab);
        return next;
      });
    },
    [setSearchParams]
  );

  const selectRequirement = useCallback(
    (id) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("req", id);
        return next;
      });
    },
    [setSearchParams]
  );

  const closeDetail = useCallback(
    (open) => {
      if (open) return;
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("req");
        return next;
      });
    },
    [setSearchParams]
  );

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Requirements List</TabsTrigger>
          <TabsTrigger value="signals">Signal Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <RequirementsTable
            requirements={requirements}
            loading={reqLoading}
            onSelectRequirement={selectRequirement}
            projectId={activeProjectId}
            isPM={role === ROLES.PM}
            onRequirementsCreated={handleRequirementsCreated}
          />
        </TabsContent>

        <TabsContent value="signals">
          <SignalFeed
            signals={signals}
            setSignals={setSignals}
            loading={sigLoading}
            onSelectRequirement={selectRequirement}
            isPM={role === ROLES.PM}
            highlightSignalId={highlightSignalId}
            presetFilters={presetFilters}
            onClearPresetFilters={clearPresetFilters}
          />
        </TabsContent>
      </Tabs>

      <RequirementDetailPanel
        requirementId={activeReqId}
        open={Boolean(activeReqId)}
        onOpenChange={closeDetail}
        onSelectRequirement={selectRequirement}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] flex max-w-sm items-start gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-2xl animate-slide-up">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-confirmed-fg" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

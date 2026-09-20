import { useState } from "react";
import { UploadCloud, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { detectRequirementsFromSRS } from "../../../data/mockRequirementDetection";
import { createRequirementsFromSRS } from "../../../services/requirementsService";
import { RESOURCE_ROLES } from "../../../data/mockRequirements";
import { useRole } from "../../../context/RoleContext";
import { cn } from "../../../lib/utils";

const ANALYZE_DELAY_MS = 1600;
const CATEGORIES = ["Functional", "Non-Functional"];
// Same role list the rest of the app already uses for a requirement's
// resourceRole (RequirementsTable's filter, RequirementDetailPanel) and
// for team members' own jobTitle, plus "Unassigned" up front since a
// just-detected requirement has no owning role yet by default.
const DETECTION_ROLES = ["Unassigned", ...RESOURCE_ROLES];

// The onboarding counterpart to SignalFeed's UploadDocumentDialog, and
// deliberately its own component rather than a mode flag on that one:
// that dialog detects CHANGE SIGNALS against requirements that already
// exist; this one detects the requirements THEMSELVES, for a project
// that has none yet. Only ever reachable from the Requirements List's
// empty state (see RequirementsTable), and only for a PM, never a forced
// step in project creation.
export function DetectRequirementsDialog({ projectId, onCreated }) {
  const { currentUser } = useRole();
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState("idle"); // idle | analyzing | results
  const [file, setFile] = useState(null);
  const [detected, setDetected] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStage("idle");
    setFile(null);
    setDetected([]);
    setSelectedIds(new Set());
    setSubmitting(false);
  };

  const handleOpenChange = (next) => {
    setOpen(next);
    if (!next) reset();
  };

  const handleAnalyze = () => {
    if (!file) return;
    setStage("analyzing");
    setTimeout(async () => {
      const items = await detectRequirementsFromSRS({ projectId });
      setDetected(items);
      // Default to everything selected, the PM deselects what they don't
      // want rather than having to opt every item in by hand.
      setSelectedIds(new Set(items.map((i) => i.id)));
      setStage("results");
    }, ANALYZE_DELAY_MS);
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = detected.length > 0 && selectedIds.size === detected.length;
  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(detected.map((i) => i.id)));
  };

  const updateField = (id, field, value) => {
    setDetected((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleConfirm = async () => {
    const chosen = detected.filter((item) => selectedIds.has(item.id));
    if (chosen.length === 0) return;
    setSubmitting(true);
    const fileName = file.name;
    const created = await createRequirementsFromSRS({
      projectId,
      items: chosen.map((item) => ({
        title: item.title,
        description: item.description,
        category: item.category,
        resourceRole: item.resourceRole,
        cluster: item.cluster,
      })),
      sourceDocument: fileName,
      actor: currentUser?.name ?? "Unknown",
    });
    setSubmitting(false);
    setOpen(false);
    reset();
    onCreated({ requirements: created, fileName });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UploadCloud className="h-4 w-4" />
          Upload SRS to Detect Requirements
        </Button>
      </DialogTrigger>
      <DialogContent className={cn(stage === "results" && "sm:max-w-2xl")}>
        {stage === "idle" && (
          <>
            <DialogHeader>
              <DialogTitle>Upload an SRS document</DialogTitle>
              <DialogDescription>Select a file to detect this project's requirements.</DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor="srs-file">File</Label>
              <Input id="srs-file" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              <p className="text-xs text-muted-foreground">
                Prototype only, no file is actually uploaded or stored.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" disabled={!file} onClick={handleAnalyze}>
                Upload &amp; Analyze
              </Button>
            </div>
          </>
        )}

        {stage === "analyzing" && (
          <>
            <DialogHeader>
              <DialogTitle>Analyzing document…</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Scanning "{file?.name}"…</p>
            </div>
          </>
        )}

        {stage === "results" && (
          <>
            <DialogHeader>
              <DialogTitle>
                {detected.length} requirement{detected.length === 1 ? "" : "s"} detected
              </DialogTitle>
              <DialogDescription>From "{file?.name}", review and confirm which requirements to add.</DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <Check className="h-3.5 w-3.5" />
                {allSelected ? "Deselect all" : "Select all"}
              </button>
              <span className="text-xs text-muted-foreground">
                {selectedIds.size} of {detected.length} selected
              </span>
            </div>

            <div className="max-h-96 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
              {detected.map((item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border border-border p-3 transition-opacity",
                      !isSelected && "opacity-50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelected(item.id)}
                      className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded border-input accent-primary"
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Input
                        value={item.title}
                        onChange={(e) => updateField(item.id, "title", e.target.value)}
                        className="h-8 font-medium"
                      />
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateField(item.id, "description", e.target.value)}
                        className="min-h-[60px] text-sm"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Select value={item.category} onValueChange={(v) => updateField(item.id, "category", v)}>
                          <SelectTrigger className="h-8 w-44 text-xs">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={item.resourceRole} onValueChange={(v) => updateField(item.id, "resourceRole", v)}>
                          <SelectTrigger className="h-8 w-48 text-xs">
                            <SelectValue placeholder="Resource role" />
                          </SelectTrigger>
                          <SelectContent>
                            {DETECTION_ROLES.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Discard
                </Button>
              </DialogClose>
              <Button type="button" disabled={selectedIds.size === 0 || submitting} onClick={handleConfirm}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Add {selectedIds.size} Requirement{selectedIds.size === 1 ? "" : "s"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

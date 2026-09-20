import { useState } from "react";
import { Upload, Loader2, FileText, Link2, AlertTriangle, Check } from "lucide-react";
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
import { Badge } from "../../../components/ui/badge";
import { ClassificationBadge } from "./ClassificationBadge";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { extractSignalsFromDocument } from "../../../data/mockDocumentExtraction";
import { getRequirementById } from "../../../data/mockRequirements";
import { cn } from "../../../lib/utils";

const ANALYZE_DELAY_MS = 1600;

// Prototype-only: no real upload or NLP happens. Picking a file runs a
// mock extraction pass that splits the document into several independently
// classified requirement-relevant snippets, never a single classification
// for the whole file, mirroring how a real SRS-style document actually
// contains many distinct requirements.
export function UploadDocumentDialog({ onUpload, projectId }) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState("idle"); // idle | analyzing | results
  const [file, setFile] = useState(null);
  const [extracted, setExtracted] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const reset = () => {
    setStage("idle");
    setFile(null);
    setExtracted([]);
    setSelectedIds(new Set());
  };

  const handleOpenChange = (next) => {
    setOpen(next);
    if (!next) reset();
  };

  const handleAnalyze = () => {
    if (!file) return;
    setStage("analyzing");
    setTimeout(async () => {
      const items = await extractSignalsFromDocument({ fileName: file.name, projectId });
      setExtracted(items);
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

  const allSelected = extracted.length > 0 && selectedIds.size === extracted.length;
  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(extracted.map((i) => i.id)));
  };

  const handleConfirm = () => {
    const chosen = extracted.filter((item) => selectedIds.has(item.id));
    if (chosen.length === 0) return;
    onUpload(chosen);
    setOpen(false);
    reset();
  };

  const pendingCount = extracted.filter((s) => s.reviewStatus === "pending").length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className={cn(stage === "results" && "sm:max-w-2xl")}>
        {stage === "idle" && (
          <>
            <DialogHeader>
              <DialogTitle>Upload a document</DialogTitle>
              <DialogDescription>
                This will scan the document and extract each requirement-relevant statement individually. You
                won't need to classify anything by hand.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor="doc-file">File</Label>
              <Input
                id="doc-file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
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
              <DialogDescription>Extracting and classifying individual requirement statements.</DialogDescription>
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
                {extracted.length} item{extracted.length === 1 ? "" : "s"} extracted
              </DialogTitle>
              <DialogDescription>
                From "{file?.name}", choose which items to add to the Signal Feed, each as its own entry.
                {pendingCount > 0 && ` ${pendingCount} will need review (low confidence or a proposed Dropped status).`}
              </DialogDescription>
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
                {selectedIds.size} of {extracted.length} selected
              </span>
            </div>

            <div className="max-h-96 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
              {extracted.map((item) => {
                const mapped = item.mappedRequirementId ? getRequirementById(item.mappedRequirementId) : null;
                const isSelected = selectedIds.has(item.id);
                return (
                  <label
                    key={item.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-opacity",
                      item.reviewStatus === "pending" ? "border-primary/30 bg-primary/[0.03]" : "border-border",
                      !isSelected && "opacity-50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelected(item.id)}
                      className="mt-1 h-3.5 w-3.5 shrink-0 rounded border-input accent-primary"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-sm leading-relaxed text-foreground/90">"{item.text}"</p>
                        <ClassificationBadge classification={item.classification} />
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <ConfidenceMeter value={item.confidence} />
                        {item.proposedStatus === "Dropped" && (
                          <Badge variant="danger" className="gap-1 text-[10px]">
                            <AlertTriangle className="h-3 w-3" />
                            Proposes: Dropped
                          </Badge>
                        )}
                        {item.reviewStatus === "pending" && (
                          <Badge variant="warning" className="text-[10px]">
                            Pending Review
                          </Badge>
                        )}
                        <span className="ml-auto">
                          {mapped ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                              <Link2 className="h-3 w-3" />
                              <span className="font-mono">{mapped.id}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                              Unmatched
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                Source: Document: {file?.name}
              </span>
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Discard
                  </Button>
                </DialogClose>
                <Button type="button" disabled={selectedIds.size === 0} onClick={handleConfirm}>
                  Add {selectedIds.size} to Signal Feed
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

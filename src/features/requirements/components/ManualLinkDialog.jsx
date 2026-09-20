import { useEffect, useState } from "react";
import { Link2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";

// The one gate a manual link has to pass before it exists: a reason.
// This is what keeps "Link Requirements" mode a deliberate override
// rather than freeform doodling: every link this dialog produces
// carries the justification straight into the Traceability Ledger.
export function ManualLinkDialog({ open, onOpenChange, source, target, onConfirm, submitting }) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  const canSubmit = reason.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onConfirm(reason.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-status-ripple-fg" />
            Link requirements
          </DialogTitle>
          <DialogDescription>
            {source && target ? (
              <>
                <span className="font-mono text-foreground">{source.id}</span> · {source.title}
                {" "}↔{" "}
                <span className="font-mono text-foreground">{target.id}</span> · {target.title}
              </>
            ) : (
              "Connect two requirements."
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="link-reason">Why are these related?</Label>
            <Textarea
              id="link-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="What's the actual connection the algorithm hasn't caught yet?"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!canSubmit || submitting}>
              <Link2 className="h-4 w-4" />
              {submitting ? "Linking…" : "Confirm Link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

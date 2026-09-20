import { useState } from "react";
import { Plus } from "lucide-react";
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

const EMPTY = { sprintName: "", sprintNumber: "", date: "" };

// PM-only. Starts a bare retrospective record: discussion notes get
// filled in as the sprint-boundary conversation happens, same as a real
// retro would start as an empty agenda. Action items aren't part of this
// record at all (see mockActions.js); they get created individually,
// against this retro's id, as the discussion actually surfaces them.
export function StartRetroDialog({ onStart }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.sprintName.trim() || !form.date) return;
    onStart({
      id: `retro-new-${Date.now()}`,
      status: "draft",
      sprintName: form.sprintName,
      sprintNumber: Number(form.sprintNumber) || undefined,
      date: new Date(form.date).toISOString(),
      highlights: [],
      discussionNotes: "No discussion notes recorded yet. Add them as the retrospective happens.",
    });
    setForm(EMPTY);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Start Retrospective
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a new retrospective</DialogTitle>
          <DialogDescription>Creates a new sprint-boundary retrospective record.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="retro-name">Sprint name</Label>
            <Input
              id="retro-name"
              placeholder="e.g. Sprint 7 Retrospective"
              value={form.sprintName}
              onChange={(e) => setForm((p) => ({ ...p, sprintName: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="retro-number">Sprint number</Label>
              <Input
                id="retro-number"
                type="number"
                min="1"
                value={form.sprintNumber}
                onChange={(e) => setForm((p) => ({ ...p, sprintNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="retro-date">Date</Label>
              <Input
                id="retro-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Start retrospective</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../components/ui/select";

const STATUS_OPTIONS = [
  { value: "not-started", label: "Backlog" },
  { value: "in-progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

// PM-only creation form: title/description/assignee/story points/
// initial column. Writes straight into the same task records Component
// 3's Schedule feature reads (see addTaskToProject in
// src/data/mockSchedulePhases.js).
export function AddTaskDialog({ team, defaultStatus = "not-started", onCreate }) {
  const [open, setOpen] = useState(false);
  const emptyForm = () => ({ title: "", description: "", assigneeId: "", storyPoints: "", status: defaultStatus });
  const [form, setForm] = useState(emptyForm);

  const handleOpenChange = (next) => {
    setOpen(next);
    if (next) setForm(emptyForm());
  };

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onCreate({ ...form, storyPoints: form.storyPoints ? Number(form.storyPoints) : 0 });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a task</DialogTitle>
          <DialogDescription>
            Creates a new task on the board, the same task record Component 3's Schedule feature reads.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" placeholder="e.g. Add CSV export to admin console" value={form.title} onChange={set("title")} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea id="task-desc" rows={3} placeholder="What needs to happen for this to be done?" value={form.description} onChange={set("description")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Assignee</Label>
              <Select value={form.assigneeId} onValueChange={(v) => setForm((prev) => ({ ...prev, assigneeId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  {team.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-points">Story Points</Label>
              <Input id="task-points" type="number" min="0" placeholder="e.g. 5" value={form.storyPoints} onChange={set("storyPoints")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Column</Label>
            <Select value={form.status} onValueChange={(v) => setForm((prev) => ({ ...prev, status: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

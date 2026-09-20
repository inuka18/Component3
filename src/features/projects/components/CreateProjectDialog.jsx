import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { useProject } from "../../../context/ProjectContext";

const EMPTY_FORM = { name: "", description: "", startDate: "", inviteesRaw: "" };

export function CreateProjectDialog() {
  const { addProject } = useProject();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const created = addProject(form);
    setForm(EMPTY_FORM);
    setOpen(false);
    if (created) navigate(`/projects/${created.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new project</DialogTitle>
          <DialogDescription>
            Set up a new workspace. You'll be added as its Project Manager automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="proj-name">Project name</Label>
            <Input
              id="proj-name"
              placeholder="e.g. Horizon Logistics"
              value={form.name}
              onChange={set("name")}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="proj-desc">Description</Label>
            <Textarea
              id="proj-desc"
              placeholder="A short summary of what this project is building…"
              value={form.description}
              onChange={set("description")}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="proj-start">Start date</Label>
            <Input id="proj-start" type="date" value={form.startDate} onChange={set("startDate")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="proj-invitees">Initial team members</Label>
            <Textarea
              id="proj-invitees"
              placeholder="One name or email per line, e.g. jane@company.com"
              value={form.inviteesRaw}
              onChange={set("inviteesRaw")}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Create project</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

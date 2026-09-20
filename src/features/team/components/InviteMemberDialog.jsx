import { useState } from "react";
import { UserPlus, Check } from "lucide-react";
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
import { cn } from "../../../lib/utils";

// `projects` is the full list of projects the inviting PM can see:
// multi-project support means an invite isn't limited to whichever
// project the Team page happens to be scoped to right now.
export function InviteMemberDialog({ projects, defaultProjectId, onInvite, trigger }) {
  const [open, setOpen] = useState(false);
  const emptyForm = () => ({
    name: "",
    email: "",
    jobTitle: "",
    projectIds: defaultProjectId ? [defaultProjectId] : [],
  });
  const [form, setForm] = useState(emptyForm);

  const handleOpenChange = (next) => {
    setOpen(next);
    if (next) setForm(emptyForm());
  };

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const toggleProject = (id) =>
    setForm((prev) => ({
      ...prev,
      projectIds: prev.projectIds.includes(id)
        ? prev.projectIds.filter((p) => p !== id)
        : [...prev.projectIds, id],
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.projectIds.length === 0) return;
    onInvite({
      name: form.name,
      email: form.email,
      jobTitle: form.jobTitle || "Team Member",
      projectIds: form.projectIds,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>They'll be added to the project(s) you select below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="inv-name">Full name</Label>
            <Input id="inv-name" placeholder="e.g. Sahan Perera" value={form.name} onChange={set("name")} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv-email">Email</Label>
            <Input
              id="inv-email"
              type="email"
              placeholder="sahan.perera@inspid-tech.dev"
              value={form.email}
              onChange={set("email")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv-role">Job title</Label>
            <Input id="inv-role" placeholder="e.g. Backend Developer" value={form.jobTitle} onChange={set("jobTitle")} />
          </div>

          <div className="space-y-1.5">
            <Label>Project(s)</Label>
            <div className="flex flex-wrap gap-1.5 rounded-lg border border-border p-2.5">
              {projects.length === 0 && (
                <span className="px-1 py-1 text-xs text-muted-foreground">No projects found.</span>
              )}
              {projects.map((p) => {
                const selected = form.projectIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProject(p.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    {selected ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.colorTag }} />
                    )}
                    {p.name}
                  </button>
                );
              })}
            </div>
            {form.projectIds.length === 0 && (
              <p className="text-xs text-status-atrisk-fg">Select at least one project.</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={form.projectIds.length === 0}>
              Send invite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

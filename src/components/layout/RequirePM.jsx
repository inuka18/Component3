import { ShieldAlert } from "lucide-react";
import { useRole, ROLES } from "../../context/RoleContext";

// Defense-in-depth guard for PM-only routes (Project Settings). The nav
// link is already hidden for Team Members, this covers direct URL entry.
export function RequirePM({ children }) {
  const { role } = useRole();

  if (role !== ROLES.PM) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldAlert className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-semibold text-foreground">Only Project Managers can access Project Settings.</p>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          Switch roles from the top bar to preview this page as a Project Manager.
        </p>
      </div>
    );
  }

  return children;
}

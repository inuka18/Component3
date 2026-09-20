import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, User, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Logo } from "../../components/layout/Logo";
import { useRole, ROLES } from "../../context/RoleContext";

export function LoginPage() {
  const { login } = useRole();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const enter = (role) => {
    login(role);
    navigate("/", { replace: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prototype gate only, any input proceeds. Manual sign-in enters as PM.
    enter(ROLES.PM);
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Subtle branded backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(var(--primary) / 0.16), transparent), radial-gradient(ellipse 60% 50% at 100% 100%, hsl(var(--primary) / 0.10), transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4] [background-size:32px_32px]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)",
        }}
      />

      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Logo imgClassName="h-8" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your InSpiD-TECH workspace
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@inspid-tech.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Log in
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Quick demo access
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-2.5">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-3 py-5"
              onClick={() => enter(ROLES.PM)}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="flex flex-col items-start">
                <span className="text-sm font-semibold text-foreground">Continue as Project Manager</span>
                <span className="text-xs text-muted-foreground">Full admin view across all projects</span>
              </span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-3 py-5"
              onClick={() => enter(ROLES.MEMBER)}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </span>
              <span className="flex flex-col items-start">
                <span className="text-sm font-semibold text-foreground">Continue as Team Member</span>
                <span className="text-xs text-muted-foreground">Scoped view of your assigned project</span>
              </span>
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          This is a research prototype, no real authentication is performed. Any credentials
          proceed, or use quick demo access above.
        </p>
      </div>
    </div>
  );
}

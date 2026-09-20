import { Sun, Moon, Monitor } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Button } from "../../components/ui/button";
import { useTheme } from "../../context/ThemeContext";
import { useRole } from "../../context/RoleContext";

const NOTIFICATION_PREFS = [
  { label: "Requirement status changes", enabled: true },
  { label: "High-confidence signal matches", enabled: true },
  { label: "Weekly traceability digest", enabled: false },
  { label: "Gap detection alerts", enabled: false },
];

// Personal, not project-scoped: identical for both roles, which is
// deliberate: account/appearance/notification preferences belong to the
// person, not to whichever project they happen to be looking at.
export function AccountSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { currentUser } = useRole();

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Account Settings"
        description="Personal settings: account, appearance, and notification preferences. Shared across every project."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Mock user profile for this demo build, no real authentication.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="h-14 w-14 text-base">
              <AvatarFallback>{currentUser?.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{currentUser?.name}</p>
              <p className="text-sm text-muted-foreground">
                {currentUser?.title} · {currentUser?.email}
              </p>
              <Badge variant="secondary" className="mt-1.5">
                Demo Account
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose how InSpiD-TECH looks on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button variant="outline" size="sm" disabled title="System sync not enabled in this prototype">
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Illustrative only, toggles are not wired up in this prototype.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {NOTIFICATION_PREFS.map((pref, i) => (
              <div key={pref.label}>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-foreground">{pref.label}</span>
                  <button
                    role="switch"
                    aria-checked={pref.enabled}
                    disabled
                    className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                      pref.enabled ? "bg-primary" : "bg-muted"
                    } cursor-not-allowed opacity-80`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                        pref.enabled ? "left-[18px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
                {i < NOTIFICATION_PREFS.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

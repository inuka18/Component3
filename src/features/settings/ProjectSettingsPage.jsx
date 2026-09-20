import { useState } from "react";
import { ShieldCheck, MessageSquare, Mail, BookOpen } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useActiveProject } from "../../hooks/useActiveProject";

const INITIAL_INTEGRATIONS = [
  { id: "slack", name: "Slack", description: "Pull standup and channel messages into the signal feed.", icon: MessageSquare, connected: true },
  { id: "email", name: "Email", description: "Ingest project emails as communication signals.", icon: Mail, connected: true },
  { id: "confluence", name: "Confluence", description: "Sync requirement documents for change detection.", icon: BookOpen, connected: false },
];

// PM-only: the route itself is wrapped in <RequirePM> and the nav link is
// hidden for Team Members, so reaching this page at all already implies PM.
export function ProjectSettingsPage() {
  const { activeProject } = useActiveProject();
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);

  const toggleIntegration = (id) =>
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i))
    );

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Project Settings"
        description={`Configuration scoped to ${activeProject?.name ?? "this project"}, visible to Project Managers only.`}
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Project Details
            </CardTitle>
            <CardDescription>Core information about this project.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Project name</p>
              <p className="mt-1 text-sm font-medium text-foreground">{activeProject?.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active sprint</p>
              <p className="mt-1 text-sm font-medium text-foreground">{activeProject?.activeSprint?.name}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</p>
              <p className="mt-1 text-sm text-foreground/90">{activeProject?.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>
              Connect the sources this project listens to for requirement signals. Non-functional in this prototype.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {integrations.map((integration) => (
              <div key={integration.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <integration.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{integration.name}</p>
                  <p className="text-xs text-muted-foreground">{integration.description}</p>
                </div>
                <Button
                  size="sm"
                  variant={integration.connected ? "outline" : "default"}
                  onClick={() => toggleIntegration(integration.id)}
                  className="shrink-0"
                >
                  {integration.connected ? "Connected" : "Connect"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

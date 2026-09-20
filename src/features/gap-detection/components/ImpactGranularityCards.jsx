import { CalendarClock, CalendarDays, CalendarRange } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

const RISK_VARIANT = { High: "danger", Medium: "warning", Low: "success" };

function GranularityCard({ title, icon: Icon, fields, risk }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground">{value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
          <span className="text-muted-foreground">Risk</span>
          <Badge variant={RISK_VARIANT[risk] ?? "outline"}>{risk}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// Three read-only cards reporting what a propagation run already produced.
// Day/Week share a field shape (just different scope), Sprint reports
// commitments and story points instead, per the spec.
export function ImpactGranularityCards({ run }) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <GranularityCard
          title="Day"
          icon={CalendarClock}
          fields={[
            ["Affected Tasks", run.dayImpact.affectedTasks],
            ["Workload Impact", run.dayImpact.workloadImpact],
            ["Expected Slip", run.dayImpact.expectedSlip],
          ]}
          risk={run.dayImpact.risk}
        />
        <GranularityCard
          title="Week"
          icon={CalendarDays}
          fields={[
            ["Affected Tasks", run.weekImpact.affectedTasks],
            ["Workload Impact", run.weekImpact.workloadImpact],
            ["Expected Slip", run.weekImpact.expectedSlip],
          ]}
          risk={run.weekImpact.risk}
        />
        <GranularityCard
          title="Sprint"
          icon={CalendarRange}
          fields={[
            ["Affected Commitments", run.sprintImpact.affectedCommitments],
            ["Story Points at Risk", run.sprintImpact.storyPointsAtRisk],
            ["Expected Sprint Slip", run.sprintImpact.expectedSprintSlip],
          ]}
          risk={run.sprintImpact.risk}
        />
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Single propagation run produces synchronized Day + Week + Sprint outputs.
      </p>
    </div>
  );
}

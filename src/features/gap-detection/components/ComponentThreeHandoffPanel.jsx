import { CheckCircle2 } from "lucide-react";
import { formatRelativeTime } from "../../../lib/utils";

// Handing an impact assessment to Schedule isn't a separate step a PM
// triggers: finalizing the run already sends it (see recordPropagationRun
// in gapDetectionService). This is just the quiet receipt: a run is always
// sentToC3 by the time it reaches this page.
export function ComponentThreeHandoffPanel({ run }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-status-confirmed-fg" />
      <span className="font-medium text-foreground">Sent to Schedule</span>
      <span>· {formatRelativeTime(run.sentToC3At)}</span>
    </div>
  );
}

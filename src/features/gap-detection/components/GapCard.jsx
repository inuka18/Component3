import { Layers, ListChecks, Clock } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { GapTypeBadge } from "./GapTypeBadge";
import { SeverityBadge } from "./SeverityBadge";
import { getRequirementById } from "../../../data/mockRequirements";
import { formatRelativeTime } from "../../../lib/utils";

const STATUS_VARIANT = { Open: "warning", Reviewed: "info", Propagated: "success" };

export function GapCard({ gap, onClick }) {
  const requirement = getRequirementById(gap.requirementId);

  return (
    <Card className="transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <button onClick={() => onClick(gap)} className="w-full text-left">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <GapTypeBadge type={gap.type} />
            <SeverityBadge severity={gap.severity} />
            <Badge variant={STATUS_VARIANT[gap.status]} className="text-[10px]">
              {gap.status}
            </Badge>
          </div>

          <div>
            <p className="text-sm font-semibold leading-snug text-foreground">{gap.title}</p>
            {requirement && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <span className="font-mono text-primary">{requirement.id}</span>
                <span className="truncate">· {requirement.title}</span>
              </p>
            )}
          </div>

          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{gap.description}</p>

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatRelativeTime(gap.detectedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              {gap.evidenceCount} evidence
            </span>
            {gap.taskIds?.length > 0 && (
              <span className="flex items-center gap-1">
                <ListChecks className="h-3.5 w-3.5" />
                {gap.taskIds.length} task{gap.taskIds.length > 1 ? "s" : ""}
              </span>
            )}
            <span className="ml-auto font-medium text-foreground">{gap.confidence}% confidence</span>
          </div>
        </CardContent>
      </button>
    </Card>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightLeft,
  AlertTriangle,
  CalendarPlus,
  Clock,
  Radio,
  History as HistoryIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { formatRelativeTime, cn } from "../../../lib/utils";
import { resolveRefRoute } from "../../../lib/activityLinks";

export const ACTIVITY_TYPE_CONFIG = {
  "task-move": { icon: ArrowRightLeft, className: "bg-primary/10 text-primary" },
  "requirement-flag": { icon: AlertTriangle, className: "bg-status-atrisk-bg text-status-atrisk-fg" },
  "meeting-scheduled": { icon: CalendarPlus, className: "bg-status-modified-bg text-status-modified-fg" },
  "time-logged": { icon: Clock, className: "bg-muted text-muted-foreground" },
  "signal-detected": { icon: Radio, className: "bg-class-expectation-bg text-class-expectation-fg" },
  "retro-completed": { icon: HistoryIcon, className: "bg-status-confirmed-bg text-status-confirmed-fg" },
};

const COLLAPSED_COUNT = 6;

export function ActivityFeed({
  data,
  loading,
  description = "Recent events across this project.",
  emptyLabel = "No recent activity yet.",
  showProject = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? data : data.slice(0, COLLAPSED_COUNT);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-full max-w-sm" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && data.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>
        )}

        {!loading && data.length > 0 && (
          <>
            <ol className="space-y-4">
              {visible.map((item) => {
                const config = ACTIVITY_TYPE_CONFIG[item.type] ?? ACTIVITY_TYPE_CONFIG["task-move"];
                const Icon = config.icon;
                const route = resolveRefRoute(item.projectId, item.refType, item.refId);
                const Wrapper = route ? Link : "div";
                const wrapperProps = route ? { to: route } : {};

                return (
                  <li key={item.id}>
                    <Wrapper
                      {...wrapperProps}
                      className={cn(
                        "flex items-start gap-3 rounded-lg -m-1 p-1 transition-colors",
                        route && "hover:bg-accent"
                      )}
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${config.className}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        {showProject && item.projectName && (
                          <span className="mb-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: item.projectColor }}
                            />
                            {item.projectName}
                          </span>
                        )}
                        <p className="text-sm leading-snug text-foreground">
                          <span className="font-medium">{item.actorName}</span> {item.message}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatRelativeTime(item.timestamp)}
                        </p>
                      </div>
                    </Wrapper>
                  </li>
                );
              })}
            </ol>

            {data.length > COLLAPSED_COUNT && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-4 text-xs font-medium text-primary hover:underline"
              >
                {expanded ? "Show less" : `View all (${data.length})`}
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

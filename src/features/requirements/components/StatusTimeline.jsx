import { StatusBadge } from "./StatusBadge";
import { formatDateTime } from "../../../lib/utils";

export function StatusTimeline({ history }) {
  const chronological = [...history].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {chronological.map((entry, idx) => (
        <li key={idx} className="relative">
          <span className="absolute -left-[29px] top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-background bg-primary" />
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={entry.status} />
            <span className="text-xs text-muted-foreground">{formatDateTime(entry.timestamp)}</span>
          </div>
          <blockquote className="mt-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm italic leading-relaxed text-foreground/90">
            {entry.signal}
          </blockquote>
        </li>
      ))}
    </ol>
  );
}

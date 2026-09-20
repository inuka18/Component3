import { Repeat2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { SPRINT_LABELS } from "../../../data/mockCrossValidation";
import { cn } from "../../../lib/utils";

// Rows are the structured delay-reason codes actually logged, columns are
// the sprints they were cross-validated against. A cell lighting up more
// than once in the same row is exactly what "recurring issue" means here,
// computed straight from mockCrossValidation rather than a separate
// recurrence-tracking dataset.
export function RecurrenceMatrix({ crossValidation }) {
  const codes = [...new Set(crossValidation.map((cv) => cv.structuredCode))].sort();
  const sprintIds = [...new Set(crossValidation.map((cv) => cv.sprintId))].sort(
    (a, b) => (SPRINT_LABELS[a]?.name ?? a).localeCompare(SPRINT_LABELS[b]?.name ?? b)
  );

  if (codes.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No cross-validation history yet to detect recurrence from.</p>;
  }

  // The row that recurs across the most distinct sprints: "Dependency
  // Blocked has occurred in 4 of the last 5 sprints" is exactly this,
  // read straight off the grid below. Only worth calling out once a code
  // has actually shown up in more than one sprint.
  const topPattern = codes
    .map((code) => ({
      code,
      sprintsHit: sprintIds.filter((id) => crossValidation.some((cv) => cv.structuredCode === code && cv.sprintId === id)).length,
    }))
    .sort((a, b) => b.sprintsHit - a.sprintsHit)[0];

  return (
    <div className="space-y-3">
      {topPattern && topPattern.sprintsHit > 1 && (
        <p className="flex items-center gap-2 rounded-lg border border-dashed border-status-atrisk-bg bg-status-atrisk-bg/30 px-3 py-2 text-xs font-medium text-status-atrisk-fg">
          <Repeat2 className="h-3.5 w-3.5 shrink-0" />
          "{topPattern.code}" has occurred in {topPattern.sprintsHit} of the last {sprintIds.length} sprints, the strongest recurring
          pattern in this project right now.
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-border scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Structured Cause</TableHead>
              {sprintIds.map((id) => (
                <TableHead key={id} className="text-center whitespace-nowrap">
                  {SPRINT_LABELS[id]?.name.replace(/^Sprint (\d+).*$/, "Sprint $1") ?? id}
                </TableHead>
              ))}
              <TableHead className="text-center">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {codes.map((code) => {
              const rowEntries = crossValidation.filter((cv) => cv.structuredCode === code);
              const total = rowEntries.length;
              return (
                <TableRow key={code}>
                  <TableCell className="font-medium text-foreground">{code}</TableCell>
                  {sprintIds.map((id) => {
                    const count = rowEntries.filter((cv) => cv.sprintId === id).length;
                    return (
                      <TableCell key={id} className="text-center">
                        {count === 0 ? (
                          <span className="text-muted-foreground/40">0</span>
                        ) : (
                          <span
                            className={cn(
                              "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                              count > 1 ? "bg-status-dropped-bg text-status-dropped-fg" : "bg-status-atrisk-bg text-status-atrisk-fg"
                            )}
                          >
                            {count}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center font-semibold text-foreground">{total}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

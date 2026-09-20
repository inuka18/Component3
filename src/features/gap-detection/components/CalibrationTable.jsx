import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Input } from "../../../components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../components/ui/tooltip";

// Shared editable weight table used by both the Gap-Type and
// Change/Disruption calibration sections. PMs can edit weights inline,
// Team Members see the same table read-only behind a tooltip explaining
// why, matching the calibration-weight pattern already established on the
// Workspace page.
export function CalibrationTable({ typeLabel, rows, isPM, onWeightChange }) {
  const table = (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{typeLabel}</TableHead>
          <TableHead>Example</TableHead>
          <TableHead className="w-28 text-right">Weight</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.key}>
            <TableCell className="font-medium text-foreground">{row.label ?? row.key}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{row.example}</TableCell>
            <TableCell className="text-right">
              {isPM ? (
                <Input
                  type="number"
                  step="0.05"
                  min="0"
                  value={row.weight}
                  onChange={(e) => onWeightChange(row.key, Number(e.target.value))}
                  className="ml-auto h-8 w-20 text-right"
                />
              ) : (
                <span className="font-mono text-sm font-medium text-foreground">{row.weight.toFixed(2)}</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (isPM) return <div className="overflow-hidden rounded-lg border border-border">{table}</div>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div tabIndex={0} className="overflow-hidden rounded-lg border border-border opacity-90">
          {table}
        </div>
      </TooltipTrigger>
      <TooltipContent>Only Project Managers can edit calibration weights</TooltipContent>
    </Tooltip>
  );
}

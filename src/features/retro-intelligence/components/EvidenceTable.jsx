import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  GitBranch,
  TrendingUp,
  FlaskConical,
  CalendarDays,
  Check,
  X,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { RestrictedButton } from "./RestrictedButton";
import { LedgerLookupPanel } from "./LedgerLookupPanel";
import { getActionById } from "../../../data/mockActions";
import { SPRINT_LABELS } from "../../../data/mockCrossValidation";
import { getRequirementById } from "../../../data/mockRequirements";
import { resolveLedgerQuery } from "../../../services/ledgerService";

const TYPE_ICON = {
  Document: FileText,
  Repository: GitBranch,
  "Sprint Metric": TrendingUp,
  "Test Result": FlaskConical,
  "Meeting Reference": CalendarDays,
};

const STATUS_VARIANT = { "Pending Review": "warning", Verified: "success", Rejected: "danger" };

function shortSprint(sprintId) {
  return SPRINT_LABELS[sprintId]?.name.replace(/^Sprint (\d+).*$/, "Sprint $1") ?? sprintId;
}

// One row = one evidence entry, expandable into its Claim Comparison:
// the claim as evidence.description states it, set against what the
// traceability ledger (mockLedger.js, via LedgerLookupPanel in its scoped
// mode) actually recorded for the requirement that evidence's action
// traces back to.
export function EvidenceTable({ evidence, isPM, projectId, busyId, onAccept, onReject }) {
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>ID</TableHead>
            <TableHead>Linked Action</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Sprint</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Decision</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {evidence.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                No evidence submitted for this project yet.
              </TableCell>
            </TableRow>
          )}

          {evidence.map((item) => {
            const action = getActionById(item.actionId);
            const Icon = TYPE_ICON[item.type] ?? FileText;
            const resolved = resolveLedgerQuery(item.actionId);
            const canCompare = Boolean(resolved?.requirementId);
            const isExpanded = expandedId === item.id;
            const canDecide = item.status === "Pending Review";

            return (
              <Fragment key={item.id}>
                <TableRow className={isExpanded ? "border-b-0" : undefined}>
                  <TableCell className="pr-0">
                    {canCompare && (
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={isExpanded ? "Collapse claim comparison" : "Compare claim to ledger"}
                      >
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.id}</TableCell>
                  <TableCell className="max-w-[10rem]">
                    {action ? (
                      <button
                        onClick={() => navigate(`../actions?action=${action.id}`)}
                        className="line-clamp-2 text-left text-xs font-medium text-primary hover:underline"
                      >
                        {action.title}
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1 whitespace-nowrap text-[10px]">
                      <Icon className="h-3 w-3" />
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="line-clamp-2 text-xs text-foreground/90">{item.description}</p>
                  </TableCell>
                  <TableCell className="max-w-[9rem]">
                    <p className="line-clamp-2 text-xs text-muted-foreground">{item.source}</p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{shortSprint(item.sprintId)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[item.status]} className="whitespace-nowrap text-[10px]">
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canDecide ? (
                      isPM ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 px-2 text-xs"
                            disabled={busyId === item.id}
                            onClick={() => onAccept(item)}
                          >
                            <Check className="h-3 w-3" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 gap-1 px-2 text-xs text-status-dropped-fg hover:text-status-dropped-fg"
                            disabled={busyId === item.id}
                            onClick={() => onReject(item)}
                          >
                            <X className="h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <RestrictedButton label="Only Project Managers can accept or reject evidence">
                            <Check className="h-3 w-3" />
                            Accept
                          </RestrictedButton>
                        </div>
                      )
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                </TableRow>

                {isExpanded && (
                  <TableRow className="bg-muted/20 hover:bg-muted/20">
                    <TableCell colSpan={9} className="py-4">
                      <ClaimComparison evidence={item} resolved={resolved} projectId={projectId} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function ClaimComparison({ evidence, resolved, projectId }) {
  const requirement = resolved.requirementId ? getRequirementById(resolved.requirementId) : null;

  return (
    <div className="space-y-3 px-2">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Claim as stated</p>
        <p className="text-sm leading-relaxed text-foreground/90">"{evidence.description}"</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Source: {evidence.source}
          {!evidence.ledgerOutcome && " · not yet fact-checked against the ledger"}
        </p>
      </div>
      <LedgerLookupPanel
        requirementId={resolved.requirementId}
        requirementTitle={requirement?.title}
        ledgerResult={evidence.ledgerOutcome}
        projectId={projectId}
      />
    </div>
  );
}

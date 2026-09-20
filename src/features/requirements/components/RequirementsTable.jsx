import { useMemo, useState } from "react";
import { Search, ListChecks } from "lucide-react";
import { EmptyState } from "../../../components/common/EmptyState";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Skeleton } from "../../../components/ui/skeleton";
import { StatusBadge } from "./StatusBadge";
import { DetectRequirementsDialog } from "./DetectRequirementsDialog";
import { STATUSES, RESOURCE_ROLES } from "../../../data/mockRequirements";
import { formatRelativeTime } from "../../../lib/utils";

function lastUpdatedOf(req) {
  return req.statusHistory[req.statusHistory.length - 1].timestamp;
}

export function RequirementsTable({ requirements, loading, onSelectRequirement, projectId, isPM, onRequirementsCreated }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = useMemo(() => {
    return requirements
      .filter((r) => (statusFilter === "all" ? true : r.liveStatus === statusFilter))
      .filter((r) => (roleFilter === "all" ? true : r.resourceRole === roleFilter))
      .filter((r) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          r.id.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(lastUpdatedOf(b)) - new Date(lastUpdatedOf(a)));
  }, [requirements, search, statusFilter, roleFilter]);

  if (!loading && requirements.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="No requirements yet for this project."
        description="Upload a Software Requirements Specification (SRS) document to detect the requirements themselves and establish this project's baseline. This is separate from the Signal Feed, which only tracks changes against requirements that already exist."
        action={isPM ? <DetectRequirementsDialog projectId={projectId} onCreated={onRequirementsCreated} /> : null}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, title, or description…"
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Resource role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All resource roles</SelectItem>
            {RESOURCE_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requirement ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Live Status</TableHead>
              <TableHead>Affected Resource Role</TableHead>
              <TableHead>Granularity Level</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-[10rem]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No requirements match the current filters.
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filtered.map((req) => (
                <TableRow
                  key={req.id}
                  onClick={() => onSelectRequirement(req.id)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-mono text-xs font-medium text-primary">
                    {req.id}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span className="line-clamp-1 font-medium text-foreground">{req.title}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={req.liveStatus} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {req.resourceRole}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {req.granularity}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatRelativeTime(lastUpdatedOf(req))}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {!loading && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {requirements.length} requirements
        </p>
      )}
    </div>
  );
}

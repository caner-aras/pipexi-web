"use client";

import { useMemo, useState } from "react";
import { History, MoreHorizontalIcon, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getShiftMemberDisplayName } from "@/lib/shift-format";
import {
  formatAuditLogActionLabel,
  type AuditLog,
} from "@/types/audit-log";
import type { OrganizationMember } from "@/types/member";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function matchesAuditLogSearch(
  auditLog: AuditLog,
  query: string,
  actorName: string
): boolean {
  const search = query.trim().toLowerCase();

  if (!search) {
    return true;
  }

  return (
    auditLog.entityName.toLowerCase().includes(search) ||
    auditLog.action.toLowerCase().includes(search) ||
    auditLog.entityId.toLowerCase().includes(search) ||
    actorName.toLowerCase().includes(search)
  );
}

interface AuditLogListProps {
  auditLogs: AuditLog[];
  members: OrganizationMember[];
  onViewAuditLog: (auditLog: AuditLog) => void;
}

export function AuditLogList({
  auditLogs,
  members,
  onViewAuditLog,
}: AuditLogListProps) {
  const [search, setSearch] = useState("");

  const membersById = useMemo(() => {
    const map = new Map<string, OrganizationMember>();

    for (const member of members) {
      map.set(member.id, member);
    }

    return map;
  }, [members]);

  const filteredAuditLogs = useMemo(
    () =>
      auditLogs.filter((auditLog) => {
        const actor = auditLog.actorMemberId
          ? membersById.get(auditLog.actorMemberId)
          : null;
        const actorName = actor
          ? getShiftMemberDisplayName(actor)
          : "System";

        return matchesAuditLogSearch(auditLog, search, actorName);
      }),
    [auditLogs, search, membersById]
  );

  return (
    <>
      <div className="mb-4 space-y-3">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search audit logs..."
            className="h-8 pl-8"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          {filteredAuditLogs.length} of {auditLogs.length} log
          {auditLogs.length === 1 ? "" : "s"}
        </p>
      </div>

      {filteredAuditLogs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No audit logs match"
          description="Try a different search."
          filtered
        />
      ) : (
        <div className="overflow-hidden rounded-sm border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Entity</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAuditLogs.map((auditLog) => {
                const actor = auditLog.actorMemberId
                  ? membersById.get(auditLog.actorMemberId)
                  : null;

                return (
                  <TableRow key={auditLog.id}>
                    <TableCell className="max-w-[14rem]">
                      <div className="font-medium">{auditLog.entityName}</div>
                      <div className="truncate font-mono text-xs text-muted-foreground">
                        {auditLog.entityId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {formatAuditLogActionLabel(auditLog.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {actor ? getShiftMemberDisplayName(actor) : "System"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDateTime(auditLog.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                            />
                          }
                        >
                          <MoreHorizontalIcon />
                          <span className="sr-only">Open menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onViewAuditLog(auditLog)}
                          >
                            View details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { KeyRound, Search } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatPermissionDate,
  getPermissionStatusFilterOptions,
  matchesPermissionSearch,
} from "@/lib/permission-format";
import type { Permission } from "@/types/permission";

interface PermissionListProps {
  permissions: Permission[];
}

export function PermissionList({ permissions }: PermissionListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const statusFilterOptions = useMemo(
    () => getPermissionStatusFilterOptions(permissions),
    [permissions]
  );

  const filteredPermissions = useMemo(
    () =>
      permissions.filter((permission) =>
        matchesPermissionSearch(permission, searchQuery, statusFilter)
      ),
    [permissions, searchQuery, statusFilter]
  );

  if (permissions.length === 0) {
    return (
      <EmptyState
        icon={KeyRound}
        title="No permissions found"
        description="System permissions will appear here once they are configured."
      />
    );
  }

  return (
    <>
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by permission key..."
              className="h-8 pl-8"
            />
          </div>

          <Select
            items={statusFilterOptions}
            value={statusFilter}
            onValueChange={(value) => {
              if (value) {
                setStatusFilter(value);
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-44" size="default">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {statusFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground">
          {filteredPermissions.length} of {permissions.length} permission
          {permissions.length === 1 ? "" : "s"}
        </p>
      </div>

      {filteredPermissions.length === 0 ? (
        <EmptyState title="No permissions match your search" filtered />
      ) : (
        <div className="overflow-hidden rounded-sm border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPermissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <KeyRound className="size-4 shrink-0 text-muted-foreground" />
                      <span className="font-mono text-sm">{permission.key}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusIndicator status={permission.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatPermissionDate(permission.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

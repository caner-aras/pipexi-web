"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Building2,
  MoreHorizontalIcon,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  buildRecordStatusFilterOptions,
  matchesRecordStatusFilter,
} from "@/lib/record-status";
import type { Organization } from "@/types/auth";

type NameSortDirection = "asc" | "desc";

function matchesOrganizationSearch(
  organization: Organization,
  query: string,
  statusFilter: string
): boolean {
  if (!matchesRecordStatusFilter(organization.status, statusFilter)) {
    return false;
  }

  const search = query.trim().toLowerCase();

  if (!search) {
    return true;
  }

  const name = organization.name.toLowerCase();
  const slug = organization.slug.toLowerCase();
  const timezone = organization.timezone.toLowerCase();

  return (
    name.includes(search) ||
    slug.includes(search) ||
    timezone.includes(search)
  );
}

interface OrganizationListProps {
  organizations: Organization[];
  onEditOrganization?: (organization: Organization) => void;
  onDuplicateOrganization?: (organization: Organization) => void;
  onViewMembers?: (organization: Organization) => void;
  onLeaveRequest?: (organization: Organization) => void;
}

export function OrganizationList({
  organizations,
  onEditOrganization,
  onDuplicateOrganization,
  onViewMembers,
  onLeaveRequest,
}: OrganizationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [nameSortDirection, setNameSortDirection] =
    useState<NameSortDirection>("asc");

  const statusFilterOptions = useMemo(
    () =>
      buildRecordStatusFilterOptions(
        organizations.map((organization) => organization.status)
      ),
    [organizations]
  );

  const filteredOrganizations = useMemo(() => {
    const filtered = organizations.filter((organization) =>
      matchesOrganizationSearch(organization, searchQuery, statusFilter)
    );

    return [...filtered].sort((left, right) => {
      const comparison = left.name.localeCompare(right.name, undefined, {
        sensitivity: "base",
      });

      return nameSortDirection === "asc" ? comparison : -comparison;
    });
  }, [organizations, searchQuery, statusFilter, nameSortDirection]);

  function toggleNameSort() {
    setNameSortDirection((current) => (current === "asc" ? "desc" : "asc"));
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
              placeholder="Search by name, slug, or timezone..."
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
          {filteredOrganizations.length} of {organizations.length} organization
          {organizations.length === 1 ? "" : "s"}
        </p>
      </div>

      {filteredOrganizations.length === 0 ? (
        <EmptyState title="No organizations match your search" filtered />
      ) : (
        <div className="overflow-hidden rounded-sm border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-56">
                  <button
                    type="button"
                    onClick={toggleNameSort}
                    className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-foreground"
                    aria-label={`Sort by name ${nameSortDirection === "asc" ? "descending" : "ascending"}`}
                  >
                    Name
                    {nameSortDirection === "asc" ? (
                      <ArrowUpIcon className="size-3.5 text-muted-foreground" />
                    ) : (
                      <ArrowDownIcon className="size-3.5 text-muted-foreground" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="w-40">Slug</TableHead>
                <TableHead className="w-36">Timezone</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="text-right w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizations.map((organization) => (
                <TableRow
                  key={organization.id}
                  className="cursor-pointer"
                  onClick={() => onEditOrganization?.(organization)}
                >
                  <TableCell className="font-medium w-56">
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4 text-muted-foreground" />
                      {organization.name}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground w-40">
                    {organization.slug}
                  </TableCell>
                  <TableCell className="w-36">{organization.timezone}</TableCell>
                  <TableCell className="w-32 text-center">
                    <StatusIndicator status={organization.status} />
                  </TableCell>
                  <TableCell className="text-right w-24">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={(event) => event.stopPropagation()}
                          />
                        }
                      >
                        <MoreHorizontalIcon />
                        <span className="sr-only">Open menu</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <DropdownMenuItem
                          onClick={() => onEditOrganization?.(organization)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            onDuplicateOrganization?.(organization)
                          }
                        >
                          Duplicate
                        </DropdownMenuItem>
                        {onViewMembers ? (
                          <DropdownMenuItem
                            onClick={() => onViewMembers(organization)}
                          >
                            Members
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onLeaveRequest?.(organization)}
                        >
                          Leave request
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

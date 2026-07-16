"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck2, MoreHorizontalIcon, Search } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
  buildRecordStatusFilterOptions,
  matchesRecordStatusFilter,
} from "@/lib/record-status";
import { getShiftMemberDisplayName } from "@/lib/shift-format";
import { getLeaveTypeLabel, type LeaveRequest } from "@/types/leave-request";

function matchesLeaveRequestSearch(
  leaveRequest: LeaveRequest,
  query: string,
  statusFilter: string
): boolean {
  if (!matchesRecordStatusFilter(leaveRequest.status, statusFilter)) {
    return false;
  }

  const search = query.trim().toLowerCase();

  if (!search) {
    return true;
  }

  const memberName = getShiftMemberDisplayName(
    leaveRequest.organizationMember
  ).toLowerCase();
  const jobTitle =
    leaveRequest.organizationMember?.jobTitle?.toLowerCase() ?? "";
  const memberEmail =
    leaveRequest.organizationMember?.user?.email?.toLowerCase() ?? "";
  const organizationName =
    leaveRequest.organization?.name?.toLowerCase() ?? "";

  return (
    leaveRequest.leaveType.toLowerCase().includes(search) ||
    getLeaveTypeLabel(leaveRequest.leaveType).toLowerCase().includes(search) ||
    leaveRequest.reason.toLowerCase().includes(search) ||
    leaveRequest.status.toLowerCase().includes(search) ||
    leaveRequest.startDate.includes(search) ||
    leaveRequest.endDate.includes(search) ||
    memberName.includes(search) ||
    jobTitle.includes(search) ||
    memberEmail.includes(search) ||
    organizationName.includes(search)
  );
}

interface LeaveRequestListProps {
  leaveRequests: LeaveRequest[];
  onEditLeaveRequest?: (leaveRequest: LeaveRequest) => void;
}

export function LeaveRequestList({
  leaveRequests,
  onEditLeaveRequest,
}: LeaveRequestListProps) {
  const router = useRouter();
  const shouldRefreshAfterRemoveRef = useRef(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leaveRequestToRemove, setLeaveRequestToRemove] =
    useState<LeaveRequest | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const statusOptions = useMemo(
    () =>
      buildRecordStatusFilterOptions(
        leaveRequests.map((leaveRequest) => leaveRequest.status)
      ),
    [leaveRequests]
  );
  const filteredLeaveRequests = useMemo(
    () =>
      leaveRequests.filter((leaveRequest) =>
        matchesLeaveRequestSearch(leaveRequest, search, statusFilter)
      ),
    [leaveRequests, search, statusFilter]
  );

  function handleOpenRemove(leaveRequest: LeaveRequest) {
    setLeaveRequestToRemove(leaveRequest);
    setRemoveDialogOpen(true);
  }

  function handleRemoveDialogOpenChange(open: boolean) {
    setRemoveDialogOpen(open);
  }

  function handleRemoveDialogOpenChangeComplete(open: boolean) {
    if (!open) {
      setLeaveRequestToRemove(null);
      setIsRemoving(false);

      if (shouldRefreshAfterRemoveRef.current) {
        shouldRefreshAfterRemoveRef.current = false;
        router.refresh();
      }
    }
  }

  async function handleConfirmRemove() {
    if (!leaveRequestToRemove) {
      return;
    }

    setIsRemoving(true);

    try {
      const response = await fetch(
        `/api/leave-requests/${leaveRequestToRemove.id}`,
        { method: "DELETE" }
      );
      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        toast.error(body.message ?? "Failed to delete leave request");
        return;
      }

      toast.success("Leave request deleted successfully");
      shouldRefreshAfterRemoveRef.current = true;
      setRemoveDialogOpen(false);
    } catch {
      toast.error("Failed to delete leave request");
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <>
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search leave requests..."
              className="h-8 pl-8"
            />
          </div>
          <Select
            items={statusOptions}
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
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground">
          {filteredLeaveRequests.length} of {leaveRequests.length} leave
          request{leaveRequests.length === 1 ? "" : "s"}
        </p>
      </div>

      {filteredLeaveRequests.length === 0 ? (
        <EmptyState
          icon={CalendarCheck2}
          title="No leave requests match"
          description="Try a different search or status filter."
          filtered
        />
      ) : (
        <div className="overflow-hidden rounded-sm border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Member</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeaveRequests.map((leaveRequest) => (
                <TableRow key={leaveRequest.id}>
                  <TableCell>
                    <div className="font-medium">
                      {getShiftMemberDisplayName(
                        leaveRequest.organizationMember
                      )}
                    </div>
                    {(leaveRequest.organizationMember?.jobTitle ||
                      leaveRequest.organizationMember?.user?.email) && (
                      <div className="text-xs text-muted-foreground">
                        {[
                          leaveRequest.organizationMember.jobTitle,
                          leaveRequest.organizationMember.user?.email,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {leaveRequest.organization?.name ?? "—"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {getLeaveTypeLabel(leaveRequest.leaveType)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {leaveRequest.startDate} → {leaveRequest.endDate}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {leaveRequest.reason}
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusIndicator status={leaveRequest.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {new Intl.DateTimeFormat("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(leaveRequest.createdAt))}
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
                          onClick={() => onEditLeaveRequest?.(leaveRequest)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleOpenRemove(leaveRequest)}
                        >
                          Delete
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

      <AlertDialog
        open={removeDialogOpen}
        onOpenChange={handleRemoveDialogOpenChange}
        onOpenChangeComplete={handleRemoveDialogOpenChangeComplete}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete leave request?</AlertDialogTitle>
            <AlertDialogDescription>
              {leaveRequestToRemove
                ? `This will permanently delete the ${getLeaveTypeLabel(leaveRequestToRemove.leaveType).toLowerCase()} leave request (${leaveRequestToRemove.startDate} → ${leaveRequestToRemove.endDate}). This action cannot be undone.`
                : "This will permanently delete the leave request. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmRemove()}
              disabled={isRemoving}
            >
              {isRemoving ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

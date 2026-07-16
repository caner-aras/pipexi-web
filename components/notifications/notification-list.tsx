"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, MoreHorizontalIcon, Search } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  buildRecordStatusFilterOptions,
  matchesRecordStatusFilter,
} from "@/lib/record-status";
import { getShiftMemberDisplayName } from "@/lib/shift-format";
import type { OrganizationMember } from "@/types/member";
import {
  formatNotificationTypeLabel,
  type Notification,
} from "@/types/notification";

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

function matchesNotificationSearch(
  notification: Notification,
  query: string,
  statusFilter: string,
  memberName: string
): boolean {
  if (!matchesRecordStatusFilter(notification.status, statusFilter)) {
    return false;
  }

  const search = query.trim().toLowerCase();

  if (!search) {
    return true;
  }

  return (
    notification.title.toLowerCase().includes(search) ||
    notification.type.toLowerCase().includes(search) ||
    notification.status.toLowerCase().includes(search) ||
    memberName.toLowerCase().includes(search)
  );
}

interface NotificationListProps {
  notifications: Notification[];
  members: OrganizationMember[];
  onEditNotification: (notification: Notification) => void;
}

export function NotificationList({
  notifications,
  members,
  onEditNotification,
}: NotificationListProps) {
  const router = useRouter();
  const shouldRefreshAfterRemoveRef = useRef(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notificationToRemove, setNotificationToRemove] =
    useState<Notification | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const membersById = useMemo(() => {
    const map = new Map<string, OrganizationMember>();

    for (const member of members) {
      map.set(member.id, member);
    }

    return map;
  }, [members]);

  const statusOptions = useMemo(
    () =>
      buildRecordStatusFilterOptions(
        notifications.map((notification) => notification.status)
      ),
    [notifications]
  );

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((notification) => {
        const member = membersById.get(notification.organizationMemberId);
        const memberName = member
          ? getShiftMemberDisplayName(member)
          : notification.organizationMemberId;

        return matchesNotificationSearch(
          notification,
          search,
          statusFilter,
          memberName
        );
      }),
    [notifications, search, statusFilter, membersById]
  );

  function handleOpenRemove(notification: Notification) {
    setNotificationToRemove(notification);
    setRemoveDialogOpen(true);
  }

  function handleRemoveDialogOpenChange(open: boolean) {
    setRemoveDialogOpen(open);
  }

  function handleRemoveDialogOpenChangeComplete(open: boolean) {
    if (!open) {
      setNotificationToRemove(null);
      setIsRemoving(false);

      if (shouldRefreshAfterRemoveRef.current) {
        shouldRefreshAfterRemoveRef.current = false;
        router.refresh();
      }
    }
  }

  async function handleConfirmRemove() {
    if (!notificationToRemove) {
      return;
    }

    setIsRemoving(true);

    try {
      const response = await fetch(
        `/api/notifications/${notificationToRemove.id}`,
        { method: "DELETE" }
      );
      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        toast.error(body.message ?? "Failed to delete notification");
        return;
      }

      toast.success("Notification deleted successfully");
      shouldRefreshAfterRemoveRef.current = true;
      setRemoveDialogOpen(false);
    } catch {
      toast.error("Failed to delete notification");
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
              placeholder="Search notifications..."
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
          {filteredNotifications.length} of {notifications.length} notification
          {notifications.length === 1 ? "" : "s"}
        </p>
      </div>

      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications match"
          description="Try a different search or status filter."
          filtered
        />
      ) : (
        <div className="overflow-hidden rounded-sm border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Title</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Read</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.map((notification) => {
                const member = membersById.get(
                  notification.organizationMemberId
                );

                return (
                  <TableRow key={notification.id}>
                    <TableCell className="max-w-[16rem] font-medium">
                      <span className="line-clamp-2">{notification.title}</span>
                    </TableCell>
                    <TableCell className="max-w-[12rem]">
                      <span className="truncate">
                        {member
                          ? getShiftMemberDisplayName(member)
                          : "Unknown member"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {formatNotificationTypeLabel(notification.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {notification.scheduledTime
                        ? formatDateTime(notification.scheduledTime)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={notification.isRead ? "outline" : "default"}
                        className="font-normal"
                      >
                        {notification.isRead ? "Read" : "Unread"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusIndicator status={notification.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDateTime(notification.createdAt)}
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
                            onClick={() => onEditNotification(notification)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleOpenRemove(notification)}
                          >
                            Delete
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

      <AlertDialog
        open={removeDialogOpen}
        onOpenChange={handleRemoveDialogOpenChange}
        onOpenChangeComplete={handleRemoveDialogOpenChangeComplete}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete notification?</AlertDialogTitle>
            <AlertDialogDescription>
              {notificationToRemove
                ? `This will permanently delete “${notificationToRemove.title}”. This action cannot be undone.`
                : "This will permanently delete the notification. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
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

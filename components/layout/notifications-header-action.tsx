"use client";

import { Bell } from "lucide-react";
import { useMemo, useState } from "react";

import { useOrganization } from "@/components/layout/organization-provider";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useOrganizationNotifications } from "@/hooks/use-organization-notifications";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notification";

function formatNotificationTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

function NotificationItem({ notification }: { notification: Notification }) {
  return (
    <li
      className={cn(
        "rounded-lg px-3 py-2.5 transition-colors",
        notification.isRead ? "bg-transparent" : "bg-muted/50"
      )}
    >
      <div className="flex items-start gap-2.5">
        {!notification.isRead ? (
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-sky-500" />
        ) : (
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-transparent" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-snug">
              {notification.title}
            </p>
            <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
              {formatNotificationTime(notification.createdAt)}
            </span>
          </div>
          {notification.body ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {notification.body}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function NotificationsHeaderAction() {
  const [open, setOpen] = useState(false);
  const { selectedOrganizationId } = useOrganization();
  const { notifications, isLoading, error } = useOrganizationNotifications(
    selectedOrganizationId
  );

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  if (!selectedOrganizationId) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="relative size-7"
            aria-label={
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : "Notifications"
            }
          />
        }
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-3 min-w-3 items-center justify-center rounded-full bg-sky-500 px-1 text-[10px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 gap-0 p-0">
        <PopoverHeader className="border-b border-border/50 px-3.5 py-3">
          <div className="flex items-center justify-between gap-2">
            <PopoverTitle>Notifications</PopoverTitle>
            {unreadCount > 0 ? (
              <span className="text-xs text-muted-foreground">
                {unreadCount} unread
              </span>
            ) : null}
          </div>
          <PopoverDescription className="sr-only">
            Recent notifications for the selected organization.
          </PopoverDescription>
        </PopoverHeader>

        <div className="max-h-80 overflow-y-auto p-2">
          {isLoading ? (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              Loading notifications...
            </p>
          ) : error ? (
            <p className="px-2 py-8 text-center text-sm text-destructive">
              {error}
            </p>
          ) : notifications.length === 0 ? (
            <div className="px-2 py-8 text-center">
              <Bell className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No notifications yet.
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

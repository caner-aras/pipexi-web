"use client";

import { Bell, Plus } from "lucide-react";
import { useState } from "react";

import { NotificationFormDialog } from "@/components/notifications/notification-form-dialog";
import { NotificationList } from "@/components/notifications/notification-list";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { OrganizationMember } from "@/types/member";
import type { Notification } from "@/types/notification";

interface NotificationsPageContentProps {
  organizationId: string;
  organizationName: string | null;
  notifications: Notification[];
  members: OrganizationMember[];
  error: string | null;
}

export function NotificationsPageContent({
  organizationId,
  organizationName,
  notifications,
  members,
  error,
}: NotificationsPageContentProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingNotification, setEditingNotification] =
    useState<Notification | null>(null);

  function handleCreate() {
    setEditingNotification(null);
    setFormOpen(true);
  }

  function handleEdit(notification: Notification) {
    setEditingNotification(notification);
    setFormOpen(true);
  }

  function handleFormOpenChange(open: boolean) {
    setFormOpen(open);
  }

  function handleFormOpenChangeComplete(open: boolean) {
    if (!open) {
      setEditingNotification(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Notifications"
        description={
          organizationName
            ? `Notifications for ${organizationName}.`
            : "View notifications for the selected organization."
        }
        actions={
          <Button size="sm" onClick={handleCreate} disabled={members.length === 0}>
            <Plus className="size-4" />
            New notification
          </Button>
        }
      />

      <div className="w-full">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="Create a notification and send it to an organization member."
            action={
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={members.length === 0}
              >
                <Plus className="size-4" />
                New notification
              </Button>
            }
          />
        ) : (
          <NotificationList
            notifications={notifications}
            members={members}
            onEditNotification={handleEdit}
          />
        )}
      </div>

      <NotificationFormDialog
        organizationId={organizationId}
        members={members}
        notification={editingNotification}
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        onOpenChangeComplete={handleFormOpenChangeComplete}
      />
    </>
  );
}

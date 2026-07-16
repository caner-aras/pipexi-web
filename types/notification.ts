export interface Notification {
  id: string;
  organizationId: string;
  organizationMemberId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  scheduledTime: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateNotificationInput {
  organizationId: string;
  organizationMemberId: string;
  type: string;
  title: string;
  body: string;
  isRead?: boolean;
  scheduledTime?: string | null;
}

export interface UpdateNotificationInput {
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  scheduledTime: string | null;
  status: string;
}

export const NOTIFICATION_TYPES = [
  "info",
  "alert",
  "reminder",
  "update",
  "system",
] as const;

export const NOTIFICATION_STATUSES = ["active", "inactive"] as const;

export function formatNotificationTypeLabel(type: string): string {
  if (!type) {
    return "Unknown";
  }

  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

export function formatNotificationStatusLabel(status: string): string {
  if (!status) {
    return "Unknown";
  }

  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

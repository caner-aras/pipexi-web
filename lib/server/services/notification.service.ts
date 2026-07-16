import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type {
  CreateNotificationInput,
  Notification,
  UpdateNotificationInput,
} from "@/types/notification";

export async function listNotifications(
  organizationId: string
): Promise<Notification[]> {
  const query = new URLSearchParams({ organizationId });
  return backendFetch<Notification[]>(`/notifications?${query.toString()}`);
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<Notification> {
  return backendFetch<Notification>("/notifications", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateNotification(
  notificationId: string,
  input: UpdateNotificationInput
): Promise<Notification> {
  return backendFetch<Notification>(`/notifications/${notificationId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await backendFetch<unknown>(`/notifications/${notificationId}`, {
    method: "DELETE",
  });
}

import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type {
  Announcement,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from "@/types/announcement";

export async function listAnnouncements(
  organizationId: string
): Promise<Announcement[]> {
  const query = new URLSearchParams({ organizationId });
  return backendFetch<Announcement[]>(`/announcements?${query.toString()}`);
}

export async function createAnnouncement(
  input: CreateAnnouncementInput
): Promise<Announcement> {
  return backendFetch<Announcement>("/announcements", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAnnouncement(
  announcementId: string,
  input: UpdateAnnouncementInput
): Promise<Announcement> {
  return backendFetch<Announcement>(`/announcements/${announcementId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteAnnouncement(announcementId: string): Promise<void> {
  await backendFetch<unknown>(`/announcements/${announcementId}`, {
    method: "DELETE",
  });
}

import { formatRecordStatusLabel } from "@/lib/record-status";

export type AnnouncementAudienceType =
  | "all"
  | "location"
  | "role"
  | "member"
  | "team"
  | string;

export interface Announcement {
  id: string;
  organizationId: string;
  title: string;
  body: string;
  audienceType: AnnouncementAudienceType;
  audienceId: string | null;
  publishedAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateAnnouncementInput {
  organizationId: string;
  title: string;
  body: string;
  audienceType: string;
  audienceId: string | null;
  publishedAt: string | null;
}

export interface UpdateAnnouncementInput {
  title: string;
  body: string;
  audienceType: string;
  audienceId: string | null;
  publishedAt: string | null;
  status: string;
}

export const ANNOUNCEMENT_AUDIENCE_TYPES = [
  "all",
  "location",
  "role",
  "member",
  "team",
] as const;

export const ANNOUNCEMENT_STATUSES = ["active", "inactive", "draft"] as const;

export function formatAnnouncementAudienceLabel(
  audienceType: AnnouncementAudienceType
): string {
  switch (audienceType) {
    case "all":
      return "Everyone";
    case "location":
      return "Location";
    case "role":
      return "Role";
    case "member":
      return "Member";
    case "team":
      return "Team";
    default:
      if (!audienceType) {
        return "Unknown";
      }

      return (
        audienceType.charAt(0).toUpperCase() + audienceType.slice(1).toLowerCase()
      );
  }
}

export function formatAnnouncementStatusLabel(status: string): string {
  return formatRecordStatusLabel(status);
}

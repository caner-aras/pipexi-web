import {
  buildRecordStatusFilterOptions,
  getRecordStatusBadgeVariant,
  matchesRecordStatusFilter,
} from "@/lib/record-status";
import type { OrganizationFile } from "@/types/organization-file";

export const getOrganizationFileStatusBadgeVariant =
  getRecordStatusBadgeVariant;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatOrganizationFileDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function matchesOrganizationFileSearch(
  file: OrganizationFile,
  query: string,
  statusFilter: string
): boolean {
  if (!matchesRecordStatusFilter(file.status, statusFilter)) {
    return false;
  }

  const search = query.trim().toLowerCase();

  if (!search) {
    return true;
  }

  const fileName = file.fileName.toLowerCase();
  const contentType = file.contentType.toLowerCase();
  const storagePath = file.storagePath.toLowerCase();

  return (
    fileName.includes(search) ||
    contentType.includes(search) ||
    storagePath.includes(search)
  );
}

export function getOrganizationFileStatusFilterOptions(
  files: OrganizationFile[]
) {
  return buildRecordStatusFilterOptions(files.map((file) => file.status));
}

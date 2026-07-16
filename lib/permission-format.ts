import {
  buildRecordStatusFilterOptions,
  getRecordStatusBadgeVariant,
  matchesRecordStatusFilter,
} from "@/lib/record-status";
import type { Permission } from "@/types/permission";

export const getPermissionStatusBadgeVariant = getRecordStatusBadgeVariant;

export function formatPermissionDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function matchesPermissionSearch(
  permission: Permission,
  query: string,
  statusFilter: string
): boolean {
  if (!matchesRecordStatusFilter(permission.status, statusFilter)) {
    return false;
  }

  const search = query.trim().toLowerCase();

  if (!search) {
    return true;
  }

  return permission.key.toLowerCase().includes(search);
}

export function getPermissionStatusFilterOptions(permissions: Permission[]) {
  return buildRecordStatusFilterOptions(
    permissions.map((permission) => permission.status)
  );
}

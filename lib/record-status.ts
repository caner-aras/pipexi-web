import type { LucideIcon } from "lucide-react";
import {
  Archive,
  Ban,
  CheckCircle2,
  CircleCheck,
  CircleDashed,
  CircleOff,
  Clock,
  FilePenLine,
  HelpCircle,
  Trash2,
  XCircle,
} from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import type { badgeVariants } from "@/components/ui/badge";

export type RecordStatusBadgeVariant = VariantProps<
  typeof badgeVariants
>["variant"];

export interface RecordStatusMeta {
  value: string;
  label: string;
  icon: LucideIcon;
  className: string;
  badgeVariant: RecordStatusBadgeVariant;
}

export const RECORD_STATUS_VALUES = [
  "active",
  "inactive",
  "pending",
  "suspended",
  "draft",
  "archived",
  "cancelled",
  "deleted",
  "approved",
  "rejected",
  "submitted",
  "completed",
] as const;

export type RecordStatusValue = (typeof RECORD_STATUS_VALUES)[number];

const RECORD_STATUS_META: Record<RecordStatusValue, RecordStatusMeta> = {
  active: {
    value: "active",
    label: "Active",
    icon: CheckCircle2,
    className: "text-emerald-600 dark:text-emerald-400",
    badgeVariant: "default",
  },
  inactive: {
    value: "inactive",
    label: "Inactive",
    icon: CircleOff,
    className: "text-muted-foreground",
    badgeVariant: "destructive",
  },
  pending: {
    value: "pending",
    label: "Pending",
    icon: Clock,
    className: "text-amber-600 dark:text-amber-400",
    badgeVariant: "outline",
  },
  suspended: {
    value: "suspended",
    label: "Suspended",
    icon: Ban,
    className: "text-destructive",
    badgeVariant: "destructive",
  },
  draft: {
    value: "draft",
    label: "Draft",
    icon: FilePenLine,
    className: "text-muted-foreground",
    badgeVariant: "outline",
  },
  archived: {
    value: "archived",
    label: "Archived",
    icon: Archive,
    className: "text-muted-foreground",
    badgeVariant: "destructive",
  },
  cancelled: {
    value: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    className: "text-destructive",
    badgeVariant: "destructive",
  },
  deleted: {
    value: "deleted",
    label: "Deleted",
    icon: Trash2,
    className: "text-destructive",
    badgeVariant: "destructive",
  },
  approved: {
    value: "approved",
    label: "Approved",
    icon: CheckCircle2,
    className: "text-emerald-600 dark:text-emerald-400",
    badgeVariant: "default",
  },
  rejected: {
    value: "rejected",
    label: "Rejected",
    icon: XCircle,
    className: "text-destructive",
    badgeVariant: "destructive",
  },
  submitted: {
    value: "submitted",
    label: "Submitted",
    icon: CircleDashed,
    className: "text-sky-600 dark:text-sky-400",
    badgeVariant: "default",
  },
  completed: {
    value: "completed",
    label: "Completed",
    icon: CircleCheck,
    className: "text-sky-600 dark:text-sky-400",
    badgeVariant: "default",
  },
};

const UNKNOWN_STATUS_META: RecordStatusMeta = {
  value: "unknown",
  label: "Unknown",
  icon: HelpCircle,
  className: "text-muted-foreground",
  badgeVariant: "secondary",
};

/** Common editable status set for organizations, teams, members, locations. */
export const ENTITY_STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  RECORD_STATUS_META.active,
  RECORD_STATUS_META.inactive,
  RECORD_STATUS_META.pending,
  RECORD_STATUS_META.suspended,
].map(({ value, label }) => ({ value, label }));

export const SHIFT_STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  RECORD_STATUS_META.active,
  RECORD_STATUS_META.draft,
  RECORD_STATUS_META.pending,
  RECORD_STATUS_META.cancelled,
].map(({ value, label }) => ({ value, label }));

export const TIME_ENTRY_STATUS_OPTIONS: Array<{ value: string; label: string }> =
  [
    RECORD_STATUS_META.active,
    RECORD_STATUS_META.pending,
    RECORD_STATUS_META.approved,
    RECORD_STATUS_META.rejected,
  ].map(({ value, label }) => ({ value, label }));

export function normalizeRecordStatus(status: string): string {
  return status.trim().toLowerCase();
}

export function isRecordStatusValue(
  status: string
): status is RecordStatusValue {
  return RECORD_STATUS_VALUES.includes(
    normalizeRecordStatus(status) as RecordStatusValue
  );
}

export function getRecordStatusMeta(status: string): RecordStatusMeta {
  const normalized = normalizeRecordStatus(status);

  if (isRecordStatusValue(normalized)) {
    return RECORD_STATUS_META[normalized];
  }

  return {
    ...UNKNOWN_STATUS_META,
    value: normalized || "unknown",
    label: formatRecordStatusLabel(status),
  };
}

export function formatRecordStatusLabel(status: string): string {
  const normalized = normalizeRecordStatus(status);

  if (!normalized) {
    return "Unknown";
  }

  if (isRecordStatusValue(normalized)) {
    return RECORD_STATUS_META[normalized].label;
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function getRecordStatusBadgeVariant(
  status: string
): RecordStatusBadgeVariant {
  return getRecordStatusMeta(status).badgeVariant;
}

export function getRecordStatusOptions(
  values: readonly string[]
): Array<{ value: string; label: string }> {
  return values.map((value) => ({
    value: normalizeRecordStatus(value),
    label: formatRecordStatusLabel(value),
  }));
}

export function buildRecordStatusFilterOptions(statuses: string[]) {
  const unique = [
    ...new Set(statuses.map((status) => normalizeRecordStatus(status))),
  ]
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right));

  return [
    { value: "all", label: "All statuses" },
    ...unique.map((status) => ({
      value: status,
      label: formatRecordStatusLabel(status),
    })),
  ];
}

export function matchesRecordStatusFilter(
  status: string,
  statusFilter: string
): boolean {
  if (statusFilter === "all") {
    return true;
  }

  return normalizeRecordStatus(status) === normalizeRecordStatus(statusFilter);
}

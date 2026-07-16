import { getRecordStatusBadgeVariant } from "@/lib/record-status";
import type { FormTemplateField } from "@/types/form-template";

export const getFormTemplateStatusBadgeVariant = getRecordStatusBadgeVariant;

export function formatFormTemplateDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatFormTemplateDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatFieldTypeLabel(type: string): string {
  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function parseFieldOptions(optionsJson: string | null): string[] {
  if (!optionsJson) {
    return [];
  }

  try {
    const parsed = JSON.parse(optionsJson) as { options?: string[] };
    return parsed.options ?? [];
  } catch {
    return [];
  }
}

export function sortFormTemplateFields(
  fields: FormTemplateField[]
): FormTemplateField[] {
  return [...fields].sort((left, right) => left.sortOrder - right.sortOrder);
}

export const FORM_TEMPLATE_FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "single_select", label: "Single select" },
] as const;

export function fieldTypeRequiresOptions(type: string): boolean {
  return type === "single_select" || type === "multi_select";
}

export function buildFieldOptionsJson(optionsText: string): string | null {
  const options = optionsText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (options.length === 0) {
    return null;
  }

  return JSON.stringify({ options });
}

export function formatFieldOptionsText(optionsJson: string | null): string {
  return parseFieldOptions(optionsJson).join("\n");
}

export function getNextFieldSortOrder(fields: FormTemplateField[]): number {
  if (fields.length === 0) {
    return 0;
  }

  return Math.max(...fields.map((field) => field.sortOrder)) + 1;
}

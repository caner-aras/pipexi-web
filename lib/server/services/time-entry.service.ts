import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type {
  CreateTimeEntryInput,
  TimeEntry,
  TimeEntryBreak,
  UpdateTimeEntryBreakInput,
  UpdateTimeEntryInput,
} from "@/types/time-entry";

export async function createOrganizationTimeEntry(
  organizationId: string,
  input: CreateTimeEntryInput
): Promise<TimeEntry> {
  return backendFetch<TimeEntry>(
    `/organizations/${organizationId}/time-entries`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function updateTimeEntry(
  timeEntryId: string,
  input: UpdateTimeEntryInput
): Promise<TimeEntry> {
  return backendFetch<TimeEntry>(`/time-entries/${timeEntryId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteTimeEntry(timeEntryId: string): Promise<boolean> {
  return backendFetch<boolean>(`/time-entries/${timeEntryId}`, {
    method: "DELETE",
  });
}

export async function updateTimeEntryBreak(
  breakId: string,
  input: UpdateTimeEntryBreakInput
): Promise<TimeEntryBreak> {
  return backendFetch<TimeEntryBreak>(`/time-entries/breaks/${breakId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteTimeEntryBreak(
  breakId: string
): Promise<boolean> {
  return backendFetch<boolean>(`/time-entries/breaks/${breakId}`, {
    method: "DELETE",
  });
}

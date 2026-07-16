import "server-only";

import { hydrateShift, hydrateShifts, normalizeShiftDetail } from "@/lib/shifts";
import { backendFetch } from "@/lib/server/api-client";
import { getOrganizationLocations } from "@/lib/server/services/organization.service";
import type {
  CreateShiftInput,
  OrganizationShiftsData,
  OrganizationShiftsPayload,
  Shift,
  ShiftApi,
  ShiftBreak,
  ShiftDetailApi,
  UpdateShiftBreakInput,
  UpdateShiftInput,
} from "@/types/shift";
import type { ShiftFormTemplate } from "@/types/shift-form-template";

export async function getOrganizationShiftsData(
  organizationId: string,
  fromDate: string
): Promise<OrganizationShiftsData> {
  const query = new URLSearchParams({ fromDate });
  const payload = await backendFetch<OrganizationShiftsPayload>(
    `/organizations/${organizationId}/shifts?${query.toString()}`
  );

  return {
    locations: payload.locations,
    shifts: hydrateShifts(payload.shifts, payload.locations),
  };
}

export async function getOrganizationShifts(
  organizationId: string,
  fromDate: string
): Promise<Shift[]> {
  const data = await getOrganizationShiftsData(organizationId, fromDate);
  return data.shifts;
}

export async function createOrganizationShift(
  organizationId: string,
  input: CreateShiftInput
): Promise<Shift> {
  const shiftApi = await backendFetch<ShiftApi>(
    `/organizations/${organizationId}/shifts`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );

  const locations = await getOrganizationLocations(organizationId);
  const locationsById = new Map(
    locations.map((location) => [location.id, location])
  );

  return hydrateShift(shiftApi, locationsById);
}

export async function updateShift(
  shiftId: string,
  input: UpdateShiftInput
): Promise<Shift> {
  const shiftDetail = await backendFetch<ShiftDetailApi>(`/shifts/${shiftId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });

  return normalizeShiftDetail(shiftDetail);
}

export async function deleteShift(shiftId: string): Promise<boolean> {
  return backendFetch<boolean>(`/shifts/${shiftId}`, {
    method: "DELETE",
  });
}

export async function updateShiftBreak(
  breakId: string,
  input: UpdateShiftBreakInput
): Promise<ShiftBreak> {
  return backendFetch<ShiftBreak>(`/shifts/breaks/${breakId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteShiftBreak(breakId: string): Promise<boolean> {
  return backendFetch<boolean>(`/shifts/breaks/${breakId}`, {
    method: "DELETE",
  });
}

export async function getShiftFormTemplates(
  organizationId: string,
  shiftId: string
): Promise<ShiftFormTemplate[]> {
  return backendFetch<ShiftFormTemplate[]>(
    `/organizations/${organizationId}/shifts/${shiftId}/form-templates`
  );
}

export async function getShiftById(shiftId: string): Promise<Shift> {
  const shiftDetail = await backendFetch<ShiftDetailApi>(`/shifts/${shiftId}`);
  return normalizeShiftDetail(shiftDetail);
}

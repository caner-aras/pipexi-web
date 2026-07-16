import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type {
  LocationWorkingHour,
  SetLocationWorkingHoursInput,
} from "@/types/location-working-hour";

export async function getLocationWorkingHours(
  organizationId: string,
  locationId: string
): Promise<LocationWorkingHour[]> {
  return backendFetch<LocationWorkingHour[]>(
    `/organizations/${organizationId}/locations/${locationId}/working-hours`
  );
}

export async function setLocationWorkingHours(
  organizationId: string,
  locationId: string,
  input: SetLocationWorkingHoursInput
): Promise<LocationWorkingHour[]> {
  return backendFetch<LocationWorkingHour[]>(
    `/organizations/${organizationId}/locations/${locationId}/working-hours`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    }
  );
}

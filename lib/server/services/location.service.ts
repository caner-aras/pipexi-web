import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type { Location, UpdateLocationInput } from "@/types/location";

export async function updateLocation(
  locationId: string,
  input: UpdateLocationInput
): Promise<Location> {
  return backendFetch<Location>(`/locations/${locationId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteLocation(locationId: string): Promise<boolean> {
  return backendFetch<boolean>(`/locations/${locationId}`, {
    method: "DELETE",
  });
}

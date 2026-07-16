import type { Location } from "@/types/location";
import type { Shift, ShiftApi, ShiftDetailApi } from "@/types/shift";

export function createFallbackLocation(
  shift: ShiftApi,
  locationId: string
): Location {
  return {
    id: locationId,
    organizationId: shift.organizationId,
    name: "Unknown location",
    address: "",
    latitude: 0,
    longitude: 0,
    geofenceRadiusMeters: 0,
    timezone: "UTC",
    status: "active",
    createdAt: shift.createdAt,
    updatedAt: null,
  };
}

export function hydrateShift(
  shift: ShiftApi,
  locationsById: Map<string, Location>
): Shift {
  const location =
    locationsById.get(shift.locationId) ??
    createFallbackLocation(shift, shift.locationId);

  return {
    ...shift,
    timeEntries: shift.timeEntries ?? [],
    location,
  };
}

export function hydrateShifts(
  shifts: ShiftApi[],
  locations: Location[]
): Shift[] {
  const locationsById = new Map(
    locations.map((location) => [location.id, location])
  );

  return shifts.map((shift) => hydrateShift(shift, locationsById));
}

export function normalizeShiftDetail(shift: ShiftDetailApi): Shift {
  const locationId = shift.locationId ?? shift.location.id;

  return {
    ...shift,
    locationId,
    location: shift.location,
    breaks: shift.breaks ?? [],
    timeEntries: shift.timeEntries ?? [],
    shiftFormTemplates: shift.shiftFormTemplates ?? [],
  };
}

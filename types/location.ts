import type { LocationWorkingHour } from "@/types/location-working-hour";

export interface Location {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  timezone: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  workingHours?: LocationWorkingHour[];
}

export interface CreateLocationInput {
  organizationId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  timezone: string;
}

export interface UpdateLocationInput {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  timezone: string;
}

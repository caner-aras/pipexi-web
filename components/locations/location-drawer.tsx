"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { TimezonePicker } from "@/components/organizations/timezone-picker";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Location } from "@/types/location";

type LocationDefaults = Pick<
  Location,
  | "name"
  | "address"
  | "latitude"
  | "longitude"
  | "geofenceRadiusMeters"
  | "timezone"
>;

interface LocationFormProps {
  organizationId: string;
  location: Location | null;
  defaults?: LocationDefaults | null;
  defaultTimezone: string;
  onCancel: () => void;
  onSaved: () => void;
}

function LocationForm({
  organizationId,
  location,
  defaults = null,
  defaultTimezone,
  onCancel,
  onSaved,
}: LocationFormProps) {
  const router = useRouter();
  const isEditing = Boolean(location);

  const [name, setName] = useState(location?.name ?? defaults?.name ?? "");
  const [address, setAddress] = useState(
    location?.address ?? defaults?.address ?? ""
  );
  const [latitude, setLatitude] = useState(
    location
      ? String(location.latitude)
      : defaults
        ? String(defaults.latitude)
        : ""
  );
  const [longitude, setLongitude] = useState(
    location
      ? String(location.longitude)
      : defaults
        ? String(defaults.longitude)
        : ""
  );
  const [geofenceRadiusMeters, setGeofenceRadiusMeters] = useState(
    location
      ? String(location.geofenceRadiusMeters)
      : defaults
        ? String(defaults.geofenceRadiusMeters)
        : "100"
  );
  const [timezone, setTimezone] = useState<string | null>(
    location?.timezone ?? defaults?.timezone ?? defaultTimezone
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!timezone) {
      return;
    }

    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);
    const parsedGeofence = Number(geofenceRadiusMeters);

    if (
      Number.isNaN(parsedLatitude) ||
      Number.isNaN(parsedLongitude) ||
      Number.isNaN(parsedGeofence)
    ) {
      setError("Latitude, longitude, and geofence must be valid numbers.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: name.trim(),
      address: address.trim(),
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      geofenceRadiusMeters: parsedGeofence,
      timezone,
    };

    try {
      const response = await fetch(
        isEditing
          ? `/api/locations/${location!.id}`
          : `/api/organizations/${organizationId}/locations`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isEditing ? payload : { ...payload, organizationId }
          ),
        }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message =
          body.message ??
          (isEditing ? "Failed to update location." : "Failed to create location.");
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(
        isEditing ? "Location updated successfully" : "Location created successfully"
      );
      onSaved();
      router.refresh();
    } catch {
      const message = isEditing
        ? "Failed to update location."
        : "Failed to create location.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isValid =
    Boolean(name.trim()) &&
    Boolean(address.trim()) &&
    Boolean(timezone) &&
    latitude.trim().length > 0 &&
    longitude.trim().length > 0 &&
    geofenceRadiusMeters.trim().length > 0;

  return (
    <>
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location-name">Name</Label>
            <Input
              id="location-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSubmitting}
              placeholder="High Office"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location-address">Address</Label>
            <Input
              id="location-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              disabled={isSubmitting}
              placeholder="Street, city, country"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location-latitude">Latitude</Label>
              <Input
                id="location-latitude"
                type="number"
                step="any"
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
                disabled={isSubmitting}
                placeholder="39.533115"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location-longitude">Longitude</Label>
              <Input
                id="location-longitude"
                type="number"
                step="any"
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
                disabled={isSubmitting}
                placeholder="32.607277"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location-geofence">Geofence radius (meters)</Label>
            <Input
              id="location-geofence"
              type="number"
              min="0"
              step="1"
              value={geofenceRadiusMeters}
              onChange={(event) => setGeofenceRadiusMeters(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <TimezonePicker
              className="w-full"
              value={timezone}
              onValueChange={setTimezone}
              disabled={isSubmitting}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </div>

      <DrawerFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting || !isValid}>
          {isSubmitting
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
              ? "Save changes"
              : "Create location"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </DrawerFooter>
    </>
  );
}

interface LocationDrawerProps {
  organizationId: string;
  location: Location | null;
  defaults?: LocationDefaults | null;
  defaultTimezone: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationDrawer({
  organizationId,
  location,
  defaults = null,
  defaultTimezone,
  open,
  onOpenChange,
}: LocationDrawerProps) {
  const isEditing = Boolean(location);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>
            {isEditing
              ? "Edit location"
              : defaults
                ? "Duplicate location"
                : "New location"}
          </DrawerTitle>
          <DrawerDescription>
            {isEditing
              ? `Update ${location?.name} details.`
              : defaults
                ? "Create a copy of this location."
                : "Add a new location for this organization."}
          </DrawerDescription>
        </DrawerHeader>

        <LocationForm
          key={
            location?.id ??
            (defaults ? `duplicate-${defaults.name}` : "new")
          }
          organizationId={organizationId}
          location={location}
          defaults={defaults}
          defaultTimezone={defaultTimezone}
          onCancel={() => onOpenChange(false)}
          onSaved={() => onOpenChange(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}

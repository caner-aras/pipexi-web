"use client";

import { Plus, MapPin } from "lucide-react";
import { useState } from "react";

import { LocationDrawer } from "@/components/locations/location-drawer";
import { LocationWorkingHoursDialog } from "@/components/locations/location-working-hours-dialog";
import { LocationList } from "@/components/locations/location-list";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Location } from "@/types/location";

interface LocationsPageContentProps {
  organizationId: string;
  organizationName: string | null;
  organizationTimezone: string;
  locations: Location[];
  error: string | null;
}

export function LocationsPageContent({
  organizationId,
  organizationName,
  organizationTimezone,
  locations,
  error,
}: LocationsPageContentProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [createDefaults, setCreateDefaults] = useState<Pick<
    Location,
    | "name"
    | "address"
    | "latitude"
    | "longitude"
    | "geofenceRadiusMeters"
    | "timezone"
  > | null>(null);
  const [workingHoursOpen, setWorkingHoursOpen] = useState(false);
  const [workingHoursLocation, setWorkingHoursLocation] =
    useState<Location | null>(null);

  function handleAddLocation() {
    setEditingLocation(null);
    setCreateDefaults(null);
    setDrawerOpen(true);
  }

  function handleEditLocation(location: Location) {
    setCreateDefaults(null);
    setEditingLocation(location);
    setDrawerOpen(true);
  }

  function handleDuplicateLocation(location: Location) {
    setEditingLocation(null);
    setCreateDefaults({
      name: `${location.name} Copy`,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      geofenceRadiusMeters: location.geofenceRadiusMeters,
      timezone: location.timezone,
    });
    setDrawerOpen(true);
  }

  function handleManageWorkingHours(location: Location) {
    setWorkingHoursLocation(location);
    setWorkingHoursOpen(true);
  }

  function handleWorkingHoursOpenChange(open: boolean) {
    setWorkingHoursOpen(open);
  }

  function handleDrawerOpenChange(open: boolean) {
    setDrawerOpen(open);

    if (!open) {
      setEditingLocation(null);
      setCreateDefaults(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Locations"
        description={
          organizationName
            ? `Locations for ${organizationName}.`
            : "Organization locations and addresses."
        }
        actions={
          <Button size="sm" onClick={handleAddLocation}>
            <Plus className="size-4" />
            New location
          </Button>
        }
      />

      <div className="w-full">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : locations.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No locations found"
            description="Create your first location to get started."
            action={
              <Button size="sm" onClick={handleAddLocation}>
                <Plus className="size-4" />
                New location
              </Button>
            }
          />
        ) : (
          <LocationList
            locations={locations}
            onEditLocation={handleEditLocation}
            onDuplicateLocation={handleDuplicateLocation}
            onManageWorkingHours={handleManageWorkingHours}
          />
        )}
      </div>

      <LocationDrawer
        organizationId={organizationId}
        location={editingLocation}
        defaults={createDefaults}
        defaultTimezone={organizationTimezone}
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
      />

      <LocationWorkingHoursDialog
        organizationId={organizationId}
        location={workingHoursLocation}
        open={workingHoursOpen}
        onOpenChange={handleWorkingHoursOpenChange}
      />
    </>
  );
}

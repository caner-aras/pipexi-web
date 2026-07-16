"use client";

import { useState } from "react";
import {
  AlertCircle,
  Building2,
  Globe2,
  MapPin,
  Radar,
} from "lucide-react";

import { useOrganization } from "@/components/layout/organization-provider";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { getOrganizationTimezoneLabel } from "@/lib/organization-timezones";
import { cn } from "@/lib/utils";
import type { Location } from "@/types/location";

interface OrganizationSwitcherProps {
  error?: string | null;
}

function getLocationsSummary(locations: Location[]) {
  return {
    activeCount: locations.filter(
      (location) => location.status.toLowerCase() === "active"
    ).length,
    inactiveCount: locations.filter((location) =>
      ["inactive", "suspended"].includes(location.status.toLowerCase())
    ).length,
  };
}

function SummaryStat({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "danger";
}) {
  return (
    <span
      className={cn(
        "text-xs",
        tone === "danger"
          ? "font-medium text-destructive"
          : "text-muted-foreground"
      )}
    >
      {label}
    </span>
  );
}

function LocationsDrawerSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-sm bg-muted/30 p-4">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

function LocationCard({ location }: { location: Location }) {
  return (
    <article className="space-y-3 rounded-sm bg-muted p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-sm bg-background text-muted-foreground">
          <MapPin className="size-3.5" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
            <h4 className="truncate text-sm font-semibold">{location.name}</h4>
            <StatusIndicator status={location.status} />
          </div>

          {location.address ? (
            <p className="text-sm leading-relaxed text-foreground/90">
              {location.address}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Globe2 className="size-3.5 shrink-0" />
              {getOrganizationTimezoneLabel(location.timezone)}
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Radar className="size-3.5 shrink-0" />
              {location.geofenceRadiusMeters}m geofence
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function OrganizationSwitcher({ error }: OrganizationSwitcherProps) {
  const {
    organizations,
    selectedOrganization,
    setSelectedOrganizationId,
    isUpdating,
  } = useOrganization();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  async function handleViewLocations() {
    if (!selectedOrganization) {
      return;
    }

    setDrawerOpen(true);
    setIsLoadingLocations(true);
    setLocationsError(null);
    setLocations([]);

    try {
      const response = await fetch(
        `/api/organizations/${selectedOrganization.id}/locations`
      );
      const body = (await response.json()) as {
        data?: Location[];
        message?: string;
      };

      if (!response.ok) {
        setLocationsError(body.message ?? "Failed to load locations");
        return;
      }

      setLocations(body.data ?? []);
    } catch {
      setLocationsError("Failed to load locations");
    } finally {
      setIsLoadingLocations(false);
    }
  }

  if (error) {
    return (
      <span className="text-sm text-destructive">
        Failed to load organizations
      </span>
    );
  }

  if (organizations.length === 0) {
    return (
      <span className="text-sm text-muted-foreground">No organizations</span>
    );
  }

  const summary = getLocationsSummary(locations);

  return (
    <>
      <div className="flex items-center gap-2">
        <Select
          items={organizations.map((organization) => ({
            value: organization.id,
            label: organization.name,
          }))}
          value={selectedOrganization?.id ?? null}
          disabled={isUpdating}
          onValueChange={(value) => {
            if (value) {
              void setSelectedOrganizationId(value);
            }
          }}
        >
          <SelectTrigger size="default" className="min-w-[300px]">
            <Building2 className="size-4 text-muted-foreground" />
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent align="start">
            {organizations.map((organization) => (
              <SelectItem key={organization.id} value={organization.id}>
                <div className="flex flex-col gap-1 p-1">
                  <span className="text-sm font-medium">
                    {organization.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {organization.slug}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="default"
          onClick={handleViewLocations}
          disabled={!selectedOrganization}
          title="View locations"
        >
          <MapPin className="size-4" />
          <span className="sr-only">View locations</span>
        </Button>
      </div>

      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        swipeDirection="right"
      >
        <DrawerContent className="sm:max-w-md">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              {selectedOrganization?.name ?? "Locations"}
            </DrawerTitle>
            <DrawerDescription>
              {locations.length}{" "}
              {locations.length === 1 ? "location" : "locations"}
            </DrawerDescription>

            {!isLoadingLocations &&
            !locationsError &&
            locations.length > 0 ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                <SummaryStat label={`${summary.activeCount} active`} />
                {summary.inactiveCount > 0 ? (
                  <SummaryStat
                    label={`${summary.inactiveCount} inactive`}
                    tone="danger"
                  />
                ) : null}
              </div>
            ) : null}
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-2">
            {isLoadingLocations ? (
              <LocationsDrawerSkeleton />
            ) : locationsError ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <AlertCircle className="size-8 text-destructive/70" />
                <p className="max-w-xs text-sm text-destructive">
                  {locationsError}
                </p>
              </div>
            ) : locations.length === 0 ? (
              <EmptyState
                icon={MapPin}
                title="No locations"
                description="Locations will appear here when available."
              />
            ) : (
              <div className="space-y-3">
                {locations.map((location) => (
                  <LocationCard key={location.id} location={location} />
                ))}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

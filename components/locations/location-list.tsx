"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, MoreHorizontalIcon, Search } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrganizationTimezoneLabel } from "@/lib/organization-timezones";
import {
  buildRecordStatusFilterOptions,
  matchesRecordStatusFilter,
} from "@/lib/record-status";
import type { Location } from "@/types/location";

function matchesLocationSearch(
  location: Location,
  query: string,
  statusFilter: string
): boolean {
  if (!matchesRecordStatusFilter(location.status, statusFilter)) {
    return false;
  }

  const search = query.trim().toLowerCase();

  if (!search) {
    return true;
  }

  const name = location.name.toLowerCase();
  const address = location.address.toLowerCase();
  const timezone = location.timezone.toLowerCase();
  const timezoneLabel = getOrganizationTimezoneLabel(location.timezone).toLowerCase();

  return (
    name.includes(search) ||
    address.includes(search) ||
    timezone.includes(search) ||
    timezoneLabel.includes(search)
  );
}

function formatCoordinates(location: Location): string {
  return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
}

interface LocationListProps {
  locations: Location[];
  onEditLocation?: (location: Location) => void;
  onDuplicateLocation?: (location: Location) => void;
  onManageWorkingHours?: (location: Location) => void;
}

export function LocationList({
  locations,
  onEditLocation,
  onDuplicateLocation,
  onManageWorkingHours,
}: LocationListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationToRemove, setLocationToRemove] = useState<Location | null>(
    null
  );
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const statusFilterOptions = useMemo(
    () =>
      buildRecordStatusFilterOptions(
        locations.map((location) => location.status)
      ),
    [locations]
  );

  const filteredLocations = useMemo(
    () =>
      locations.filter((location) =>
        matchesLocationSearch(location, searchQuery, statusFilter)
      ),
    [locations, searchQuery, statusFilter]
  );

  function handleOpenRemove(location: Location) {
    setLocationToRemove(location);
    setRemoveDialogOpen(true);
  }

  function handleRemoveDialogOpenChange(open: boolean) {
    setRemoveDialogOpen(open);

    if (!open) {
      setLocationToRemove(null);
    }
  }

  async function handleConfirmRemove() {
    if (!locationToRemove) {
      return;
    }

    setIsRemoving(true);

    try {
      const response = await fetch(`/api/locations/${locationToRemove.id}`, {
        method: "DELETE",
      });

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        toast.error(body.message ?? "Failed to delete location");
        return;
      }

      toast.success("Location deleted successfully");
      setRemoveDialogOpen(false);
      setLocationToRemove(null);
      router.refresh();
    } catch {
      toast.error("Failed to delete location");
    } finally {
      setIsRemoving(false);
    }
  }

  if (locations.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="No locations found"
        description="Locations will appear here once they are added."
      />
    );
  }

  return (
    <>
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name, address, or timezone..."
              className="h-8 pl-8"
            />
          </div>

          <Select
            items={statusFilterOptions}
            value={statusFilter}
            onValueChange={(value) => {
              if (value) {
                setStatusFilter(value);
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-44" size="default">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {statusFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground">
          {filteredLocations.length} of {locations.length} location
          {locations.length === 1 ? "" : "s"}
        </p>
      </div>

      {filteredLocations.length === 0 ? (
        <EmptyState title="No locations match your search" filtered />
      ) : (
        <div className="overflow-hidden rounded-sm border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-56">Name</TableHead>
                <TableHead className="w-40">Address</TableHead>
                <TableHead className="w-36">Timezone</TableHead>
                <TableHead className="w-32">Geofence</TableHead>
                <TableHead className="w-24">Coordinates</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="text-right w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium w-40">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 shrink-0 text-muted-foreground" />
                      {location.name}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs text-muted-foreground w-56">
                    <span className="line-clamp-2">{location.address}</span>
                  </TableCell>
                  <TableCell className="w-36">
                    {getOrganizationTimezoneLabel(location.timezone)}
                  </TableCell>
                  <TableCell className="w-28">{location.geofenceRadiusMeters} m</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground w-40">
                    {formatCoordinates(location)}
                  </TableCell>
                  <TableCell className="w-32 text-center">
                    <StatusIndicator status={location.status} />
                  </TableCell>
                  <TableCell className="text-right w-24">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          />
                        }
                      >
                        <MoreHorizontalIcon />
                        <span className="sr-only">Open menu</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onManageWorkingHours?.(location)}
                        >
                          Working hours
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEditLocation?.(location)}
                        >
                          Edit location
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDuplicateLocation?.(location)}
                        >
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleOpenRemove(location)}
                        >
                          Delete location
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

        </div>
      )}

      <AlertDialog
        open={removeDialogOpen}
        onOpenChange={handleRemoveDialogOpenChange}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete location?</AlertDialogTitle>
            <AlertDialogDescription>
              {locationToRemove
                ? `This will permanently delete ${locationToRemove.name}. This action cannot be undone.`
                : "This will permanently delete the location. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmRemove()}
              disabled={isRemoving}
            >
              {isRemoving ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

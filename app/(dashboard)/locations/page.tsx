import { LocationsPageContent } from "@/components/locations/locations-page-content";
import { NoOrganizationEmptyState } from "@/components/layout/no-organization-empty-state";
import { BackendApiError } from "@/lib/server/api-client";
import {
  getOrganizationLocations,
  getOrganizations,
} from "@/lib/server/services/organization.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import type { Location } from "@/types/location";

export default async function LocationsPage() {
  let locations: Location[] = [];
  let error: string | null = null;
  let selectedOrganizationId: string | null = null;
  let selectedOrganizationName: string | null = null;
  let selectedOrganizationTimezone = "Europe/Istanbul";
  let noOrganization = false;

  try {
    const organizations = await getOrganizations();
    const selectedOrganization = await getSelectedOrganization(organizations);

    if (!selectedOrganization) {
      noOrganization = true;
    } else {
      selectedOrganizationId = selectedOrganization.id;
      selectedOrganizationName = selectedOrganization.name;
      selectedOrganizationTimezone = selectedOrganization.timezone;
      locations = await getOrganizationLocations(selectedOrganization.id);
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      error = err.message;
    } else {
      error = "Failed to load locations.";
    }
  }

  if (noOrganization) {
    return (
      <NoOrganizationEmptyState
        title="Locations"
        description="Select an organization to view its locations."
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      {selectedOrganizationId ? (
        <LocationsPageContent
          organizationId={selectedOrganizationId}
          organizationName={selectedOrganizationName}
          organizationTimezone={selectedOrganizationTimezone}
          locations={locations}
          error={error}
        />
      ) : null}
    </div>
  );
}

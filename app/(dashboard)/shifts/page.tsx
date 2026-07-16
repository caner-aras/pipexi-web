import { ShiftsPageContent } from "@/components/shifts/shifts-page-content";
import { NoOrganizationEmptyState } from "@/components/layout/no-organization-empty-state";
import { getTodayDateKeyUtc, toFromDateIso } from "@/lib/date-format";
import { BackendApiError } from "@/lib/server/api-client";
import { getOrganizations } from "@/lib/server/services/organization.service";
import { getOrganizationShiftsData } from "@/lib/server/services/shift.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import type { Location } from "@/types/location";
import type { Shift } from "@/types/shift";

export default async function ShiftsPage() {
  const initialFromDateKey = getTodayDateKeyUtc();
  let shifts: Shift[] = [];
  let locations: Location[] = [];
  let error: string | null = null;
  let selectedOrganizationName: string | null = null;
  let selectedOrganizationId: string | null = null;
  let noOrganization = false;

  try {
    const organizations = await getOrganizations();
    const selectedOrganization = await getSelectedOrganization(organizations);

    if (!selectedOrganization) {
      noOrganization = true;
    } else {
      selectedOrganizationId = selectedOrganization.id;
      selectedOrganizationName = selectedOrganization.name;

      const shiftsData = await getOrganizationShiftsData(
        selectedOrganization.id,
        toFromDateIso(initialFromDateKey)
      );

      shifts = shiftsData.shifts;
      locations = shiftsData.locations;
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      error = err.message;
    } else {
      error = "Failed to load shifts.";
    }
  }

  if (noOrganization) {
    return (
      <NoOrganizationEmptyState
        title="Shifts"
        description="Select an organization to view its shift schedule."
      />
    );
  }

  return (
    <div className="flex min-w-0 w-full flex-col gap-8 overflow-x-hidden p-6">
      {selectedOrganizationId ? (
        <ShiftsPageContent
          organizationId={selectedOrganizationId}
          organizationName={selectedOrganizationName}
          initialFromDateKey={initialFromDateKey}
          shifts={shifts}
          locations={locations}
          error={error}
        />
      ) : null}
    </div>
  );
}

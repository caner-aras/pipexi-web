import { NoOrganizationEmptyState } from "@/components/layout/no-organization-empty-state";
import { BackendApiError } from "@/lib/server/api-client";
import { getOrganizations } from "@/lib/server/services/organization.service";
import { getShiftFormsStatus } from "@/lib/server/services/report.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import type { ShiftFormsStatus } from "@/types/shift-forms-status";
import { ShiftFormsPageContent } from "@/components/shifts/shift-forms-page-content";

export default async function ShiftFormsPage() {
  let shiftForms: ShiftFormsStatus[] = [];
  let error: string | null = null;
  let selectedOrganizationId: string | null = null;
  let noOrganization = false;

  try {
    const organizations = await getOrganizations();
    const selectedOrganization = await getSelectedOrganization(organizations);

    if (!selectedOrganization) {
      noOrganization = true;
    } else {
      selectedOrganizationId = selectedOrganization.id;

      shiftForms = await getShiftFormsStatus(selectedOrganization.id, 30, 7);
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      error = err.message;
    } else {
      error = "Failed to load shift forms.";
    }
  }

  if (noOrganization) {
    return (
      <NoOrganizationEmptyState
        title="Shift Forms"
        description="Select an organization to view its shift forms."
      />
    );
  }

  return (
    <div className="flex min-w-0 w-full flex-col gap-8 overflow-x-hidden p-6">
      {selectedOrganizationId ? (
        <ShiftFormsPageContent
          organizationId={selectedOrganizationId}
          shiftForms={shiftForms}
          error={error}
        />
      ) : null}
    </div>
  );
}

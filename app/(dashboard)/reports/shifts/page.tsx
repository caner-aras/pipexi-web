import { ShiftReportContent } from "./shift-report-content";
import { NoOrganizationEmptyState } from "@/components/layout/no-organization-empty-state";
import { getOrganizations, getOrganizationMembers } from "@/lib/server/services/organization.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import { BackendApiError } from "@/lib/server/api-client";
import type { OrganizationMember } from "@/types/member";

export default async function ShiftReportPage() {
  let members: OrganizationMember[] = [];
  let noOrganization = false;

  try {
    const organizations = await getOrganizations();
    const selectedOrganization = await getSelectedOrganization(organizations);

    if (!selectedOrganization) {
      noOrganization = true;
    } else {
      members = await getOrganizationMembers(selectedOrganization.id);
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      // Just keep members empty
    }
  }

  if (noOrganization) {
    return (
      <NoOrganizationEmptyState
        title="Shift Report"
        description="Select an organization to view its shift reports."
      />
    );
  }

  return <ShiftReportContent members={members} />;
}

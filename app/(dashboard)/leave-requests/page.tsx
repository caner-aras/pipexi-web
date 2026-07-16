import { LeaveRequestsPageContent } from "@/components/leave-requests/leave-requests-page-content";
import { NoOrganizationEmptyState } from "@/components/layout/no-organization-empty-state";
import { BackendApiError } from "@/lib/server/api-client";
import { getOrganizations } from "@/lib/server/services/organization.service";
import { listLeaveRequests } from "@/lib/server/services/leave-request.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import type { LeaveRequest } from "@/types/leave-request";

export default async function LeaveRequestsPage() {
  let leaveRequests: LeaveRequest[] = [];
  let error: string | null = null;
  let selectedOrganizationId: string | null = null;
  let selectedOrganizationName: string | null = null;
  let noOrganization = false;

  try {
    const organizations = await getOrganizations();
    const selectedOrganization = await getSelectedOrganization(organizations);

    if (!selectedOrganization) {
      noOrganization = true;
    } else {
      selectedOrganizationId = selectedOrganization.id;
      selectedOrganizationName = selectedOrganization.name;
      leaveRequests = await listLeaveRequests(selectedOrganization.id);
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      error = err.message;
    } else {
      error = "Failed to load leave requests.";
    }
  }

  if (noOrganization) {
    return (
      <NoOrganizationEmptyState
        title="Leave Requests"
        description="Select an organization to view its leave requests."
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      {selectedOrganizationId ? (
        <LeaveRequestsPageContent
          organizationId={selectedOrganizationId}
          organizationName={selectedOrganizationName}
          leaveRequests={leaveRequests}
          error={error}
        />
      ) : null}
    </div>
  );
}

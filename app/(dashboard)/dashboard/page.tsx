import { DashboardPageContent } from "@/components/dashboard/dashboard-page-content";
import { NoOrganizationEmptyState } from "@/components/layout/no-organization-empty-state";
import { BackendApiError } from "@/lib/server/api-client";
import { getOrganizations } from "@/lib/server/services/organization.service";
import { getReportSummary } from "@/lib/server/services/report.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import { getPendingOrganizationDayOffs } from "@/lib/server/services/team-member.service";
import type { ReportSummary } from "@/types/report";
import type { PendingDayOff } from "@/types/team-member-day-off";

const DEFAULT_TREND_DAYS = 7;
const DEFAULT_FUTURE_DAYS = 7;

export default async function DashboardPage() {
  let summary: ReportSummary | null = null;
  let pendingDayOffs: PendingDayOff[] = [];
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
      
      const [fetchedSummary, fetchedPendingDayOffs] = await Promise.all([
        getReportSummary(
          selectedOrganization.id,
          DEFAULT_TREND_DAYS,
          DEFAULT_FUTURE_DAYS
        ),
        getPendingOrganizationDayOffs(selectedOrganization.id),
      ]);

      summary = fetchedSummary;
      pendingDayOffs = fetchedPendingDayOffs;
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      error = err.message;
    } else {
      error = "Failed to load dashboard report.";
    }
  }

  if (noOrganization) {
    return (
      <NoOrganizationEmptyState
        title="Overview"
        description="Select an organization to view its dashboard report."
      />
    );
  }

  return (
    <div className="flex min-w-0 w-full flex-col gap-8 overflow-x-hidden p-6">
      {selectedOrganizationId ? (
        <DashboardPageContent
          organizationId={selectedOrganizationId}
          organizationName={selectedOrganizationName}
          initialTrendDays={DEFAULT_TREND_DAYS}
          initialFutureDays={DEFAULT_FUTURE_DAYS}
          summary={summary}
          pendingDayOffs={pendingDayOffs}
          error={error}
        />
      ) : null}
    </div>
  );
}

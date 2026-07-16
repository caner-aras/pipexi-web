import { DashboardPageContent } from "@/components/dashboard/dashboard-page-content";
import { NoOrganizationEmptyState } from "@/components/layout/no-organization-empty-state";
import { BackendApiError } from "@/lib/server/api-client";
import { getOrganizations } from "@/lib/server/services/organization.service";
import { getReportSummary } from "@/lib/server/services/report.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import type { ReportSummary } from "@/types/report";

const DEFAULT_TREND_DAYS = 7;
const DEFAULT_FUTURE_DAYS = 7;

export default async function DashboardPage() {
  let summary: ReportSummary | null = null;
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
      summary = await getReportSummary(
        selectedOrganization.id,
        DEFAULT_TREND_DAYS,
        DEFAULT_FUTURE_DAYS
      );
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
          error={error}
        />
      ) : null}
    </div>
  );
}

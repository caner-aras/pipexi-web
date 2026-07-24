import { PositionsPageContent } from "@/components/positions/positions-page-content";
import { NoOrganizationEmptyState } from "@/components/layout/no-organization-empty-state";
import { BackendApiError } from "@/lib/server/api-client";
import {
  getOrganizationPositions,
  getOrganizations,
} from "@/lib/server/services/organization.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import type { Position } from "@/types/position";

export default async function PositionsPage() {
  let positions: Position[] = [];
  let error: string | null = null;
  let selectedOrganizationId: string | null = null;
  let selectedOrganizationName: string | null = null;
  let selectedOrganizationCurrency: string = "USD";
  let noOrganization = false;

  try {
    const organizations = await getOrganizations();
    const selectedOrganization = await getSelectedOrganization(organizations);

    if (!selectedOrganization) {
      noOrganization = true;
    } else {
      selectedOrganizationId = selectedOrganization.id;
      selectedOrganizationName = selectedOrganization.name;
      selectedOrganizationCurrency = selectedOrganization.currency || "USD";
      positions = await getOrganizationPositions(selectedOrganization.id);
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      error = err.message;
    } else {
      error = "Failed to load positions.";
    }
  }

  if (noOrganization) {
    return (
      <NoOrganizationEmptyState
        title="Positions"
        description="Select an organization to view its positions."
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      {selectedOrganizationId ? (
        <PositionsPageContent
          organizationId={selectedOrganizationId}
          organizationName={selectedOrganizationName}
          currency={selectedOrganizationCurrency}
          positions={positions}
          error={error}
        />
      ) : null}
    </div>
  );
}

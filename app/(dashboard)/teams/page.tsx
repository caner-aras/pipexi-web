import { TeamsPageContent } from "@/components/organizations/teams-page-content";
import { NoOrganizationEmptyState } from "@/components/layout/no-organization-empty-state";
import { BackendApiError } from "@/lib/server/api-client";
import { getCurrentUser } from "@/lib/server/services/auth.service";
import {
  getOrganizationMembers,
  getOrganizations,
  getOrganizationTeams,
} from "@/lib/server/services/organization.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import type { OrganizationMember } from "@/types/member";
import type { Team } from "@/types/team";

export default async function TeamsPage() {
  let teams: Team[] = [];
  let members: OrganizationMember[] = [];
  let error: string | null = null;
  let selectedOrganizationId: string | null = null;
  let selectedOrganizationName: string | null = null;
  let defaultManagerMemberId: string | null = null;
  let noOrganization = false;

  try {
    const organizations = await getOrganizations();
    const selectedOrganization = await getSelectedOrganization(organizations);

    if (!selectedOrganization) {
      noOrganization = true;
    } else {
      selectedOrganizationId = selectedOrganization.id;
      selectedOrganizationName = selectedOrganization.name;

      const [loadedTeams, loadedMembers, currentUser] = await Promise.all([
        getOrganizationTeams(selectedOrganization.id),
        getOrganizationMembers(selectedOrganization.id),
        getCurrentUser(),
      ]);

      teams = loadedTeams;
      members = loadedMembers;
      defaultManagerMemberId =
        loadedMembers.find((member) => member.userId === currentUser.userId)
          ?.id ?? null;
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      error = err.message;
    } else {
      error = "Failed to load teams.";
    }
  }

  if (noOrganization) {
    return (
      <NoOrganizationEmptyState
        title="Teams"
        description="Select an organization to view its teams."
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      {selectedOrganizationId ? (
        <TeamsPageContent
          organizationId={selectedOrganizationId}
          organizationName={selectedOrganizationName}
          teams={teams}
          members={members}
          defaultManagerMemberId={defaultManagerMemberId}
          error={error}
        />
      ) : null}
    </div>
  );
}

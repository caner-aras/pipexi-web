import { TeamsPageContent } from "@/components/organizations/teams-page-content";
import { NoOrganizationEmptyState } from "@/components/layout/no-organization-empty-state";
import { getTeamMemberLookupKey } from "@/lib/date-format";
import { BackendApiError } from "@/lib/server/api-client";
import { getCurrentUser } from "@/lib/server/services/auth.service";
import {
  getOrganizationMembers,
  getOrganizations,
  getOrganizationTeams,
} from "@/lib/server/services/organization.service";
import { getTeamMembers } from "@/lib/server/services/team.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import type { OrganizationMember } from "@/types/member";
import type { Team } from "@/types/team";

async function buildTeamListData(teams: Team[]): Promise<{
  teamMemberIdByKey: Record<string, string>;
  memberCountByTeamId: Record<string, number>;
}> {
  const membersByTeam = await Promise.all(
    teams.map((team) => getTeamMembers(team.id))
  );
  const teamMemberIdByKey: Record<string, string> = {};
  const memberCountByTeamId: Record<string, number> = {};

  teams.forEach((team, index) => {
    const members = membersByTeam[index];
    memberCountByTeamId[team.id] = members.length;

    for (const member of members) {
      teamMemberIdByKey[
        getTeamMemberLookupKey(member.teamId, member.organizationMemberId)
      ] = member.id;
    }
  });

  return { teamMemberIdByKey, memberCountByTeamId };
}

export default async function TeamsPage() {
  let teams: Team[] = [];
  let members: OrganizationMember[] = [];
  let teamMemberIdByKey: Record<string, string> = {};
  let memberCountByTeamId: Record<string, number> = {};
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

      if (teams.length > 0) {
        const teamListData = await buildTeamListData(teams);
        teamMemberIdByKey = teamListData.teamMemberIdByKey;
        memberCountByTeamId = teamListData.memberCountByTeamId;
      }
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
          teamMemberIdByKey={teamMemberIdByKey}
          memberCountByTeamId={memberCountByTeamId}
          defaultManagerMemberId={defaultManagerMemberId}
          error={error}
        />
      ) : null}
    </div>
  );
}

import { notFound } from "next/navigation";

import { OrganizationMembersPageContent } from "@/components/organizations/organization-members-page-content";
import { BackendApiError } from "@/lib/server/api-client";
import {
  getOrganizationMembers,
  getOrganizationRoles,
  getOrganizationTeams,
  getOrganizationTeamMembers,
  getOrganizations,
} from "@/lib/server/services/organization.service";
import type { OrganizationMember } from "@/types/member";
import type { OrganizationRole } from "@/types/role";
import type { Team } from "@/types/team";

async function buildTeamMemberIdByOrganizationMemberId(
  organizationId: string,
  teams: Team[]
): Promise<Record<string, string>> {
  const membersByTeam = await Promise.all(
    teams.map((team) => getOrganizationTeamMembers(organizationId, team.id))
  );
  const teamMemberIdByOrganizationMemberId: Record<string, string> = {};

  for (const members of membersByTeam) {
    for (const member of members) {
      if (!teamMemberIdByOrganizationMemberId[member.organizationMemberId]) {
        teamMemberIdByOrganizationMemberId[member.organizationMemberId] =
          member.id;
      }
    }
  }

  return teamMemberIdByOrganizationMemberId;
}

interface OrganizationMembersPageProps {
  params: Promise<{ organizationId: string }>;
}

export default async function OrganizationMembersPage({
  params,
}: OrganizationMembersPageProps) {
  const { organizationId } = await params;
  let members: OrganizationMember[] = [];
  let teams: Team[] = [];
  let roles: OrganizationRole[] = [];
  let error: string | null = null;
  let organizationName: string | null = null;
  let teamMemberIdByOrganizationMemberId: Record<string, string> = {};

  try {
    const organizations = await getOrganizations();
    const organization = organizations.find((item) => item.id === organizationId);

    if (!organization) {
      notFound();
    }

    organizationName = organization.name;

    const [loadedMembers, loadedTeams, loadedRoles] = await Promise.all([
      getOrganizationMembers(organizationId),
      getOrganizationTeams(organizationId),
      getOrganizationRoles(organizationId),
    ]);

    members = loadedMembers;
    teams = loadedTeams;
    roles = loadedRoles;

    if (members.length > 0 && teams.length > 0) {
      teamMemberIdByOrganizationMemberId =
        await buildTeamMemberIdByOrganizationMemberId(organizationId, teams);
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      error = err.message;
    } else {
      error = "Failed to load members.";
    }
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <OrganizationMembersPageContent
        organizationId={organizationId}
        organizationName={organizationName ?? "Organization"}
        members={members}
        teams={teams}
        roles={roles}
        teamMemberIdByOrganizationMemberId={teamMemberIdByOrganizationMemberId}
        error={error}
      />
    </div>
  );
}

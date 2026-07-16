import { notFound } from "next/navigation";

import { TeamDetailContent } from "@/components/organizations/team-detail-content";
import { PageHeader } from "@/components/layout/page-header";
import { BackendApiError } from "@/lib/server/api-client";
import {
  getOrganizationMembers,
  getOrganizations,
  getOrganizationRoles,
  getOrganizationTeams,
} from "@/lib/server/services/organization.service";
import { getTeamMembers } from "@/lib/server/services/team.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import type { OrganizationMember } from "@/types/member";
import type { OrganizationRole } from "@/types/role";
import type { Team, TeamMember } from "@/types/team";

interface TeamMembersPageProps {
  params: Promise<{ teamId: string }>;
}

export default async function TeamMembersPage({ params }: TeamMembersPageProps) {
  const { teamId } = await params;
  let team: Team | null = null;
  let members: TeamMember[] = [];
  let organizationMembers: OrganizationMember[] = [];
  let roles: OrganizationRole[] = [];
  let organizationId: string | null = null;
  let error: string | null = null;
  let noOrganization = false;

  try {
    const organizations = await getOrganizations();
    const selectedOrganization = await getSelectedOrganization(organizations);

    if (!selectedOrganization) {
      noOrganization = true;
    } else {
      organizationId = selectedOrganization.id;

      const [teams, loadedMembers, loadedRoles] = await Promise.all([
        getOrganizationTeams(selectedOrganization.id),
        getOrganizationMembers(selectedOrganization.id),
        getOrganizationRoles(selectedOrganization.id),
      ]);

      team = teams.find((item) => item.id === teamId) ?? null;
      organizationMembers = loadedMembers;
      roles = loadedRoles;

      if (team) {
        members = await getTeamMembers(teamId);
      }
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      error = err.message;
    } else {
      error = "Failed to load team members.";
    }
  }

  if (noOrganization) {
    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <PageHeader
          title="Team"
          description="Select an organization to view team details."
        />
      </div>
    );
  }

  if (!team && !error) {
    notFound();
  }

  if (!team || !organizationId) {
    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <PageHeader title="Team" description="Team details." />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <TeamDetailContent
        organizationId={organizationId}
        team={team}
        members={members}
        organizationMembers={organizationMembers}
        roles={roles}
        error={error}
      />
    </div>
  );
}

import { notFound } from "next/navigation";

import { ShiftDetailPageContent } from "@/components/shifts/shift-detail-page-content";
import { PageHeader } from "@/components/layout/page-header";
import { getTeamMemberLookupKey } from "@/lib/date-format";
import { BackendApiError } from "@/lib/server/api-client";
import {
  getOrganizationTeams,
  getOrganizationTeamMembers,
  getOrganizations,
} from "@/lib/server/services/organization.service";
import { getShiftById } from "@/lib/server/services/shift.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import type { Shift } from "@/types/shift";
import type { Team } from "@/types/team";

interface ShiftDetailPageProps {
  params: Promise<{ shiftId: string }>;
}

async function buildTeamMemberLookups(
  organizationId: string,
  teams: Team[]
): Promise<{
  teamMemberIdByKey: Record<string, string>;
  teamMemberIdByOrganizationMemberId: Record<string, string>;
}> {
  const membersByTeam = await Promise.all(
    teams.map((team) => getOrganizationTeamMembers(organizationId, team.id))
  );
  const teamMemberIdByKey: Record<string, string> = {};
  const teamMemberIdByOrganizationMemberId: Record<string, string> = {};

  for (const members of membersByTeam) {
    for (const member of members) {
      teamMemberIdByKey[
        getTeamMemberLookupKey(member.teamId, member.organizationMemberId)
      ] = member.id;

      if (!teamMemberIdByOrganizationMemberId[member.organizationMemberId]) {
        teamMemberIdByOrganizationMemberId[member.organizationMemberId] =
          member.id;
      }
    }
  }

  return { teamMemberIdByKey, teamMemberIdByOrganizationMemberId };
}

export default async function ShiftDetailPage({ params }: ShiftDetailPageProps) {
  const { shiftId } = await params;
  let shift: Shift | null = null;
  let error: string | null = null;
  let noOrganization = false;
  let teamMemberIdByKey: Record<string, string> = {};
  let teamMemberIdByOrganizationMemberId: Record<string, string> = {};
  let organizationId: string | null = null;

  try {
    const organizations = await getOrganizations();
    const selectedOrganization = await getSelectedOrganization(organizations);

    if (!selectedOrganization) {
      noOrganization = true;
    } else {
      organizationId = selectedOrganization.id;

      const loadedShift = await getShiftById(shiftId);

      if (loadedShift.organizationId !== selectedOrganization.id) {
        notFound();
      }

      shift = loadedShift;

      const teams = await getOrganizationTeams(selectedOrganization.id);

      if (teams.length > 0) {
        const lookups = await buildTeamMemberLookups(
          selectedOrganization.id,
          teams
        );
        teamMemberIdByKey = lookups.teamMemberIdByKey;
        teamMemberIdByOrganizationMemberId =
          lookups.teamMemberIdByOrganizationMemberId;
      }
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      if (err.statusCode === 404) {
        notFound();
      }

      error = err.message;
    } else {
      error = "Failed to load shift.";
    }
  }

  if (noOrganization) {
    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <PageHeader
          title="Shift"
          description="Select an organization to view shift details."
        />
      </div>
    );
  }

  if (!shift && !error) {
    notFound();
  }

  if (!shift || !organizationId) {
    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <PageHeader title="Shift" description="Shift details." />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <ShiftDetailPageContent
        organizationId={organizationId}
        shift={shift}
        teamMemberIdByKey={teamMemberIdByKey}
        teamMemberIdByOrganizationMemberId={teamMemberIdByOrganizationMemberId}
        error={error}
      />
    </div>
  );
}

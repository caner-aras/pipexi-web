import { NextResponse } from "next/server";

import { getTeamMemberLookupKey } from "@/lib/date-format";
import { BackendApiError } from "@/lib/server/api-client";
import {
  getOrganizationTeamMembers,
  getOrganizationTeams,
} from "@/lib/server/services/organization.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;

  if (!organizationId) {
    return NextResponse.json(
      { message: "Organization id is required" },
      { status: 400 }
    );
  }

  try {
    const teams = await getOrganizationTeams(organizationId);
    const membersByTeam = await Promise.all(
      teams.map((team) =>
        getOrganizationTeamMembers(organizationId, team.id)
      )
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

    return NextResponse.json({
      data: {
        teamMemberIdByKey,
        teamMemberIdByOrganizationMemberId,
      },
    });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load team member lookups." },
      { status: 500 }
    );
  }
}

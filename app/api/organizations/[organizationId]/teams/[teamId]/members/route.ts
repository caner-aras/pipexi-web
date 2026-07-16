import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { getOrganizationTeamMembers } from "@/lib/server/services/organization.service";

export async function GET(
  _request: Request,
  {
    params,
  }: { params: Promise<{ organizationId: string; teamId: string }> }
) {
  const { organizationId, teamId } = await params;

  if (!organizationId || !teamId) {
    return NextResponse.json(
      { message: "Organization id and team id are required" },
      { status: 400 }
    );
  }

  try {
    const members = await getOrganizationTeamMembers(organizationId, teamId);
    return NextResponse.json({ data: members });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load team members" },
      { status: 500 }
    );
  }
}

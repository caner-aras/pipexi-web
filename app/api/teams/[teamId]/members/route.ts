import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { getTeamMembers } from "@/lib/server/services/team.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  if (!teamId) {
    return NextResponse.json({ message: "Team id is required" }, { status: 400 });
  }

  try {
    const members = await getTeamMembers(teamId);
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

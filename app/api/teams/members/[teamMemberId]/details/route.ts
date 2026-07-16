import { NextResponse } from "next/server";

import { toFromDateIso } from "@/lib/date-format";
import { BackendApiError } from "@/lib/server/api-client";
import { getTeamMemberDetails } from "@/lib/server/services/team-member.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamMemberId: string }> }
) {
  const { teamMemberId } = await params;
  const { searchParams } = new URL(request.url);
  const fromDate = toFromDateIso(searchParams.get("fromDate"));

  if (!teamMemberId) {
    return NextResponse.json(
      { message: "Team member id is required" },
      { status: 400 }
    );
  }

  try {
    const details = await getTeamMemberDetails(teamMemberId, fromDate);
    return NextResponse.json({ data: details });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load team member details" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { getTeamMemberWorkSummary } from "@/lib/server/services/team-member.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const { searchParams } = new URL(request.url);
  const teamMemberId = searchParams.get("teamMemberId");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");

  if (!organizationId) {
    return NextResponse.json(
      { message: "Organization id is required" },
      { status: 400 }
    );
  }

  if (!teamMemberId) {
    return NextResponse.json(
      { message: "teamMemberId is required" },
      { status: 400 }
    );
  }

  if (!fromDate || !toDate) {
    return NextResponse.json(
      { message: "fromDate and toDate are required" },
      { status: 400 }
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fromDate) || !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
    return NextResponse.json(
      { message: "fromDate and toDate must be YYYY-MM-DD" },
      { status: 400 }
    );
  }

  try {
    const summary = await getTeamMemberWorkSummary(
      organizationId,
      teamMemberId,
      fromDate,
      toDate
    );

    return NextResponse.json({ data: summary });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load work summary" },
      { status: 500 }
    );
  }
}

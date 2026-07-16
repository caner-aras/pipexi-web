import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { getTeamMemberTasks } from "@/lib/server/services/team-member.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamMemberId: string }> }
) {
  const { teamMemberId } = await params;

  if (!teamMemberId) {
    return NextResponse.json(
      { message: "Team member id is required" },
      { status: 400 }
    );
  }

  try {
    const tasks = await getTeamMemberTasks(teamMemberId);
    return NextResponse.json({ data: tasks });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load team member tasks" },
      { status: 500 }
    );
  }
}

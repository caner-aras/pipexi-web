import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  deleteTeamMember,
  updateTeamMember,
} from "@/lib/server/services/team-member.service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ teamMemberId: string }> }
) {
  const { teamMemberId } = await params;

  if (!teamMemberId) {
    return NextResponse.json(
      { message: "Team member id is required" },
      { status: 400 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const status =
    typeof body === "object" &&
    body !== null &&
    "status" in body &&
    typeof body.status === "string"
      ? body.status.trim()
      : null;

  if (!status) {
    return NextResponse.json({ message: "status is required" }, { status: 400 });
  }

  try {
    const member = await updateTeamMember(teamMemberId, { status });
    return NextResponse.json({ data: member });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update team member" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    await deleteTeamMember(teamMemberId);
    return NextResponse.json({ data: true });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete team member" },
      { status: 500 }
    );
  }
}

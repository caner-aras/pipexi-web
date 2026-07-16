import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { deleteTeam, updateTeam } from "@/lib/server/services/team.service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  if (!teamId) {
    return NextResponse.json({ message: "Team id is required" }, { status: 400 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const payload = body as {
    name?: string;
    managerMemberId?: string;
    status?: string;
  };

  if (!payload.name?.trim()) {
    return NextResponse.json({ message: "Team name is required." }, { status: 400 });
  }

  if (!payload.managerMemberId?.trim()) {
    return NextResponse.json(
      { message: "Manager member id is required." },
      { status: 400 }
    );
  }

  if (!payload.status?.trim()) {
    return NextResponse.json({ message: "Status is required." }, { status: 400 });
  }

  try {
    const team = await updateTeam(teamId, {
      name: payload.name.trim(),
      managerMemberId: payload.managerMemberId.trim(),
      status: payload.status.trim(),
    });

    return NextResponse.json({ data: team });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json({ message: "Failed to update team." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  if (!teamId) {
    return NextResponse.json({ message: "Team id is required" }, { status: 400 });
  }

  try {
    await deleteTeam(teamId);
    return NextResponse.json({ data: true });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json({ message: "Failed to delete team" }, { status: 500 });
  }
}

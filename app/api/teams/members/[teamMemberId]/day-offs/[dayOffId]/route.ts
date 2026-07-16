import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  deleteTeamMemberDayOff,
  updateTeamMemberDayOff,
} from "@/lib/server/services/team-member.service";

function isIsoDateTime(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

export async function PUT(
  request: Request,
  {
    params,
  }: { params: Promise<{ teamMemberId: string; dayOffId: string }> }
) {
  const { teamMemberId, dayOffId } = await params;

  if (!teamMemberId || !dayOffId) {
    return NextResponse.json(
      { message: "Team member id and day off id are required" },
      { status: 400 }
    );
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
    startAt?: string;
    endAt?: string;
    reason?: string;
    status?: string;
  };

  const startAt = payload.startAt?.trim();
  const endAt = payload.endAt?.trim();

  if (startAt && !isIsoDateTime(startAt)) {
    return NextResponse.json(
      { message: "startAt must be a valid ISO datetime." },
      { status: 400 }
    );
  }

  if (endAt && !isIsoDateTime(endAt)) {
    return NextResponse.json(
      { message: "endAt must be a valid ISO datetime." },
      { status: 400 }
    );
  }

  if (startAt && endAt && Date.parse(endAt) <= Date.parse(startAt)) {
    return NextResponse.json(
      { message: "endAt must be after startAt." },
      { status: 400 }
    );
  }

  try {
    const dayOff = await updateTeamMemberDayOff(teamMemberId, dayOffId, {
      startAt,
      endAt,
      reason: payload.reason?.trim() || undefined,
      status: payload.status?.trim() || undefined,
    });

    return NextResponse.json({ data: dayOff });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update day off." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  {
    params,
  }: { params: Promise<{ teamMemberId: string; dayOffId: string }> }
) {
  const { teamMemberId, dayOffId } = await params;

  if (!teamMemberId || !dayOffId) {
    return NextResponse.json(
      { message: "Team member id and day off id are required" },
      { status: 400 }
    );
  }

  try {
    await deleteTeamMemberDayOff(teamMemberId, dayOffId);
    return NextResponse.json({ data: true });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete day off." },
      { status: 500 }
    );
  }
}

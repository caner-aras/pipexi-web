import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  createTeamMemberDayOff,
  getTeamMemberDayOffs,
} from "@/lib/server/services/team-member.service";

function isIsoDateTime(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamMemberId: string }> }
) {
  const { teamMemberId } = await params;
  const fromAt = new URL(request.url).searchParams.get("fromAt");

  if (!teamMemberId) {
    return NextResponse.json(
      { message: "Team member id is required" },
      { status: 400 }
    );
  }

  if (!fromAt?.trim() || !isIsoDateTime(fromAt.trim())) {
    return NextResponse.json(
      { message: "fromAt is required (ISO datetime)." },
      { status: 400 }
    );
  }

  try {
    const dayOffs = await getTeamMemberDayOffs(teamMemberId, fromAt.trim());
    return NextResponse.json({ data: dayOffs });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load day offs." },
      { status: 500 }
    );
  }
}

export async function POST(
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

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const payload = body as {
    startAt?: string;
    endAt?: string;
    reason?: string;
  };

  if (!payload.startAt?.trim() || !isIsoDateTime(payload.startAt.trim())) {
    return NextResponse.json(
      { message: "startAt is required (ISO datetime)." },
      { status: 400 }
    );
  }

  if (!payload.endAt?.trim() || !isIsoDateTime(payload.endAt.trim())) {
    return NextResponse.json(
      { message: "endAt is required (ISO datetime)." },
      { status: 400 }
    );
  }

  const startAt = payload.startAt.trim();
  const endAt = payload.endAt.trim();

  if (Date.parse(endAt) <= Date.parse(startAt)) {
    return NextResponse.json(
      { message: "endAt must be after startAt." },
      { status: 400 }
    );
  }

  try {
    const dayOff = await createTeamMemberDayOff(teamMemberId, {
      startAt,
      endAt,
      reason: payload.reason?.trim() || undefined,
    });

    return NextResponse.json({ data: dayOff }, { status: 201 });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create day off." },
      { status: 500 }
    );
  }
}

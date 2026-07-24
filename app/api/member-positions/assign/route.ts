import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { assignMemberPosition } from "@/lib/server/services/member-position.service";
import type { AssignMemberPositionInput } from "@/types/member-position";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<AssignMemberPositionInput>;

    if (!payload.organizationMemberId || !payload.positionId) {
      return NextResponse.json(
        { error: "Organization member ID and Position ID are required." },
        { status: 400 }
      );
    }

    if (
      payload.hourlyRate === undefined ||
      payload.hourlyRate === null ||
      Number.isNaN(Number(payload.hourlyRate)) ||
      Number(payload.hourlyRate) < 0
    ) {
      return NextResponse.json(
        { error: "Hourly rate must be a non-negative number." },
        { status: 400 }
      );
    }

    const input: AssignMemberPositionInput = {
      organizationMemberId: payload.organizationMemberId,
      positionId: payload.positionId,
      hourlyRate: Number(payload.hourlyRate),
      startDate: payload.startDate ?? null,
    };

    const result = await assignMemberPosition(input);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "Failed to assign position." },
      { status: 500 }
    );
  }
}

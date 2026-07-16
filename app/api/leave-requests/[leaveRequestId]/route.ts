import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  deleteLeaveRequest,
  updateLeaveRequest,
} from "@/lib/server/services/leave-request.service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ leaveRequestId: string }> }
) {
  const { leaveRequestId } = await params;

  if (!leaveRequestId) {
    return NextResponse.json(
      { message: "Leave request id is required" },
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
    leaveType?: string;
    startDate?: string;
    endDate?: string;
    reason?: string;
  };

  if (
    !payload.leaveType?.trim() ||
    !payload.startDate?.trim() ||
    !payload.endDate?.trim() ||
    !payload.reason?.trim()
  ) {
    return NextResponse.json(
      {
        message: "leaveType, startDate, endDate, and reason are required.",
      },
      { status: 400 }
    );
  }

  try {
    const leaveRequest = await updateLeaveRequest(leaveRequestId, {
      leaveType: payload.leaveType.trim(),
      startDate: payload.startDate.trim(),
      endDate: payload.endDate.trim(),
      reason: payload.reason.trim(),
    });

    return NextResponse.json({ data: leaveRequest });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update leave request." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ leaveRequestId: string }> }
) {
  const { leaveRequestId } = await params;

  if (!leaveRequestId) {
    return NextResponse.json(
      { message: "Leave request id is required" },
      { status: 400 }
    );
  }

  try {
    await deleteLeaveRequest(leaveRequestId);
    return NextResponse.json({ data: true });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete leave request." },
      { status: 500 }
    );
  }
}

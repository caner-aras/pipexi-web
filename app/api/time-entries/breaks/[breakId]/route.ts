import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  deleteTimeEntryBreak,
  updateTimeEntryBreak,
} from "@/lib/server/services/time-entry.service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ breakId: string }> }
) {
  const { breakId } = await params;

  if (!breakId) {
    return NextResponse.json({ message: "Break id is required" }, { status: 400 });
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
    startAt?: string | null;
    endAt?: string | null;
    isPaid?: boolean | null;
    status?: string | null;
  };

  try {
    const timeEntryBreak = await updateTimeEntryBreak(breakId, {
      startAt: payload.startAt,
      endAt: payload.endAt,
      isPaid: payload.isPaid,
      status: payload.status,
    });

    return NextResponse.json({ data: timeEntryBreak });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update time entry break." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ breakId: string }> }
) {
  const { breakId } = await params;

  if (!breakId) {
    return NextResponse.json({ message: "Break id is required" }, { status: 400 });
  }

  try {
    await deleteTimeEntryBreak(breakId);
    return NextResponse.json({ data: true });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete time entry break." },
      { status: 500 }
    );
  }
}

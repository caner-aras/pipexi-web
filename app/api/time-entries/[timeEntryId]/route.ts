import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  deleteTimeEntry,
  updateTimeEntry,
} from "@/lib/server/services/time-entry.service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ timeEntryId: string }> }
) {
  const { timeEntryId } = await params;

  if (!timeEntryId) {
    return NextResponse.json(
      { message: "Time entry id is required" },
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
    shiftId?: string | null;
    organizationMemberId?: string | null;
    locationId?: string | null;
    clockInAt?: string | null;
    clockOutAt?: string | null;
    employeeNote?: string | null;
    managerNote?: string | null;
    status?: string | null;
  };

  try {
    const timeEntry = await updateTimeEntry(timeEntryId, {
      shiftId: payload.shiftId,
      organizationMemberId: payload.organizationMemberId,
      locationId: payload.locationId,
      clockInAt: payload.clockInAt,
      clockOutAt: payload.clockOutAt,
      employeeNote: payload.employeeNote,
      managerNote: payload.managerNote,
      status: payload.status,
    });

    return NextResponse.json({ data: timeEntry });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update time entry." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ timeEntryId: string }> }
) {
  const { timeEntryId } = await params;

  if (!timeEntryId) {
    return NextResponse.json(
      { message: "Time entry id is required" },
      { status: 400 }
    );
  }

  try {
    await deleteTimeEntry(timeEntryId);
    return NextResponse.json({ data: true });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete time entry." },
      { status: 500 }
    );
  }
}

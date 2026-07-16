import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  deleteShift,
  getShiftById,
  updateShift,
} from "@/lib/server/services/shift.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shiftId: string }> }
) {
  const { shiftId } = await params;

  if (!shiftId) {
    return NextResponse.json({ message: "Shift id is required" }, { status: 400 });
  }

  try {
    const shift = await getShiftById(shiftId);
    return NextResponse.json({ data: shift });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json({ message: "Failed to load shift." }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ shiftId: string }> }
) {
  const { shiftId } = await params;

  if (!shiftId) {
    return NextResponse.json({ message: "Shift id is required" }, { status: 400 });
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
    title?: string | null;
    startAt?: string | null;
    endAt?: string | null;
    notes?: string | null;
    status?: string | null;
    locationId?: string | null;
    teamId?: string | null;
    organizationMemberId?: string | null;
  };

  try {
    const shift = await updateShift(shiftId, {
      title: payload.title,
      startAt: payload.startAt,
      endAt: payload.endAt,
      notes: payload.notes,
      status: payload.status,
      locationId: payload.locationId,
      teamId: payload.teamId,
      organizationMemberId: payload.organizationMemberId,
    });

    return NextResponse.json({ data: shift });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json({ message: "Failed to update shift." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ shiftId: string }> }
) {
  const { shiftId } = await params;

  if (!shiftId) {
    return NextResponse.json({ message: "Shift id is required" }, { status: 400 });
  }

  try {
    await deleteShift(shiftId);
    return NextResponse.json({ data: true });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json({ message: "Failed to delete shift." }, { status: 500 });
  }
}

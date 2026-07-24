import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  deletePosition,
  updatePosition,
} from "@/lib/server/services/position.service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ positionId: string }> }
) {
  const { positionId } = await params;

  if (!positionId) {
    return NextResponse.json(
      { message: "Position id is required" },
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
    title?: string;
    defaultHourlyRate?: number;
    description?: string | null;
    status?: string;
  };

  try {
    const updated = await updatePosition(positionId, {
      title: payload.title?.trim(),
      defaultHourlyRate:
        payload.defaultHourlyRate !== undefined
          ? Number(payload.defaultHourlyRate)
          : undefined,
      description:
        payload.description !== undefined
          ? payload.description?.trim() || null
          : undefined,
      status: payload.status?.trim(),
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update position." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ positionId: string }> }
) {
  const { positionId } = await params;

  if (!positionId) {
    return NextResponse.json(
      { message: "Position id is required" },
      { status: 400 }
    );
  }

  try {
    const success = await deletePosition(positionId);
    return NextResponse.json({ data: success });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete position." },
      { status: 500 }
    );
  }
}

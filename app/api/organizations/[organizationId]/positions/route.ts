import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  createPosition,
  getOrganizationPositions,
} from "@/lib/server/services/position.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;

  if (!organizationId) {
    return NextResponse.json(
      { message: "Organization id is required" },
      { status: 400 }
    );
  }

  try {
    const positions = await getOrganizationPositions(organizationId);
    return NextResponse.json({ data: positions });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to fetch positions." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;

  if (!organizationId) {
    return NextResponse.json(
      { message: "Organization id is required" },
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
    description?: string;
  };

  if (!payload.title?.trim()) {
    return NextResponse.json(
      { message: "Position title is required." },
      { status: 400 }
    );
  }

  if (
    payload.defaultHourlyRate === undefined ||
    payload.defaultHourlyRate === null ||
    Number.isNaN(Number(payload.defaultHourlyRate)) ||
    Number(payload.defaultHourlyRate) < 0
  ) {
    return NextResponse.json(
      { message: "Valid default hourly rate is required." },
      { status: 400 }
    );
  }

  try {
    const position = await createPosition({
      organizationId,
      title: payload.title.trim(),
      defaultHourlyRate: Number(payload.defaultHourlyRate),
      description: payload.description?.trim() || null,
    });

    return NextResponse.json({ data: position });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create position." },
      { status: 500 }
    );
  }
}

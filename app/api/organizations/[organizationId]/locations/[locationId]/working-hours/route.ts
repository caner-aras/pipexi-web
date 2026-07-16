import { NextResponse } from "next/server";

import { validateWorkingHourInputs } from "@/lib/location-working-hours";
import { BackendApiError } from "@/lib/server/api-client";
import {
  getLocationWorkingHours,
  setLocationWorkingHours,
} from "@/lib/server/services/location-working-hour.service";
import type { LocationWorkingHourInput } from "@/types/location-working-hour";

function parseWorkingHoursPayload(body: unknown): LocationWorkingHourInput[] | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const payload = body as {
    workingHours?: Array<{
      dayOfWeek?: number;
      isClosed?: boolean;
      opensAt?: string | null;
      closesAt?: string | null;
    }>;
  };

  if (!Array.isArray(payload.workingHours)) {
    return null;
  }

  return payload.workingHours.map((item) => ({
    dayOfWeek: item.dayOfWeek ?? -1,
    isClosed: Boolean(item.isClosed),
    opensAt: item.isClosed ? null : (item.opensAt ?? null),
    closesAt: item.isClosed ? null : (item.closesAt ?? null),
  }));
}

function validateWorkingHourInputsPayload(
  workingHours: LocationWorkingHourInput[]
): string | null {
  return validateWorkingHourInputs(workingHours);
}

export async function GET(
  _request: Request,
  {
    params,
  }: { params: Promise<{ organizationId: string; locationId: string }> }
) {
  const { organizationId, locationId } = await params;

  if (!organizationId || !locationId) {
    return NextResponse.json(
      { message: "Organization id and location id are required." },
      { status: 400 }
    );
  }

  try {
    const workingHours = await getLocationWorkingHours(
      organizationId,
      locationId
    );
    return NextResponse.json({ data: workingHours });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load working hours." },
      { status: 500 }
    );
  }
}

async function saveWorkingHours(
  organizationId: string,
  locationId: string,
  request: Request
) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const workingHours = parseWorkingHoursPayload(body);

  if (!workingHours) {
    return NextResponse.json(
      { message: "workingHours array is required." },
      { status: 400 }
    );
  }

  const validationError = validateWorkingHourInputsPayload(workingHours);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  try {
    const saved = await setLocationWorkingHours(organizationId, locationId, {
      workingHours,
    });

    return NextResponse.json({ data: saved });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to save working hours." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  {
    params,
  }: { params: Promise<{ organizationId: string; locationId: string }> }
) {
  const { organizationId, locationId } = await params;

  if (!organizationId || !locationId) {
    return NextResponse.json(
      { message: "Organization id and location id are required." },
      { status: 400 }
    );
  }

  return saveWorkingHours(organizationId, locationId, request);
}

export async function POST(
  request: Request,
  {
    params,
  }: { params: Promise<{ organizationId: string; locationId: string }> }
) {
  const { organizationId, locationId } = await params;

  if (!organizationId || !locationId) {
    return NextResponse.json(
      { message: "Organization id and location id are required." },
      { status: 400 }
    );
  }

  return saveWorkingHours(organizationId, locationId, request);
}

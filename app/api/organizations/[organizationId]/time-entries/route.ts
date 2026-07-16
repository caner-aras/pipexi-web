import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { createOrganizationTimeEntry } from "@/lib/server/services/time-entry.service";
import type { CreateTimeEntryBreakInput } from "@/types/time-entry";

function parseBreaksPayload(
  breaks: unknown
): CreateTimeEntryBreakInput[] | null | undefined {
  if (breaks === undefined) {
    return undefined;
  }

  if (!Array.isArray(breaks)) {
    return null;
  }

  return breaks.map((item) => {
    if (typeof item !== "object" || item === null) {
      return {
        startAt: "",
        endAt: "",
        isPaid: false,
      };
    }

    const breakItem = item as {
      startAt?: string;
      endAt?: string;
      isPaid?: boolean;
    };

    return {
      startAt: breakItem.startAt?.trim() ?? "",
      endAt: breakItem.endAt?.trim() ?? "",
      isPaid: Boolean(breakItem.isPaid),
    };
  });
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
    shiftId?: string;
    organizationMemberId?: string;
    locationId?: string;
    clockInAt?: string;
    clockOutAt?: string;
    employeeNote?: string;
    managerNote?: string;
    breaks?: unknown;
  };

  if (!payload.shiftId?.trim()) {
    return NextResponse.json({ message: "Shift is required." }, { status: 400 });
  }

  if (!payload.organizationMemberId?.trim()) {
    return NextResponse.json({ message: "Member is required." }, { status: 400 });
  }

  if (!payload.locationId?.trim()) {
    return NextResponse.json({ message: "Location is required." }, { status: 400 });
  }

  if (!payload.clockInAt?.trim() || !payload.clockOutAt?.trim()) {
    return NextResponse.json(
      { message: "Clock in and clock out times are required." },
      { status: 400 }
    );
  }

  const breaks = parseBreaksPayload(payload.breaks);

  if (breaks === null) {
    return NextResponse.json({ message: "Invalid breaks payload." }, { status: 400 });
  }

  if (breaks && breaks.some((breakItem) => !breakItem.startAt || !breakItem.endAt)) {
    return NextResponse.json(
      { message: "Each break must include start and end times." },
      { status: 400 }
    );
  }

  try {
    const timeEntry = await createOrganizationTimeEntry(organizationId, {
      shiftId: payload.shiftId.trim(),
      organizationMemberId: payload.organizationMemberId.trim(),
      locationId: payload.locationId.trim(),
      clockInAt: payload.clockInAt.trim(),
      clockOutAt: payload.clockOutAt.trim(),
      employeeNote: payload.employeeNote?.trim() || undefined,
      managerNote: payload.managerNote?.trim() || undefined,
      breaks: breaks && breaks.length > 0 ? breaks : [],
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
      { message: "Failed to create time entry." },
      { status: 500 }
    );
  }
}

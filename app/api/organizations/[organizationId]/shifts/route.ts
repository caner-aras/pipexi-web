import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  createOrganizationShift,
  getOrganizationShiftsData,
} from "@/lib/server/services/shift.service";
import type {
  CreateShiftBreakInput,
  ShiftRepeatFrequency,
} from "@/types/shift";

const SHIFT_REPEAT_FREQUENCIES = new Set<ShiftRepeatFrequency>([
  "daily",
  "weekly",
  "monthly",
  "montly",
]);

function isShiftRepeatFrequency(value: string): value is ShiftRepeatFrequency {
  return SHIFT_REPEAT_FREQUENCIES.has(value as ShiftRepeatFrequency);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const fromDate = new URL(request.url).searchParams.get("fromDate");

  if (!organizationId) {
    return NextResponse.json(
      { message: "Organization id is required" },
      { status: 400 }
    );
  }

  if (!fromDate?.trim()) {
    return NextResponse.json(
      { message: "fromDate is required." },
      { status: 400 }
    );
  }

  try {
    const data = await getOrganizationShiftsData(
      organizationId,
      fromDate.trim()
    );

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json({ message: "Failed to load shifts." }, { status: 500 });
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
    teamId?: string;
    organizationMemberId?: string;
    locationId?: string;
    title?: string;
    startAt?: string;
    endAt?: string;
    notes?: string;
    breaks?: CreateShiftBreakInput[];
    requiredFormTemplateIds?: string[];
    repeat?: string | null;
    repeatTimes?: number;
    repeatOn?: number[];
    dayOfMonth?: number;
  };

  const hasTeamId = Boolean(payload.teamId?.trim());
  const hasMemberId = Boolean(payload.organizationMemberId?.trim());

  if (hasTeamId === hasMemberId) {
    return NextResponse.json(
      { message: "Provide either teamId or organizationMemberId." },
      { status: 400 }
    );
  }

  if (!payload.locationId?.trim()) {
    return NextResponse.json({ message: "Location is required." }, { status: 400 });
  }

  if (!payload.title?.trim()) {
    return NextResponse.json({ message: "Title is required." }, { status: 400 });
  }

  if (!payload.startAt?.trim() || !payload.endAt?.trim()) {
    return NextResponse.json(
      { message: "Start and end times are required." },
      { status: 400 }
    );
  }

  const repeatRaw = payload.repeat?.trim().toLowerCase() ?? "";
  const hasRepeat = Boolean(repeatRaw);

  if (hasRepeat && !isShiftRepeatFrequency(repeatRaw)) {
    return NextResponse.json(
      { message: "repeat must be daily, weekly, or monthly." },
      { status: 400 }
    );
  }

  const repeat = hasRepeat ? (repeatRaw as ShiftRepeatFrequency) : undefined;
  const repeatTimes =
    typeof payload.repeatTimes === "number" ? payload.repeatTimes : undefined;
  const repeatOn = Array.isArray(payload.repeatOn)
    ? payload.repeatOn.filter(
        (day) => Number.isInteger(day) && day >= 0 && day <= 6
      )
    : undefined;
  const dayOfMonth =
    typeof payload.dayOfMonth === "number" ? payload.dayOfMonth : undefined;

  if (repeat) {
    if (!repeatTimes || repeatTimes < 1) {
      return NextResponse.json(
        { message: "repeatTimes must be greater than 0." },
        { status: 400 }
      );
    }

    if (repeat === "weekly" && (!repeatOn || repeatOn.length === 0)) {
      return NextResponse.json(
        { message: "repeatOn is required for weekly repeats." },
        { status: 400 }
      );
    }

    if (
      (repeat === "monthly" || repeat === "montly") &&
      (dayOfMonth == null || dayOfMonth < 1 || dayOfMonth > 31)
    ) {
      return NextResponse.json(
        { message: "dayOfMonth must be between 1 and 31 for monthly repeats." },
        { status: 400 }
      );
    }
  }

  try {
    const shift = await createOrganizationShift(organizationId, {
      ...(hasTeamId
        ? { teamId: payload.teamId!.trim() }
        : { organizationMemberId: payload.organizationMemberId!.trim() }),
      locationId: payload.locationId.trim(),
      title: payload.title.trim(),
      startAt: payload.startAt.trim(),
      endAt: payload.endAt.trim(),
      notes: payload.notes?.trim() || undefined,
      breaks: payload.breaks,
      requiredFormTemplateIds:
        payload.requiredFormTemplateIds &&
        payload.requiredFormTemplateIds.length > 0
          ? payload.requiredFormTemplateIds
          : undefined,
      ...(repeat
        ? {
            repeat,
            repeatTimes,
            ...(repeat === "weekly" ? { repeatOn } : {}),
            ...(repeat === "monthly" || repeat === "montly"
              ? { dayOfMonth }
              : {}),
          }
        : {}),
    });

    return NextResponse.json({ data: shift });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json({ message: "Failed to create shift." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  createTask,
  getCurrentUserTasks,
} from "@/lib/server/services/task.service";
import type { WorkTaskPriority } from "@/types/team-member-task";

const PRIORITIES = new Set<WorkTaskPriority>([
  "low",
  "medium",
  "high",
  "urgent",
]);

function isIsoDateTime(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim();

  if (!organizationId) {
    return NextResponse.json(
      { message: "organizationId is required." },
      { status: 400 }
    );
  }

  try {
    const tasks = await getCurrentUserTasks(organizationId);
    return NextResponse.json({ data: tasks });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load tasks." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
    organizationId?: string;
    title?: string;
    description?: string | null;
    assignedToTeamMemberId?: string;
    dueAt?: string | null;
    priority?: string;
    shiftId?: string | null;
    locationId?: string | null;
    assignedToTeamId?: string | null;
  };

  if (!payload.organizationId?.trim()) {
    return NextResponse.json(
      { message: "organizationId is required." },
      { status: 400 }
    );
  }

  if (!payload.title?.trim()) {
    return NextResponse.json({ message: "title is required." }, { status: 400 });
  }

  if (!payload.assignedToTeamMemberId?.trim()) {
    return NextResponse.json(
      { message: "assignedToTeamMemberId is required." },
      { status: 400 }
    );
  }

  const dueAt = payload.dueAt?.trim() || null;

  if (dueAt && !isIsoDateTime(dueAt)) {
    return NextResponse.json(
      { message: "dueAt must be a valid ISO datetime." },
      { status: 400 }
    );
  }

  const priority = (payload.priority?.trim() || "medium") as WorkTaskPriority;

  if (!PRIORITIES.has(priority)) {
    return NextResponse.json(
      { message: "priority must be low, medium, high, or urgent." },
      { status: 400 }
    );
  }

  try {
    const task = await createTask({
      organizationId: payload.organizationId.trim(),
      title: payload.title.trim(),
      description: payload.description?.trim() || null,
      assignedToTeamMemberId: payload.assignedToTeamMemberId.trim(),
      dueAt,
      priority,
      shiftId: payload.shiftId?.trim() || null,
      locationId: payload.locationId?.trim() || null,
      assignedToTeamId: payload.assignedToTeamId?.trim() || null,
    });

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create task." },
      { status: 500 }
    );
  }
}

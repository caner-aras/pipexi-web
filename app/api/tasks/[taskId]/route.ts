import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  getTaskById,
  updateTask,
} from "@/lib/server/services/task.service";
import type {
  WorkTaskPriority,
  WorkTaskStatus,
} from "@/types/team-member-task";
import {
  normalizeWorkTaskStatus,
  WORK_TASK_PRIORITIES,
  WORK_TASK_STATUSES,
} from "@/types/team-member-task";

const PRIORITIES = new Set<WorkTaskPriority>(WORK_TASK_PRIORITIES);
const STATUSES = new Set<WorkTaskStatus>(WORK_TASK_STATUSES);

function isIsoDateTime(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  if (!taskId) {
    return NextResponse.json(
      { message: "Task id is required" },
      { status: 400 }
    );
  }

  try {
    const task = await getTaskById(taskId);
    return NextResponse.json({ data: task });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load task." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  if (!taskId) {
    return NextResponse.json(
      { message: "Task id is required" },
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
    organizationId?: string;
    shiftId?: string | null;
    locationId?: string | null;
    title?: string;
    description?: string | null;
    assignedToTeamMemberId?: string;
    assignedToTeamId?: string | null;
    dueAt?: string | null;
    priority?: string;
    status?: string;
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

  const dueAt =
    payload.dueAt === null || payload.dueAt === undefined
      ? null
      : payload.dueAt.trim() || null;

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

  if (!payload.status?.trim()) {
    return NextResponse.json({ message: "status is required." }, { status: 400 });
  }

  const status = normalizeWorkTaskStatus(payload.status);

  if (!STATUSES.has(status)) {
    return NextResponse.json(
      { message: "status is invalid." },
      { status: 400 }
    );
  }

  try {
    const task = await updateTask(payload.organizationId.trim(), taskId, {
      shiftId: payload.shiftId?.trim() || null,
      locationId: payload.locationId?.trim() || null,
      title: payload.title.trim(),
      description: payload.description?.trim() || null,
      assignedToTeamMemberId: payload.assignedToTeamMemberId.trim(),
      assignedToTeamId: payload.assignedToTeamId?.trim() || null,
      dueAt,
      priority,
      status,
    });

    return NextResponse.json({ data: task });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update task." },
      { status: 500 }
    );
  }
}

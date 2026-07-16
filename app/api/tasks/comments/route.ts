import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { createTaskComment } from "@/lib/server/services/task.service";

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
    workTaskId?: string;
    userId?: string;
    message?: string;
  };

  if (!payload.workTaskId?.trim()) {
    return NextResponse.json(
      { message: "workTaskId is required." },
      { status: 400 }
    );
  }

  if (!payload.userId?.trim()) {
    return NextResponse.json(
      { message: "userId is required." },
      { status: 400 }
    );
  }

  if (!payload.message?.trim()) {
    return NextResponse.json(
      { message: "message is required." },
      { status: 400 }
    );
  }

  try {
    const comment = await createTaskComment({
      workTaskId: payload.workTaskId.trim(),
      userId: payload.userId.trim(),
      message: payload.message.trim(),
    });

    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create comment." },
      { status: 500 }
    );
  }
}

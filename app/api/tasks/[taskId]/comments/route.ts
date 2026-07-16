import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { getTaskComments } from "@/lib/server/services/task.service";

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
    const comments = await getTaskComments(taskId);
    return NextResponse.json({ data: comments });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load task comments." },
      { status: 500 }
    );
  }
}

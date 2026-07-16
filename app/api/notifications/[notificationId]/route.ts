import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  deleteNotification,
  updateNotification,
} from "@/lib/server/services/notification.service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  const { notificationId } = await params;

  if (!notificationId) {
    return NextResponse.json(
      { message: "Notification id is required." },
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
    type?: string;
    title?: string;
    body?: string;
    isRead?: boolean;
    scheduledTime?: string | null;
    status?: string;
  };

  const type = payload.type?.trim().toLowerCase() ?? "";
  const title = payload.title?.trim() ?? "";
  const notificationBody = payload.body?.trim() ?? "";
  const status = payload.status?.trim() ?? "";
  const isRead = Boolean(payload.isRead);
  const scheduledTime =
    typeof payload.scheduledTime === "string" && payload.scheduledTime.trim()
      ? payload.scheduledTime.trim()
      : null;

  if (!type) {
    return NextResponse.json({ message: "Type is required." }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ message: "Title is required." }, { status: 400 });
  }

  if (!notificationBody) {
    return NextResponse.json({ message: "Body is required." }, { status: 400 });
  }

  if (!status) {
    return NextResponse.json({ message: "Status is required." }, { status: 400 });
  }

  try {
    const notification = await updateNotification(notificationId, {
      type,
      title,
      body: notificationBody,
      isRead,
      scheduledTime,
      status,
    });

    return NextResponse.json({ data: notification });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update notification." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  const { notificationId } = await params;

  if (!notificationId) {
    return NextResponse.json(
      { message: "Notification id is required." },
      { status: 400 }
    );
  }

  try {
    await deleteNotification(notificationId);
    return NextResponse.json({ data: true });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete notification." },
      { status: 500 }
    );
  }
}

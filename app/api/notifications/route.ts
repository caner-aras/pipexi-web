import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  createNotification,
  listNotifications,
} from "@/lib/server/services/notification.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";

  if (!organizationId) {
    return NextResponse.json(
      { message: "organizationId is required." },
      { status: 400 }
    );
  }

  try {
    const notifications = await listNotifications(organizationId);
    return NextResponse.json({ data: notifications });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load notifications." },
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
    organizationMemberId?: string;
    type?: string;
    title?: string;
    body?: string;
    isRead?: boolean;
    scheduledTime?: string | null;
  };

  const organizationId = payload.organizationId?.trim() ?? "";
  const organizationMemberId = payload.organizationMemberId?.trim() ?? "";
  const type = payload.type?.trim().toLowerCase() ?? "";
  const title = payload.title?.trim() ?? "";
  const notificationBody = payload.body?.trim() ?? "";
  const isRead = Boolean(payload.isRead);
  const scheduledTime =
    typeof payload.scheduledTime === "string" && payload.scheduledTime.trim()
      ? payload.scheduledTime.trim()
      : null;

  if (!organizationId) {
    return NextResponse.json(
      { message: "organizationId is required." },
      { status: 400 }
    );
  }

  if (!organizationMemberId) {
    return NextResponse.json(
      { message: "Recipient member is required." },
      { status: 400 }
    );
  }

  if (!type) {
    return NextResponse.json({ message: "Type is required." }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ message: "Title is required." }, { status: 400 });
  }

  if (!notificationBody) {
    return NextResponse.json({ message: "Body is required." }, { status: 400 });
  }

  try {
    const notification = await createNotification({
      organizationId,
      organizationMemberId,
      type,
      title,
      body: notificationBody,
      isRead,
      scheduledTime,
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
      { message: "Failed to create notification." },
      { status: 500 }
    );
  }
}

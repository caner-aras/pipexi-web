import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  deleteAnnouncement,
  updateAnnouncement,
} from "@/lib/server/services/announcement.service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ announcementId: string }> }
) {
  const { announcementId } = await params;

  if (!announcementId) {
    return NextResponse.json(
      { message: "Announcement id is required." },
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
    body?: string;
    audienceType?: string;
    audienceId?: string | null;
    publishedAt?: string | null;
    status?: string;
  };

  const title = payload.title?.trim() ?? "";
  const announcementBody = payload.body?.trim() ?? "";
  const audienceType = payload.audienceType?.trim() ?? "";
  const status = payload.status?.trim() ?? "";
  const audienceId =
    typeof payload.audienceId === "string" && payload.audienceId.trim()
      ? payload.audienceId.trim()
      : null;
  const publishedAt =
    typeof payload.publishedAt === "string" && payload.publishedAt.trim()
      ? payload.publishedAt.trim()
      : null;

  if (!title) {
    return NextResponse.json({ message: "Title is required." }, { status: 400 });
  }

  if (!announcementBody) {
    return NextResponse.json({ message: "Body is required." }, { status: 400 });
  }

  if (!audienceType) {
    return NextResponse.json(
      { message: "Audience type is required." },
      { status: 400 }
    );
  }

  if (!status) {
    return NextResponse.json({ message: "Status is required." }, { status: 400 });
  }

  if (audienceType !== "all" && !audienceId) {
    return NextResponse.json(
      { message: "Audience is required for the selected audience type." },
      { status: 400 }
    );
  }

  try {
    const announcement = await updateAnnouncement(announcementId, {
      title,
      body: announcementBody,
      audienceType,
      audienceId: audienceType === "all" ? null : audienceId,
      publishedAt,
      status,
    });

    return NextResponse.json({ data: announcement });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update announcement." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ announcementId: string }> }
) {
  const { announcementId } = await params;

  if (!announcementId) {
    return NextResponse.json(
      { message: "Announcement id is required." },
      { status: 400 }
    );
  }

  try {
    await deleteAnnouncement(announcementId);
    return NextResponse.json({ data: true });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete announcement." },
      { status: 500 }
    );
  }
}

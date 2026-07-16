import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  createAnnouncement,
  listAnnouncements,
} from "@/lib/server/services/announcement.service";

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
    const announcements = await listAnnouncements(organizationId);
    return NextResponse.json({ data: announcements });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load announcements." },
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
    body?: string;
    audienceType?: string;
    audienceId?: string | null;
    publishedAt?: string | null;
  };

  const organizationId = payload.organizationId?.trim() ?? "";
  const title = payload.title?.trim() ?? "";
  const announcementBody = payload.body?.trim() ?? "";
  const audienceType = payload.audienceType?.trim() ?? "";
  const audienceId =
    typeof payload.audienceId === "string" && payload.audienceId.trim()
      ? payload.audienceId.trim()
      : null;
  const publishedAt =
    typeof payload.publishedAt === "string" && payload.publishedAt.trim()
      ? payload.publishedAt.trim()
      : null;

  if (!organizationId) {
    return NextResponse.json(
      { message: "organizationId is required." },
      { status: 400 }
    );
  }

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

  if (audienceType !== "all" && !audienceId) {
    return NextResponse.json(
      { message: "Audience is required for the selected audience type." },
      { status: 400 }
    );
  }

  try {
    const announcement = await createAnnouncement({
      organizationId,
      title,
      body: announcementBody,
      audienceType,
      audienceId: audienceType === "all" ? null : audienceId,
      publishedAt,
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
      { message: "Failed to create announcement." },
      { status: 500 }
    );
  }
}

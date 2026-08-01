import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  createGroupConversation,
  createOrGetDirectConversation,
  listConversations,
} from "@/lib/server/services/conversation.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() || undefined;

  try {
    const conversations = await listConversations(organizationId);
    return NextResponse.json({ data: conversations });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load conversations." },
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
    type?: string;
    organizationMemberId?: string;
    title?: string;
    organizationMemberIds?: string[];
  };

  const type = payload.type?.trim().toLowerCase() ?? "direct";

  try {
    if (type === "group") {
      const title = payload.title?.trim() ?? "";
      const organizationMemberIds = Array.isArray(payload.organizationMemberIds)
        ? payload.organizationMemberIds.filter(
            (id): id is string => typeof id === "string" && id.trim().length > 0
          )
        : [];

      if (!title) {
        return NextResponse.json(
          { message: "Group title is required." },
          { status: 400 }
        );
      }

      if (organizationMemberIds.length < 2) {
        return NextResponse.json(
          { message: "Select at least two other members." },
          { status: 400 }
        );
      }

      const conversation = await createGroupConversation(
        title,
        organizationMemberIds
      );
      return NextResponse.json({ data: conversation });
    }

    const organizationMemberId = payload.organizationMemberId?.trim() ?? "";
    if (!organizationMemberId) {
      return NextResponse.json(
        { message: "organizationMemberId is required." },
        { status: 400 }
      );
    }

    const conversation = await createOrGetDirectConversation(organizationMemberId);
    return NextResponse.json({ data: conversation });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create conversation." },
      { status: 500 }
    );
  }
}

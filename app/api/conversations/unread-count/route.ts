import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { getConversationUnreadCount } from "@/lib/server/services/conversation.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() || undefined;

  try {
    const data = await getConversationUnreadCount(organizationId);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load unread count." },
      { status: 500 }
    );
  }
}

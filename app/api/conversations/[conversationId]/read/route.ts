import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { markConversationRead } from "@/lib/server/services/conversation.service";

type RouteContext = {
  params: Promise<{ conversationId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { conversationId } = await context.params;

  if (!conversationId) {
    return NextResponse.json(
      { message: "conversationId is required." },
      { status: 400 }
    );
  }

  try {
    const data = await markConversationRead(conversationId);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to mark conversation as read." },
      { status: 500 }
    );
  }
}

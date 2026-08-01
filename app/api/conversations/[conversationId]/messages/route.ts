import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  listConversationMessages,
  sendConversationMessage,
} from "@/lib/server/services/conversation.service";

type RouteContext = {
  params: Promise<{ conversationId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { conversationId } = await context.params;
  const { searchParams } = new URL(request.url);
  const pageNumber = Number(searchParams.get("pageNumber") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "50");

  if (!conversationId) {
    return NextResponse.json(
      { message: "conversationId is required." },
      { status: 400 }
    );
  }

  try {
    const data = await listConversationMessages(
      conversationId,
      Number.isFinite(pageNumber) ? pageNumber : 1,
      Number.isFinite(pageSize) ? pageSize : 50
    );
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load messages." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { conversationId } = await context.params;

  if (!conversationId) {
    return NextResponse.json(
      { message: "conversationId is required." },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const messageBody =
    typeof body === "object" &&
    body !== null &&
    "body" in body &&
    typeof (body as { body?: unknown }).body === "string"
      ? (body as { body: string }).body.trim()
      : "";

  if (!messageBody) {
    return NextResponse.json({ message: "Message body is required." }, { status: 400 });
  }

  try {
    const data = await sendConversationMessage(conversationId, messageBody);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to send message." },
      { status: 500 }
    );
  }
}

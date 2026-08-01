import { cookies } from "next/headers";

import {
  createUserScopedSupabaseClient,
  isServerSupabaseConfigured,
} from "@/lib/supabase/user-scoped-client";
import { ACCESS_TOKEN_COOKIE } from "@/types/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_organization_member_id: string;
  body: string;
  created_at: string;
  updated_at: string | null;
  status?: string | null;
};

type MemberRow = {
  conversation_id: string;
  organization_member_id: string;
  last_read_at: string | null;
};

function encodeSse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: Request) {
  if (!isServerSupabaseConfigured()) {
    return new Response(
      JSON.stringify({ message: "Realtime is not configured on the server." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createUserScopedSupabaseClient(accessToken);
  await supabase.realtime.setAuth(accessToken);

  const encoder = new TextEncoder();
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let channel: ReturnType<typeof supabase.channel> | null = null;
  let closed = false;

  const cleanup = () => {
    if (closed) {
      return;
    }
    closed = true;
    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeat = null;
    }
    if (channel) {
      void supabase.removeChannel(channel);
      channel = null;
    }
  };

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) {
          return;
        }
        try {
          controller.enqueue(encoder.encode(encodeSse(event, data)));
        } catch {
          cleanup();
        }
      };

      channel = supabase
        .channel(`web-chat-proxy:${crypto.randomUUID()}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "conversation_messages",
          },
          (payload) => {
            const row = payload.new as MessageRow;
            if (!row?.id || !row.conversation_id || row.status === "deleted") {
              return;
            }

            send("message_insert", {
              type: "message_insert",
              payload: {
                id: row.id,
                conversationId: row.conversation_id,
                senderOrganizationMemberId: row.sender_organization_member_id,
                body: row.body,
                createdAt: row.created_at,
                updatedAt: row.updated_at ?? null,
                status: row.status ?? null,
              },
            });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "conversation_members",
          },
          (payload) => {
            const row = payload.new as MemberRow;
            if (!row?.conversation_id) {
              return;
            }

            send("member_update", {
              type: "member_update",
              payload: {
                conversationId: row.conversation_id,
                organizationMemberId: row.organization_member_id,
                lastReadAt: row.last_read_at,
              },
            });
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            send("connected", { type: "connected", payload: { ok: true } });
          }
        });

      heartbeat = setInterval(() => {
        send("ping", { type: "ping", at: Date.now() });
      }, 25_000);

      request.signal.addEventListener("abort", () => {
        cleanup();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

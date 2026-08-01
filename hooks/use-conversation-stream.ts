"use client";

import { useEffect, useRef } from "react";

import type { ChatStreamEvent } from "@/types/conversation";

type UseConversationStreamOptions = {
  enabled?: boolean;
  onEvent: (event: ChatStreamEvent) => void;
};

/**
 * Same-origin SSE proxy — browser never talks to Supabase directly.
 */
export function useConversationStream({
  enabled = true,
  onEvent,
}: UseConversationStreamOptions) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    let closed = false;
    let source: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let retryMs = 1000;

    const connect = () => {
      if (closed) {
        return;
      }

      source = new EventSource("/api/conversations/stream");

      const handlePayload = (raw: MessageEvent<string>) => {
        try {
          const parsed = JSON.parse(raw.data) as ChatStreamEvent | { type: string };
          if (
            parsed.type === "message_insert" ||
            parsed.type === "member_update" ||
            parsed.type === "connected"
          ) {
            onEventRef.current(parsed as ChatStreamEvent);
            retryMs = 1000;
          }
        } catch {
          // ignore malformed frames
        }
      };

      source.addEventListener("message_insert", handlePayload);
      source.addEventListener("member_update", handlePayload);
      source.addEventListener("connected", handlePayload);

      source.onerror = () => {
        source?.close();
        source = null;
        if (closed) {
          return;
        }
        retryTimer = setTimeout(() => {
          retryMs = Math.min(retryMs * 2, 15_000);
          connect();
        }, retryMs);
      };
    };

    connect();

    const onVisible = () => {
      if (document.visibilityState === "visible" && !source && !closed) {
        connect();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      closed = true;
      document.removeEventListener("visibilitychange", onVisible);
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      source?.close();
    };
  }, [enabled]);
}

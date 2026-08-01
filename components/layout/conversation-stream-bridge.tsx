"use client";

import { useCallback } from "react";

import { useOrganization } from "@/components/layout/organization-provider";
import { useConversationStream } from "@/hooks/use-conversation-stream";
import type { ChatStreamEvent, ConversationMessage } from "@/types/conversation";

/**
 * Single dashboard-wide SSE subscription. Browser never talks to Supabase.
 * Forwards events via window CustomEvents for list/thread/badge consumers.
 */
export function ConversationStreamBridge() {
  const { selectedOrganizationId } = useOrganization();

  const refreshUnread = useCallback(async (organizationId: string) => {
    try {
      const response = await fetch(
        `/api/conversations/unread-count?organizationId=${encodeURIComponent(organizationId)}`
      );
      const body = (await response.json()) as {
        data?: { unreadCount: number };
      };
      if (response.ok && body.data) {
        window.dispatchEvent(
          new CustomEvent("pipexi:chat-unread", {
            detail: { unreadCount: body.data.unreadCount },
          })
        );
      }
    } catch {
      // ignore
    }
  }, []);

  const handleEvent = useCallback(
    (event: ChatStreamEvent) => {
      if (event.type === "message_insert") {
        const payload = event.payload;
        const message: ConversationMessage = {
          id: payload.id,
          conversationId: payload.conversationId,
          senderOrganizationMemberId: payload.senderOrganizationMemberId,
          senderDisplayName: "Member",
          isMine: false,
          body: payload.body,
          createdAt: payload.createdAt,
          updatedAt: payload.updatedAt,
        };

        window.dispatchEvent(
          new CustomEvent("pipexi:chat-message", {
            detail: {
              conversationId: payload.conversationId,
              message,
            },
          })
        );

        if (selectedOrganizationId) {
          void refreshUnread(selectedOrganizationId);
        }
        return;
      }

      if (event.type === "member_update") {
        window.dispatchEvent(
          new CustomEvent("pipexi:chat-member-update", {
            detail: event.payload,
          })
        );
        if (selectedOrganizationId) {
          void refreshUnread(selectedOrganizationId);
        }
      }
    },
    [refreshUnread, selectedOrganizationId]
  );

  useConversationStream({
    enabled: Boolean(selectedOrganizationId),
    onEvent: handleEvent,
  });

  return null;
}

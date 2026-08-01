import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type {
  Conversation,
  ConversationMessage,
  ConversationUnreadCount,
  PagedConversationMessages,
} from "@/types/conversation";

export async function listConversations(
  organizationId?: string
): Promise<Conversation[]> {
  const query = organizationId
    ? `?organizationId=${encodeURIComponent(organizationId)}`
    : "";
  return backendFetch<Conversation[]>(`/conversations${query}`);
}

export async function getConversationUnreadCount(
  organizationId?: string
): Promise<ConversationUnreadCount> {
  const query = organizationId
    ? `?organizationId=${encodeURIComponent(organizationId)}`
    : "";
  return backendFetch<ConversationUnreadCount>(
    `/conversations/unread-count${query}`
  );
}

export async function createOrGetDirectConversation(
  peerOrganizationMemberId: string
): Promise<Conversation> {
  return backendFetch<Conversation>("/conversations", {
    method: "POST",
    body: JSON.stringify({
      type: "direct",
      organizationMemberId: peerOrganizationMemberId,
    }),
  });
}

export async function createGroupConversation(
  title: string,
  organizationMemberIds: string[]
): Promise<Conversation> {
  return backendFetch<Conversation>("/conversations", {
    method: "POST",
    body: JSON.stringify({
      type: "group",
      title,
      organizationMemberIds,
    }),
  });
}

export async function listConversationMessages(
  conversationId: string,
  pageNumber = 1,
  pageSize = 50
): Promise<PagedConversationMessages> {
  const params = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  });
  return backendFetch<PagedConversationMessages>(
    `/conversations/${conversationId}/messages?${params.toString()}`
  );
}

export async function sendConversationMessage(
  conversationId: string,
  body: string
): Promise<ConversationMessage> {
  return backendFetch<ConversationMessage>(
    `/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ body }),
    }
  );
}

export async function markConversationRead(
  conversationId: string
): Promise<boolean> {
  return backendFetch<boolean>(`/conversations/${conversationId}/read`, {
    method: "POST",
  });
}

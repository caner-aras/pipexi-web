export interface Conversation {
  id: string;
  organizationId: string;
  type: "direct" | "group" | string;
  title: string | null;
  peerOrganizationMemberId: string | null;
  peerDisplayName: string;
  peerAvatarUrl: string | null;
  lastMessageBody: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  memberCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderOrganizationMemberId: string;
  senderDisplayName: string;
  isMine: boolean;
  body: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface PagedConversationMessages {
  items: ConversationMessage[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  conversationType: string;
  peerLastReadAt: string | null;
  currentOrganizationMemberId: string;
}

export interface ConversationUnreadCount {
  unreadCount: number;
}

export type ChatStreamEvent =
  | {
      type: "message_insert";
      payload: {
        id: string;
        conversationId: string;
        senderOrganizationMemberId: string;
        body: string;
        createdAt: string;
        updatedAt: string | null;
        status?: string | null;
      };
    }
  | {
      type: "member_update";
      payload: {
        conversationId: string;
        organizationMemberId: string;
        lastReadAt: string | null;
      };
    }
  | {
      type: "connected";
      payload: { ok: true };
    };

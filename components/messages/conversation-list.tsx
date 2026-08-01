"use client";

import { MessageCircle, Users } from "lucide-react";

import { PersonAvatar } from "@/components/ui/person-avatar";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/conversation";

type ConversationListProps = {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
};

function formatPreviewTime(iso: string | null): string {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <MessageCircle className="size-7 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No conversations yet. Start a direct message or create a group.
        </p>
      </div>
    );
  }

  return (
    <ul className="min-h-0 flex-1 overflow-y-auto">
      {conversations.map((item, index) => {
        const unread = item.unreadCount ?? 0;
        const isGroup = item.type === "group";
        const selected = item.id === selectedId;

        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60",
                selected && "bg-muted"
              )}
            >
              {isGroup ? (
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Users className="size-5 text-muted-foreground" />
                </div>
              ) : (
                <PersonAvatar
                  name={item.peerDisplayName}
                  userId={item.peerOrganizationMemberId}
                  avatarUrl={item.peerAvatarUrl}
                  size="md"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      "truncate text-sm",
                      unread > 0 ? "font-bold" : "font-semibold"
                    )}
                  >
                    {item.peerDisplayName}
                  </p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatPreviewTime(item.lastMessageAt ?? item.createdAt)}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                    {item.lastMessageBody ?? "No messages yet"}
                  </p>
                  {unread > 0 ? (
                    <span className="min-w-5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
            {index < conversations.length - 1 ? (
              <div className="ml-[68px] h-px bg-border/70" />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

"use client";

import { MessageSquarePlus, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ConversationList } from "@/components/messages/conversation-list";
import { ConversationThread } from "@/components/messages/conversation-thread";
import { CreateGroupDialog } from "@/components/messages/create-group-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { cn } from "@/lib/utils";
import type { Conversation, ConversationMessage } from "@/types/conversation";
import type { OrganizationMember } from "@/types/member";

type MessagesPageContentProps = {
  organizationId: string;
  initialConversations: Conversation[];
  members: OrganizationMember[];
  initialUnreadCount: number;
  loadError?: string | null;
};

export function MessagesPageContent({
  organizationId,
  initialConversations,
  members,
  initialUnreadCount,
  loadError = null,
}: MessagesPageContentProps) {
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [groupOpen, setGroupOpen] = useState(false);
  const [dmOpen, setDmOpen] = useState(false);
  const [error, setError] = useState<string | null>(loadError);

  const selected = useMemo(
    () => conversations.find((item) => item.id === selectedId) ?? null,
    [conversations, selectedId]
  );

  const refreshUnread = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/conversations/unread-count?organizationId=${encodeURIComponent(organizationId)}`
      );
      const body = (await response.json()) as {
        data?: { unreadCount: number };
      };
      if (response.ok && body.data) {
        setUnreadCount(body.data.unreadCount);
        window.dispatchEvent(
          new CustomEvent("pipexi:chat-unread", {
            detail: { unreadCount: body.data.unreadCount },
          })
        );
      }
    } catch {
      // ignore
    }
  }, [organizationId]);

  const refreshList = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/conversations?organizationId=${encodeURIComponent(organizationId)}`
      );
      const body = (await response.json()) as {
        data?: Conversation[];
        message?: string;
      };
      if (!response.ok || !body.data) {
        throw new Error(body.message ?? "Failed to refresh conversations.");
      }
      setConversations(body.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh conversations.");
    }
  }, [organizationId]);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{
        conversationId: string;
        message: ConversationMessage;
      }>;
      const payload = custom.detail?.message;
      const conversationId = custom.detail?.conversationId;
      if (!payload || !conversationId) {
        return;
      }

      const isSelected = conversationId === selectedId;

      setConversations((previous) => {
        const exists = previous.some((item) => item.id === conversationId);
        if (!exists) {
          void refreshList();
          return previous;
        }

        const next = previous.map((item) => {
          if (item.id !== conversationId) {
            return item;
          }
          return {
            ...item,
            lastMessageBody: payload.body,
            lastMessageAt: payload.createdAt,
            unreadCount: isSelected ? 0 : (item.unreadCount ?? 0) + 1,
          };
        });
        return [...next].sort((a, b) => {
          const aTime = new Date(a.lastMessageAt ?? a.createdAt).getTime();
          const bTime = new Date(b.lastMessageAt ?? b.createdAt).getTime();
          return bTime - aTime;
        });
      });

      if (!isSelected) {
        void refreshUnread();
      }
    };

    window.addEventListener("pipexi:chat-message", handler as EventListener);
    return () => {
      window.removeEventListener("pipexi:chat-message", handler as EventListener);
    };
  }, [refreshList, refreshUnread, selectedId]);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ unreadCount: number }>;
      if (typeof custom.detail?.unreadCount === "number") {
        setUnreadCount(custom.detail.unreadCount);
      }
    };
    window.addEventListener("pipexi:chat-unread", handler as EventListener);
    return () => {
      window.removeEventListener("pipexi:chat-unread", handler as EventListener);
    };
  }, []);

  async function startDirect(memberId: string) {
    setError(null);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "direct",
          organizationMemberId: memberId,
        }),
      });
      const body = (await response.json()) as {
        data?: Conversation;
        message?: string;
      };
      if (!response.ok || !body.data) {
        throw new Error(body.message ?? "Failed to start conversation.");
      }
      setConversations((previous) => {
        if (previous.some((item) => item.id === body.data!.id)) {
          return previous;
        }
        return [body.data!, ...previous];
      });
      setSelectedId(body.data.id);
      setMobileThreadOpen(true);
      setDmOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start conversation.");
    }
  }

  return (
    <div className="relative flex h-[calc(100vh-7rem)] min-h-[520px] overflow-hidden rounded-xl border bg-card">
      <aside
        className={cn(
          "flex w-full max-w-full flex-col border-r md:max-w-sm md:w-[360px]",
          mobileThreadOpen && "hidden md:flex"
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <div>
            <h1 className="text-base font-semibold">Messages</h1>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "Direct and group chats"}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDmOpen(true)}
            >
              <MessageSquarePlus className="size-4" />
              DM
            </Button>
            <Button size="sm" onClick={() => setGroupOpen(true)}>
              <Users className="size-4" />
              Group
            </Button>
          </div>
        </div>

        {error ? (
          <p className="border-b px-4 py-2 text-xs text-destructive">{error}</p>
        ) : null}

        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={(conversation) => {
            setSelectedId(conversation.id);
            setMobileThreadOpen(true);
            setConversations((previous) =>
              previous.map((item) =>
                item.id === conversation.id ? { ...item, unreadCount: 0 } : item
              )
            );
          }}
        />
      </aside>

      <section
        className={cn(
          "min-w-0 flex-1",
          mobileThreadOpen ? "flex" : "hidden md:flex"
        )}
      >
        {selected ? (
          <ConversationThread
            key={selected.id}
            conversationId={selected.id}
            conversationTitle={selected.peerDisplayName}
            conversationType={selected.type}
            onBack={() => setMobileThreadOpen(false)}
            onUnreadCleared={() => {
              void refreshUnread();
              void refreshList();
            }}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Select a conversation
          </div>
        )}
      </section>

      <CreateGroupDialog
        open={groupOpen}
        onOpenChange={setGroupOpen}
        members={members}
        onCreated={(conversation) => {
          setConversations((previous) => [conversation, ...previous]);
          setSelectedId(conversation.id);
          setMobileThreadOpen(true);
        }}
      />

      <Dialog open={dmOpen} onOpenChange={setDmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New direct message</DialogTitle>
            <DialogDescription>Choose a member to message.</DialogDescription>
          </DialogHeader>
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {members.map((member) => {
              const name =
                `${member.user.firstName} ${member.user.lastName}`.trim() ||
                member.user.email;
              return (
                <button
                  key={member.id}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted/70"
                  onClick={() => {
                    void startDirect(member.id);
                  }}
                >
                  <PersonAvatar
                    name={name}
                    userId={member.userId}
                    avatarUrl={member.user.avatarUrl}
                    size="sm"
                  />
                  <span className="truncate text-sm">{name}</span>
                </button>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDmOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

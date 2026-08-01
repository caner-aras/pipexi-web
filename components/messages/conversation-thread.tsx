"use client";

import { ArrowLeft, Check, CheckCheck, Send, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { PersonAvatar } from "@/components/ui/person-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  ConversationMessage,
  PagedConversationMessages,
} from "@/types/conversation";

type ConversationThreadProps = {
  conversationId: string;
  conversationTitle: string;
  conversationType: string;
  onUnreadCleared?: () => void;
  onBack?: () => void;
};

function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function sameMemberId(a?: string | null, b?: string | null): boolean {
  if (!a || !b) {
    return false;
  }
  return a.toLowerCase() === b.toLowerCase();
}

function isReadByPeer(createdAt: string, peerLastReadAt: string | null): boolean {
  if (!peerLastReadAt) {
    return false;
  }
  const messageTime = new Date(createdAt).getTime();
  const readTime = new Date(peerLastReadAt).getTime();
  if (Number.isNaN(messageTime) || Number.isNaN(readTime)) {
    return false;
  }
  return readTime >= messageTime;
}

export function ConversationThread({
  conversationId,
  conversationTitle,
  conversationType,
  onUnreadCleared,
  onBack,
}: ConversationThreadProps) {
  const [page, setPage] = useState<PagedConversationMessages | null>(null);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isDirect = conversationType.toLowerCase() === "direct";

  const messages = page?.items ?? [];
  const myMemberId = page?.currentOrganizationMemberId ?? null;
  const peerLastReadAt = page?.peerLastReadAt ?? null;

  async function loadMessages() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages?pageNumber=1&pageSize=50`
      );
      const body = (await response.json()) as {
        data?: PagedConversationMessages;
        message?: string;
      };
      if (!response.ok || !body.data) {
        throw new Error(body.message ?? "Failed to load messages.");
      }
      setPage(body.data);
      await fetch(`/api/conversations/${conversationId}/read`, { method: "POST" });
      onUnreadCleared?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function appendMessage(message: ConversationMessage) {
    setPage((previous) => {
      if (!previous) {
        return previous;
      }
      if (previous.items.some((item) => item.id === message.id)) {
        return previous;
      }
      return {
        ...previous,
        items: [...previous.items, message],
        totalCount: previous.totalCount + 1,
      };
    });
  }

  async function handleSend() {
    const body = draft.trim();
    if (!body || isSending) {
      return;
    }
    setIsSending(true);
    setDraft("");
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const payload = (await response.json()) as {
        data?: ConversationMessage;
        message?: string;
      };
      if (!response.ok || !payload.data) {
        throw new Error(payload.message ?? "Failed to send message.");
      }
      appendMessage(payload.data);
    } catch (err) {
      setDraft(body);
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  }

  // Expose append for parent realtime wiring via custom event
  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{
        conversationId: string;
        message: ConversationMessage;
      }>;
      if (custom.detail.conversationId !== conversationId) {
        return;
      }
      appendMessage(custom.detail.message);
      void fetch(`/api/conversations/${conversationId}/read`, { method: "POST" }).then(
        () => onUnreadCleared?.()
      );
    };
    window.addEventListener("pipexi:chat-message", handler as EventListener);
    return () => {
      window.removeEventListener("pipexi:chat-message", handler as EventListener);
    };
  }, [conversationId, onUnreadCleared]);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{
        conversationId: string;
        organizationMemberId: string;
        lastReadAt: string | null;
      }>;
      if (custom.detail.conversationId !== conversationId || !custom.detail.lastReadAt) {
        return;
      }
      if (sameMemberId(custom.detail.organizationMemberId, myMemberId)) {
        return;
      }
      setPage((previous) => {
        if (!previous || previous.conversationType.toLowerCase() !== "direct") {
          return previous;
        }
        const current = previous.peerLastReadAt;
        if (
          current &&
          new Date(custom.detail.lastReadAt!).getTime() <= new Date(current).getTime()
        ) {
          return previous;
        }
        return { ...previous, peerLastReadAt: custom.detail.lastReadAt };
      });
    };
    window.addEventListener("pipexi:chat-member-update", handler as EventListener);
    return () => {
      window.removeEventListener("pipexi:chat-member-update", handler as EventListener);
    };
  }, [conversationId, myMemberId]);

  const content = useMemo(() => {
    if (isLoading && !page) {
      return (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Loading messages…
        </div>
      );
    }

    if (error && messages.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
          {error}
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No messages yet. Say hello.
        </div>
      );
    }

    return (
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages.map((message, index) => {
          const fromMe =
            message.isMine ||
            sameMemberId(message.senderOrganizationMemberId, myMemberId);
          const previous = index > 0 ? messages[index - 1] : null;
          const showSender =
            !isDirect &&
            !fromMe &&
            !sameMemberId(
              previous?.senderOrganizationMemberId,
              message.senderOrganizationMemberId
            );
          const read =
            fromMe &&
            isDirect &&
            isReadByPeer(message.createdAt, peerLastReadAt);

          return (
            <div
              key={message.id}
              className={cn(
                "max-w-[78%] rounded-2xl px-3.5 py-2.5",
                fromMe
                  ? "ml-auto rounded-br-md bg-emerald-600 text-white"
                  : "mr-auto rounded-bl-md bg-muted"
              )}
            >
              {showSender ? (
                <p className="mb-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  {message.senderDisplayName || "Member"}
                </p>
              ) : null}
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>
              <div className="mt-1 flex items-center justify-end gap-1">
                <span
                  className={cn(
                    "text-[11px]",
                    fromMe ? "text-emerald-100" : "text-muted-foreground"
                  )}
                >
                  {formatMessageTime(message.createdAt)}
                </span>
                {fromMe && isDirect ? (
                  read ? (
                    <CheckCheck className="size-3.5 text-sky-200" />
                  ) : (
                    <Check className="size-3.5 text-emerald-100" />
                  )
                ) : null}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    );
  }, [
    error,
    isDirect,
    isLoading,
    messages,
    myMemberId,
    page,
    peerLastReadAt,
  ]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b px-3 py-3 md:gap-3 md:px-4">
        {onBack ? (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={onBack}
            aria-label="Back to conversations"
          >
            <ArrowLeft className="size-4" />
          </Button>
        ) : null}
        {isDirect ? (
          <PersonAvatar name={conversationTitle} size="sm" />
        ) : (
          <div className="flex size-8 items-center justify-center rounded-full bg-muted">
            <Users className="size-4 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{conversationTitle}</p>
          <p className="text-xs text-muted-foreground">
            {isDirect ? "Direct message" : "Group"}
          </p>
        </div>
      </div>

      {content}

      <div className="flex items-end gap-2 border-t p-3">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Message"
          className="min-h-11"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSend();
            }
          }}
        />
        <Button
          size="icon"
          className="size-11 shrink-0 rounded-full"
          disabled={isSending || !draft.trim()}
          onClick={() => {
            void handleSend();
          }}
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}

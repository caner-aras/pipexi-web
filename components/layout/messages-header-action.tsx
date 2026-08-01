"use client";

import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useOrganization } from "@/components/layout/organization-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MessagesHeaderAction() {
  const { selectedOrganizationId } = useOrganization();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!selectedOrganizationId) {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;

    async function refreshUnread(organizationId: string) {
      try {
        const response = await fetch(
          `/api/conversations/unread-count?organizationId=${encodeURIComponent(organizationId)}`
        );
        const body = (await response.json()) as {
          data?: { unreadCount: number };
        };
        if (!cancelled && response.ok && body.data) {
          setUnreadCount(body.data.unreadCount);
        }
      } catch {
        // ignore
      }
    }

    void refreshUnread(selectedOrganizationId);
    return () => {
      cancelled = true;
    };
  }, [selectedOrganizationId]);

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

  const label = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <Link
      href="/messages"
      aria-label="Messages"
      className={cn(buttonVariants({ variant: "outline", size: "icon" }), "relative")}
    >
      <MessageSquare className="size-4" />
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white">
          {label}
        </span>
      ) : null}
    </Link>
  );
}

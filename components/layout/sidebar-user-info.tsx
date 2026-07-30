"use client";

import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import {
  UserProfileDialog,
  authUserToProfile,
} from "@/components/profile/user-profile-dialog";
import { PersonAvatar } from "@/components/ui/person-avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { AuthUser } from "@/types/auth";

function truncateUserId(userId: string): string {
  if (userId.length <= 12) {
    return userId;
  }

  return `${userId.slice(0, 8)}...`;
}

function getDisplayName(user: AuthUser): string {
  return `${user.firstName} ${user.lastName}`.trim() || "User";
}

interface SidebarUserInfoProps {
  user: AuthUser;
}

export function SidebarUserInfo({ user }: SidebarUserInfoProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const displayName = getDisplayName(user);
  const secondaryLabel = user.email ?? truncateUserId(user.userId);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            variant="outline"
            tooltip={displayName}
            onClick={() => setProfileOpen(true)}
            className="h-auto gap-2.5 px-2 py-2 hover:bg-sidebar-accent/70 data-active:bg-sidebar-accent/70"
          >
            <PersonAvatar
              name={displayName}
              userId={user.userId}
              avatarUrl={user.avatarUrl}
              size="xs"
              className="size-7 ring-1 ring-border/80"
            />

            <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate text-[13px] font-medium">
                {displayName}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {secondaryLabel}
              </span>
            </div>

            <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground/80 group-data-[collapsible=icon]:hidden" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <UserProfileDialog
        user={authUserToProfile(user)}
        open={profileOpen}
        onOpenChange={setProfileOpen}
        loadFresh
        description="Update your personal information."
      />
    </>
  );
}

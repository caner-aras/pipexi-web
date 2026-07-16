"use client";

import Link from "next/link";
import { ArrowUpRight, UserRound, Users } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { buildTeamMemberProfileHref } from "@/lib/team-member-navigation";
import { getShiftMemberDisplayName } from "@/lib/shift-format";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/types/team";

interface TeamMemberListProps {
  members: TeamMember[];
}

export function TeamMemberList({ members }: TeamMemberListProps) {
  if (members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No members in this team"
        description="Team members will appear here once they are added."
        className="py-8"
      />
    );
  }

  return (
    <ItemGroup className="max-w-2xl gap-2">
      {members.map((member) => {
        const profileHref = buildTeamMemberProfileHref(member.id);
        const displayName = getShiftMemberDisplayName(member.organizationMember);

        return (
          <Item key={member.id} variant="outline" size="sm">
            <ItemMedia variant="icon">
              <UserRound className="size-5 text-muted-foreground" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                <Link
                  href={profileHref}
                  className="inline-flex items-center gap-1 transition-opacity hover:opacity-80"
                >
                  {displayName}
                  <ArrowUpRight className="size-3.5 text-muted-foreground" />
                </Link>
              </ItemTitle>
              <ItemDescription>
                {member.organizationMember.jobTitle} ·{" "}
                {member.organizationMember.user.email}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <StatusIndicator status={member.status} />
              <Link
                href={profileHref}
                title="View schedule"
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon-sm" })
                )}
              >
                <ArrowUpRight className="size-4" />
                <span className="sr-only">View schedule</span>
              </Link>
            </ItemActions>
          </Item>
        );
      })}
    </ItemGroup>
  );
}

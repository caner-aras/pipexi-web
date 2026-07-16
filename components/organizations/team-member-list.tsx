import { ChevronRightIcon, User } from "lucide-react";

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
import type { TeamMember } from "@/types/team";

function getMemberDisplayName(member: TeamMember): string {
  const { user } = member.organizationMember;
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  return fullName || user.email;
}

interface TeamMemberListProps {
  members: TeamMember[];
}

export function TeamMemberList({ members }: TeamMemberListProps) {
  return (
    <ItemGroup className="gap-2">
      {members.map((member) => (
        <Item key={member.id} size="sm">
          <ItemMedia variant="icon">
            <User className="size-5 text-muted-foreground" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{getMemberDisplayName(member)}</ItemTitle>
            <ItemDescription>
              {member.organizationMember.jobTitle} ·{" "}
              {member.organizationMember.user.email}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <StatusIndicator status={member.status} />
            <ChevronRightIcon className="size-4 text-muted-foreground" />
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  );
}

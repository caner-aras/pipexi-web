"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Pencil, UserPlus } from "lucide-react";

import { AddTeamMemberDrawer } from "@/components/organizations/add-team-member-drawer";
import { EditTeamDrawer } from "@/components/organizations/edit-team-drawer";
import { TeamMembersTable } from "@/components/organizations/team-members-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { getShiftMemberDisplayName } from "@/lib/shift-format";
import { cn } from "@/lib/utils";
import type { OrganizationMember } from "@/types/member";
import type { OrganizationRole } from "@/types/role";
import type { Team, TeamMember } from "@/types/team";

interface TeamDetailContentProps {
  organizationId: string;
  team: Team;
  members: TeamMember[];
  organizationMembers: OrganizationMember[];
  roles: OrganizationRole[];
  error: string | null;
}

export function TeamDetailContent({
  organizationId,
  team,
  members,
  organizationMembers,
  roles,
  error,
}: TeamDetailContentProps) {
  const router = useRouter();
  const [editTeamOpen, setEditTeamOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const managerName = team.managerMember
    ? getShiftMemberDisplayName(team.managerMember)
    : null;

  function handleMemberAdded() {
    setAddMemberOpen(false);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        leading={
          <Link
            href="/teams"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "mb-3 -ml-2 w-fit"
            )}
          >
            <ArrowLeft className="size-4" />
            Back to teams
          </Link>
        }
        title={team.name}
        titleAddon={<StatusIndicator status={team.status} showLabel />}
        description={
          managerName
            ? `Manager · ${managerName}${team.managerMember?.jobTitle ? ` · ${team.managerMember.jobTitle}` : ""} · ${members.length} member${members.length === 1 ? "" : "s"}`
            : `${members.length} member${members.length === 1 ? "" : "s"}`
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditTeamOpen(true)}
            >
              <Pencil className="size-4" />
              Edit team
            </Button>
            <Button
              size="sm"
              onClick={() => setAddMemberOpen(true)}
              disabled={roles.length === 0}
            >
              <UserPlus className="size-4" />
              Add member
            </Button>
          </>
        }
      />

      <div className="w-full">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <TeamMembersTable
            members={members}
            managerMemberId={team.managerMemberId}
          />
        )}
      </div>

      <EditTeamDrawer
        organizationId={organizationId}
        team={team}
        members={organizationMembers}
        open={editTeamOpen}
        onOpenChange={setEditTeamOpen}
      />

      <AddTeamMemberDrawer
        organizationId={organizationId}
        team={team}
        roles={roles}
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        onAdded={handleMemberAdded}
      />
    </>
  );
}

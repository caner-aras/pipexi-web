"use client";

import { Plus, UsersRound } from "lucide-react";
import { useState } from "react";

import { CreateTeamDrawer } from "@/components/organizations/create-team-drawer";
import { EditTeamDrawer } from "@/components/organizations/edit-team-drawer";
import { TeamsView } from "@/components/organizations/teams-view";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { OrganizationMember } from "@/types/member";
import type { Team } from "@/types/team";

interface TeamsPageContentProps {
  organizationId: string;
  organizationName: string | null;
  teams: Team[];
  members: OrganizationMember[];
  teamMemberIdByKey: Record<string, string>;
  memberCountByTeamId: Record<string, number>;
  defaultManagerMemberId: string | null;
  error: string | null;
}

export function TeamsPageContent({
  organizationId,
  organizationName,
  teams,
  members,
  teamMemberIdByKey,
  memberCountByTeamId,
  defaultManagerMemberId,
  error,
}: TeamsPageContentProps) {
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [createDefaults, setCreateDefaults] = useState<{
    name: string;
    managerMemberId: string;
  } | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editTeamOpen, setEditTeamOpen] = useState(false);

  function handleAddTeam() {
    setCreateDefaults(null);
    setCreateTeamOpen(true);
  }

  function handleEditTeam(team: Team) {
    setEditingTeam(team);
    setEditTeamOpen(true);
  }

  function handleDuplicateTeam(team: Team) {
    setCreateDefaults({
      name: `${team.name} Copy`,
      managerMemberId: team.managerMemberId,
    });
    setCreateTeamOpen(true);
  }

  function handleCreateTeamOpenChange(open: boolean) {
    setCreateTeamOpen(open);

    if (!open) {
      setCreateDefaults(null);
    }
  }

  function handleEditTeamOpenChange(open: boolean) {
    setEditTeamOpen(open);

    if (!open) {
      setEditingTeam(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Teams"
        description={
          organizationName
            ? `Teams and members for ${organizationName}.`
            : "Organization teams and members."
        }
        actions={
          <Button
            size="sm"
            onClick={handleAddTeam}
            disabled={members.length === 0}
          >
            <Plus className="size-4" />
            New team
          </Button>
        }
      />

      <div className="w-full">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : teams.length === 0 ? (
          <EmptyState
            icon={UsersRound}
            title="No teams found"
            description={
              members.length === 0
                ? "Add organization members before creating teams."
                : "Create your first team to organize your workforce."
            }
            action={
              members.length > 0 ? (
                <Button size="sm" onClick={handleAddTeam}>
                  <Plus className="size-4" />
                  New team
                </Button>
              ) : undefined
            }
          />
        ) : (
          <TeamsView
            teams={teams}
            teamMemberIdByKey={teamMemberIdByKey}
            memberCountByTeamId={memberCountByTeamId}
            onEditTeam={handleEditTeam}
            onDuplicateTeam={handleDuplicateTeam}
          />
        )}
      </div>

      <CreateTeamDrawer
        organizationId={organizationId}
        members={members}
        defaultManagerMemberId={defaultManagerMemberId}
        defaults={createDefaults}
        open={createTeamOpen}
        onOpenChange={handleCreateTeamOpenChange}
      />

      <EditTeamDrawer
        organizationId={organizationId}
        team={editingTeam}
        members={members}
        open={editTeamOpen}
        onOpenChange={handleEditTeamOpenChange}
      />
    </>
  );
}

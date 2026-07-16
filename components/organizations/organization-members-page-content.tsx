"use client";

import { UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AddTeamMemberDrawer } from "@/components/organizations/add-team-member-drawer";
import { OrganizationMemberList } from "@/components/organizations/organization-member-list";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { OrganizationMember } from "@/types/member";
import type { OrganizationRole } from "@/types/role";
import type { Team } from "@/types/team";

interface OrganizationMembersPageContentProps {
  organizationId: string;
  organizationName: string;
  members: OrganizationMember[];
  teams: Team[];
  roles: OrganizationRole[];
  teamMemberIdByOrganizationMemberId: Record<string, string>;
  error: string | null;
}

export function OrganizationMembersPageContent({
  organizationId,
  organizationName,
  members,
  teams,
  roles,
  teamMemberIdByOrganizationMemberId,
  error,
}: OrganizationMembersPageContentProps) {
  const router = useRouter();
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  function handleMemberAdded() {
    setAddMemberOpen(false);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        title="Members"
        description={`Members of ${organizationName}.`}
        actions={
          <Button
            size="sm"
            onClick={() => setAddMemberOpen(true)}
            disabled={roles.length === 0}
          >
            <UserPlus className="size-4" />
            Add member
          </Button>
        }
      />

      <div className="w-full">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No members found"
            description="Members will appear here once they join the organization."
            action={
              <Button
                size="sm"
                onClick={() => setAddMemberOpen(true)}
                disabled={roles.length === 0}
              >
                <UserPlus className="size-4" />
                Add member
              </Button>
            }
          />
        ) : (
          <OrganizationMemberList
            members={members}
            teamMemberIdByOrganizationMemberId={
              teamMemberIdByOrganizationMemberId
            }
          />
        )}
      </div>

      <AddTeamMemberDrawer
        organizationId={organizationId}
        team={null}
        teams={teams}
        roles={roles}
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        onAdded={handleMemberAdded}
      />
    </>
  );
}

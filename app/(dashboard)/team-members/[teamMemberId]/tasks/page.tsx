import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { TeamMemberTasksPageContent } from "@/components/team-members/team-member-tasks-page";
import { buttonVariants } from "@/components/ui/button";
import { toFromDateIso } from "@/lib/date-format";
import { BackendApiError } from "@/lib/server/api-client";
import {
  getOrganizationTeamMembers,
  getOrganizationTeams,
} from "@/lib/server/services/organization.service";
import { getCurrentUserTasks } from "@/lib/server/services/task.service";
import { getTeamMemberDetails } from "@/lib/server/services/team-member.service";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/types/team";
import type { TeamMemberTask } from "@/types/team-member-task";

interface TeamMemberTasksPageProps {
  params: Promise<{ teamMemberId: string }>;
}

export default async function TeamMemberTasksPage({
  params,
}: TeamMemberTasksPageProps) {
  const { teamMemberId } = await params;

  let tasks: TeamMemberTask[] = [];
  let memberName = "Team member";
  let organizationId: string | null = null;
  let assignableMembers: TeamMember[] = [];
  let error: string | null = null;

  try {
    const details = await getTeamMemberDetails(teamMemberId, toFromDateIso());

    tasks = await getCurrentUserTasks(details.organizationId);
    organizationId = details.organizationId;
    memberName =
      `${details.teamMember.organizationMember.user.firstName} ${details.teamMember.organizationMember.user.lastName}`.trim() ||
      details.teamMember.organizationMember.user.email;

    const teams = await getOrganizationTeams(details.organizationId);
    const membersByTeam = await Promise.all(
      teams.map((team) =>
        getOrganizationTeamMembers(details.organizationId, team.id)
      )
    );
    assignableMembers = membersByTeam.flat();
  } catch (err) {
    if (err instanceof BackendApiError) {
      error = err.message;
    } else {
      error = "Failed to load tasks.";
    }
  }

  return (
    <div className="flex min-w-0 w-full flex-col gap-8 overflow-x-hidden p-6">
      <PageHeader
        className="shrink-0"
        leading={
          <Link
            href={`/tasks`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "mb-3 -ml-2 w-fit"
            )}
          >
            <ArrowLeft className="size-4" />
            Back to tasks
          </Link>
        }
        title="Tasks"
        description={`Tasks for ${memberName}.`}
      />

      <div className="min-w-0 w-full">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : organizationId ? (
          <TeamMemberTasksPageContent
            teamMemberId={teamMemberId}
            organizationId={organizationId}
            defaultAssignedToTeamMemberId={teamMemberId}
            assignableMembers={assignableMembers}
            memberName={memberName}
            initialTasks={tasks}
          />
        ) : null}
      </div>
    </div>
  );
}

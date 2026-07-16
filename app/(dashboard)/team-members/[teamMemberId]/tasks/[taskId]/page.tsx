import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { TeamMemberTaskDetail } from "@/components/team-members/team-member-task-detail";
import { buttonVariants } from "@/components/ui/button";
import { toFromDateIso } from "@/lib/date-format";
import { BackendApiError } from "@/lib/server/api-client";
import { getCurrentUser } from "@/lib/server/services/auth.service";
import {
  getOrganizationTeamMembers,
  getOrganizationTeams,
} from "@/lib/server/services/organization.service";
import { getTaskById } from "@/lib/server/services/task.service";
import { getTeamMemberDetails } from "@/lib/server/services/team-member.service";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/types/team";
import type { TeamMemberTask } from "@/types/team-member-task";

interface TeamMemberTaskDetailPageProps {
  params: Promise<{ teamMemberId: string; taskId: string }>;
}

export default async function TeamMemberTaskDetailPage({
  params,
}: TeamMemberTaskDetailPageProps) {
  const { teamMemberId, taskId } = await params;

  let task: TeamMemberTask | null = null;
  let assignableMembers: TeamMember[] = [];
  let commentAuthorUserId: string | null = null;
  let error: string | null = null;

  try {
    const [details, currentUser, loadedTask] = await Promise.all([
      getTeamMemberDetails(teamMemberId, toFromDateIso()),
      getCurrentUser(),
      getTaskById(taskId),
    ]);

    task = loadedTask;
    commentAuthorUserId = currentUser.userId;

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
      error = "Failed to load task.";
    }
  }

  return (
    <div className="flex min-w-0 w-full flex-col gap-8 overflow-x-hidden p-6">
      <PageHeader
        className="shrink-0"
        leading={
          <Link
            href={`/team-members/${teamMemberId}/tasks`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "mb-3 -ml-2 w-fit"
            )}
          >
            <ArrowLeft className="size-4" />
            Back to board
          </Link>
        }
        title={task?.title ?? "Task"}
        description="Details on the left, discussion on the right."
      />

      <div className="min-w-0 w-full">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : task ? (
          <TeamMemberTaskDetail
            key={`${task.id}-${task.updatedAt ?? task.createdAt ?? ""}`}
            task={task}
            teamMemberId={teamMemberId}
            assignableMembers={assignableMembers}
            commentAuthorUserId={commentAuthorUserId}
          />
        ) : null}
      </div>
    </div>
  );
}

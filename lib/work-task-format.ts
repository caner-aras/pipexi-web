import { getShiftMemberDisplayName } from "@/lib/shift-format";
import type { TeamMember } from "@/types/team";
import type { WorkTask } from "@/types/team-member-task";

export function getWorkTaskReporterLabel(
  task: Pick<WorkTask, "reporter" | "reporterUserId">,
  assignableMembers: TeamMember[] = []
): string | null {
  if (task.reporter) {
    const name = `${task.reporter.firstName ?? ""} ${task.reporter.lastName ?? ""}`.trim();
    return name || task.reporter.email || null;
  }

  if (!task.reporterUserId) {
    return null;
  }

  for (const member of assignableMembers) {
    if (member.organizationMember?.user?.id === task.reporterUserId) {
      return getShiftMemberDisplayName(member.organizationMember);
    }
  }

  return null;
}

export function getWorkTaskReporterAvatarUrl(
  task: Pick<WorkTask, "reporter" | "reporterUserId">
): string | null {
  return task.reporter?.avatarUrl ?? null;
}

export function getWorkTaskReporterUserId(
  task: Pick<WorkTask, "reporter" | "reporterUserId">
): string | null {
  return task.reporter?.id ?? task.reporterUserId ?? null;
}

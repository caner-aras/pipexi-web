import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type {
  CreateTeamMemberDayOffInput,
  TeamMemberDayOff,
  UpdateTeamMemberDayOffInput,
} from "@/types/team-member-day-off";
import type { TeamMemberDetails } from "@/types/team-member-details";
import type { TeamMemberTask } from "@/types/team-member-task";
import type { TeamMemberWorkSummary } from "@/types/team-member-work-summary";
import type { TeamMember, UpdateTeamMemberInput } from "@/types/team";

export async function updateTeamMember(
  teamMemberId: string,
  input: UpdateTeamMemberInput
): Promise<TeamMember> {
  return backendFetch<TeamMember>(`/teams/members/${teamMemberId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteTeamMember(teamMemberId: string): Promise<boolean> {
  return backendFetch<boolean>(`/teams/members/${teamMemberId}`, {
    method: "DELETE",
  });
}

export async function getTeamMemberDetails(
  teamMemberId: string,
  fromDate: string
): Promise<TeamMemberDetails> {
  const params = new URLSearchParams({ fromDate });

  return backendFetch<TeamMemberDetails>(
    `/teams/members/${teamMemberId}/details?${params.toString()}`
  );
}

export async function getTeamMemberWorkSummary(
  organizationId: string,
  teamMemberId: string,
  fromDate: string,
  toDate: string
): Promise<TeamMemberWorkSummary> {
  const params = new URLSearchParams({
    teamMemberId,
    fromDate,
    toDate,
  });

  return backendFetch<TeamMemberWorkSummary>(
    `/organizations/${organizationId}/teams/members/work-summary?${params.toString()}`
  );
}

export async function getTeamMemberTasks(
  teamMemberId: string
): Promise<TeamMemberTask[]> {
  return backendFetch<TeamMemberTask[]>(
    `/teams/members/${teamMemberId}/tasks`
  );
}

export async function getTeamMemberDayOffs(
  teamMemberId: string,
  fromAt: string
): Promise<TeamMemberDayOff[]> {
  const params = new URLSearchParams({ fromAt });

  return backendFetch<TeamMemberDayOff[]>(
    `/teams/members/${teamMemberId}/day-offs?${params.toString()}`
  );
}

export async function createTeamMemberDayOff(
  teamMemberId: string,
  input: CreateTeamMemberDayOffInput
): Promise<TeamMemberDayOff> {
  return backendFetch<TeamMemberDayOff>(
    `/teams/members/${teamMemberId}/day-offs`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function updateTeamMemberDayOff(
  teamMemberId: string,
  dayOffId: string,
  input: UpdateTeamMemberDayOffInput
): Promise<TeamMemberDayOff> {
  return backendFetch<TeamMemberDayOff>(
    `/teams/members/${teamMemberId}/day-offs/${dayOffId}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    }
  );
}

export async function deleteTeamMemberDayOff(
  teamMemberId: string,
  dayOffId: string
): Promise<boolean> {
  return backendFetch<boolean>(
    `/teams/members/${teamMemberId}/day-offs/${dayOffId}`,
    {
      method: "DELETE",
    }
  );
}

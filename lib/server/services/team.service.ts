import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type { Team, TeamMember, UpdateTeamInput } from "@/types/team";

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  return backendFetch<TeamMember[]>(`/teams/${teamId}/members`);
}

export async function updateTeam(
  teamId: string,
  input: UpdateTeamInput
): Promise<Team> {
  return backendFetch<Team>(`/teams/${teamId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteTeam(teamId: string): Promise<boolean> {
  return backendFetch<boolean>(`/teams/${teamId}`, {
    method: "DELETE",
  });
}

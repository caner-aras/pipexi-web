import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type { Organization } from "@/types/auth";
import type { Location, CreateLocationInput } from "@/types/location";
import type { OrganizationMember } from "@/types/member";
import type { OrganizationRole } from "@/types/role";
import type {
  CreateTeamInput,
  OnboardTeamMemberInput,
  Team,
  TeamMember,
  UpdateTeamInput,
} from "@/types/team";
import type { WorkTask } from "@/types/team-member-task";

export async function getOrganizations(): Promise<Organization[]> {
  return backendFetch<Organization[]>("/organizations");
}

export async function getOrganization(
  organizationId: string
): Promise<Organization> {
  return backendFetch<Organization>(`/organizations/${organizationId}`);
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  timezone: string;
}

export interface UpdateOrganizationInput {
  name: string;
  slug: string;
  timezone: string;
}

export async function createOrganization(
  input: CreateOrganizationInput
): Promise<Organization> {
  return backendFetch<Organization>("/organizations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateOrganization(
  organizationId: string,
  input: UpdateOrganizationInput
): Promise<Organization> {
  return backendFetch<Organization>(`/organizations/${organizationId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function getOrganizationMembers(
  organizationId: string
): Promise<OrganizationMember[]> {
  return backendFetch<OrganizationMember[]>(
    `/organizations/${organizationId}/members`
  );
}

export async function getOrganizationTeams(
  organizationId: string
): Promise<Team[]> {
  return backendFetch<Team[]>(`/organizations/${organizationId}/teams`);
}

export async function createOrganizationTeam(
  organizationId: string,
  input: CreateTeamInput
): Promise<Team> {
  return backendFetch<Team>(`/organizations/${organizationId}/teams`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateOrganizationTeam(
  _organizationId: string,
  teamId: string,
  input: UpdateTeamInput
): Promise<Team> {
  return backendFetch<Team>(`/teams/${teamId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function getOrganizationTeamMembers(
  organizationId: string,
  teamId: string
): Promise<TeamMember[]> {
  return backendFetch<TeamMember[]>(
    `/organizations/${organizationId}/teams/${teamId}/members`
  );
}

export async function getOrganizationRoles(
  organizationId: string
): Promise<OrganizationRole[]> {
  return backendFetch<OrganizationRole[]>(
    `/organizations/${organizationId}/roles`
  );
}

export async function onboardTeamMember(
  organizationId: string,
  teamId: string,
  input: OnboardTeamMemberInput
): Promise<TeamMember> {
  return backendFetch<TeamMember>(
    `/organizations/${organizationId}/teams/${teamId}/members/onboard`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function getOrganizationLocations(
  organizationId: string
): Promise<Location[]> {
  return backendFetch<Location[]>(
    `/organizations/${organizationId}/locations`
  );
}

export async function createOrganizationLocation(
  organizationId: string,
  input: CreateLocationInput
): Promise<Location> {
  return backendFetch<Location>(
    `/organizations/${organizationId}/locations`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function getOrganizationTasks(
  organizationId: string
): Promise<WorkTask[]> {
  return backendFetch<WorkTask[]>(`/organizations/${organizationId}/tasks`);
}

import type { OrganizationMember } from "@/types/member";

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  managerMemberId: string;
  managerMember?: OrganizationMember;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface TeamMember {
  id: string;
  teamId: string;
  organizationMemberId: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  team: Team;
  organizationMember: OrganizationMember;
}

export interface CreateTeamInput {
  name: string;
  managerMemberId: string;
}

export interface UpdateTeamInput {
  name: string;
  managerMemberId: string;
  status: string;
}

export interface UpdateTeamMemberInput {
  status: string;
}

export interface OnboardTeamMemberInput {
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  jobTitle: string;
  phone: string | null;
  avatarUrl: string | null;
  authProviderId: string | null;
}

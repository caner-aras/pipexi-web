import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type { OrganizationMember } from "@/types/member";

export interface UpdateOrganizationMemberInput {
  jobTitle: string;
  status: string;
}

export async function getOrganizationMember(
  memberId: string
): Promise<OrganizationMember> {
  return backendFetch<OrganizationMember>(`/organization-members/${memberId}`);
}

export async function updateOrganizationMember(
  memberId: string,
  input: UpdateOrganizationMemberInput
): Promise<OrganizationMember> {
  return backendFetch<OrganizationMember>(`/organization-members/${memberId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteOrganizationMember(
  memberId: string
): Promise<boolean> {
  return backendFetch<boolean>(`/organization-members/${memberId}`, {
    method: "DELETE",
  });
}

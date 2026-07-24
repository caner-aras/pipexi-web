import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type {
  AssignMemberPositionInput,
  MemberPositionHistory,
} from "@/types/member-position";

export async function getActiveMemberPosition(
  organizationMemberId: string
): Promise<MemberPositionHistory | null> {
  try {
    return await backendFetch<MemberPositionHistory>(
      `/member-positions/active/${organizationMemberId}`
    );
  } catch (error) {
    return null;
  }
}

export async function getMemberPositionHistory(
  organizationMemberId: string
): Promise<MemberPositionHistory[]> {
  return backendFetch<MemberPositionHistory[]>(
    `/member-positions/history/${organizationMemberId}`
  );
}

export async function assignMemberPosition(
  input: AssignMemberPositionInput
): Promise<MemberPositionHistory> {
  return backendFetch<MemberPositionHistory>("/member-positions/assign", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

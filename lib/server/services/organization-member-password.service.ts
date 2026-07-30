import "server-only";

import { backendFetch } from "@/lib/server/api-client";

export async function resetOrganizationMemberPassword(
  organizationId: string,
  organizationMemberId: string
): Promise<void> {
  await backendFetch<null>(
    `/organizations/${organizationId}/members/${organizationMemberId}/reset-password`,
    {
      method: "POST",
    }
  );
}

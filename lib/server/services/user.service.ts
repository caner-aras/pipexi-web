import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type { AuthUser, UpdateUserInput } from "@/types/auth";

export async function updateUser(
  userId: string,
  input: UpdateUserInput
): Promise<AuthUser> {
  return backendFetch<AuthUser>(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

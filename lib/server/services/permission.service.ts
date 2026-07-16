import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type { Permission } from "@/types/permission";

export async function getPermissions(): Promise<Permission[]> {
  return backendFetch<Permission[]>("/permissions");
}

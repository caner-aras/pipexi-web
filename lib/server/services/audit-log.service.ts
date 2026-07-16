import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type { AuditLog, CreateAuditLogInput } from "@/types/audit-log";

export async function listAuditLogs(
  organizationId: string
): Promise<AuditLog[]> {
  const query = new URLSearchParams({ organizationId });
  return backendFetch<AuditLog[]>(`/audit-logs?${query.toString()}`);
}

export async function createAuditLog(
  input: CreateAuditLogInput
): Promise<AuditLog> {
  return backendFetch<AuditLog>("/audit-logs", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

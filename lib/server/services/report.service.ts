import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type { ReportSummary } from "@/types/report";
import type { ShiftFormsStatus } from "@/types/shift-forms-status";

export async function getReportSummary(
  organizationId: string,
  trendDays = 15,
  futureDays = 7
): Promise<ReportSummary> {
  const query = new URLSearchParams({
    organizationId,
    trendDays: String(trendDays),
    futureDays: String(futureDays),
  });

  return backendFetch<ReportSummary>(`/report/summary?${query.toString()}`);
}

export async function getShiftFormsStatus(
  organizationId: string,
  trendDays = 30,
  futureDays = 7
): Promise<ShiftFormsStatus[]> {
  const query = new URLSearchParams({
    organizationId,
    trendDays: String(trendDays),
    futureDays: String(futureDays),
  });

  return backendFetch<ShiftFormsStatus[]>(`/report/shift-forms?${query.toString()}`);
}

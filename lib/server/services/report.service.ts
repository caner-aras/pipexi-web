import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type { ReportSummary } from "@/types/report";

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

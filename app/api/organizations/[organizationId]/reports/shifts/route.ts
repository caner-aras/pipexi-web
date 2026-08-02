import { NextResponse } from "next/server";

import { backendFetch, BackendApiError } from "@/lib/server/api-client";
import type { ShiftReportDataResponse } from "@/types/reports";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const { searchParams } = new URL(request.url);
  
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  const includeSummary = searchParams.get("includeSummary");
  const memberIds = searchParams.getAll("memberId");

  if (!fromDate || !toDate) {
    return NextResponse.json(
      { message: "fromDate and toDate are required." },
      { status: 400 }
    );
  }

  const queryParams = new URLSearchParams({
    organizationId,
    fromDate,
    toDate,
  });
  
  if (includeSummary) {
    queryParams.append("includeSummary", includeSummary);
  }

  memberIds.forEach((id) => {
    queryParams.append("memberId", id);
  });

  try {
    const data = await backendFetch<ShiftReportDataResponse>(
      `/report/shift-report?${queryParams.toString()}`
    );
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load shift report." },
      { status: 500 }
    );
  }
}

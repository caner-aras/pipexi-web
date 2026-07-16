import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { getReportSummary } from "@/lib/server/services/report.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const trendDays = Number.parseInt(
    searchParams.get("trendDays")?.trim() ?? "7",
    10
  );
  const futureDays = Number.parseInt(
    searchParams.get("futureDays")?.trim() ?? "7",
    10
  );

  if (!organizationId) {
    return NextResponse.json(
      { message: "organizationId is required." },
      { status: 400 }
    );
  }

  if (!Number.isFinite(trendDays) || trendDays < 1 || trendDays > 90) {
    return NextResponse.json(
      { message: "trendDays must be a number between 1 and 90." },
      { status: 400 }
    );
  }

  if (!Number.isFinite(futureDays) || futureDays < 0 || futureDays > 90) {
    return NextResponse.json(
      { message: "futureDays must be a number between 0 and 90." },
      { status: 400 }
    );
  }

  try {
    const data = await getReportSummary(organizationId, trendDays, futureDays);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load report summary." },
      { status: 500 }
    );
  }
}

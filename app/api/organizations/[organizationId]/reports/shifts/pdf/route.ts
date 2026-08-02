import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/types/auth";
import { ORGANIZATION_ID_HEADER } from "@/lib/server/api-client";

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

  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";
  
  const response = await fetch(
    `${baseUrl}/report/shift-report/pdf?${queryParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        [ORGANIZATION_ID_HEADER]: organizationId,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { message: "Failed to download PDF." },
      { status: response.status }
    );
  }

  const blob = await response.blob();
  
  return new NextResponse(blob, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ShiftReport.pdf"`,
    },
  });
}

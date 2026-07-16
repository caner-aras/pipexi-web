import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { getShiftFormTemplates } from "@/lib/server/services/shift.service";

export async function GET(
  _request: Request,
  {
    params,
  }: { params: Promise<{ organizationId: string; shiftId: string }> }
) {
  const { organizationId, shiftId } = await params;

  if (!organizationId || !shiftId) {
    return NextResponse.json(
      { message: "Organization id and shift id are required" },
      { status: 400 }
    );
  }

  try {
    const formTemplates = await getShiftFormTemplates(organizationId, shiftId);
    return NextResponse.json({ data: formTemplates });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load shift form templates." },
      { status: 500 }
    );
  }
}

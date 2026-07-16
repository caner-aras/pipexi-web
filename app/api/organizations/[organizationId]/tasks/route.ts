import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { getOrganizationTasks } from "@/lib/server/services/organization.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;

  if (!organizationId) {
    return NextResponse.json(
      { message: "Organization id is required" },
      { status: 400 }
    );
  }

  try {
    const tasks = await getOrganizationTasks(organizationId);
    return NextResponse.json({ data: tasks });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load organization tasks" },
      { status: 500 }
    );
  }
}

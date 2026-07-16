import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { getOrganizationRoles } from "@/lib/server/services/organization.service";

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
    const roles = await getOrganizationRoles(organizationId);
    return NextResponse.json({ data: roles });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load roles" },
      { status: 500 }
    );
  }
}

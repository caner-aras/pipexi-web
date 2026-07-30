import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { resetOrganizationMemberPassword } from "@/lib/server/services/organization-member-password.service";

export async function POST(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ organizationId: string; memberId: string }>;
  }
) {
  const { organizationId, memberId } = await params;

  if (!organizationId || !memberId) {
    return NextResponse.json(
      { message: "Organization id and member id are required" },
      { status: 400 }
    );
  }

  try {
    await resetOrganizationMemberPassword(organizationId, memberId);
    return NextResponse.json({ data: null });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to send password reset link" },
      { status: 500 }
    );
  }
}

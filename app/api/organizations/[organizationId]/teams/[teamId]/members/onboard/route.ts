import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { onboardTeamMember } from "@/lib/server/services/organization.service";
import type { OnboardTeamMemberInput } from "@/types/team";

export async function POST(
  request: Request,
  {
    params,
  }: { params: Promise<{ organizationId: string; teamId: string }> }
) {
  const { organizationId, teamId } = await params;

  if (!organizationId || !teamId) {
    return NextResponse.json(
      { message: "Organization id and team id are required" },
      { status: 400 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const payload = body as Partial<OnboardTeamMemberInput>;

  if (
    !payload.email ||
    !payload.firstName ||
    !payload.lastName ||
    !payload.roleId ||
    !payload.jobTitle
  ) {
    return NextResponse.json(
      {
        message:
          "email, firstName, lastName, roleId, and jobTitle are required",
      },
      { status: 400 }
    );
  }

  const input: OnboardTeamMemberInput = {
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    roleId: payload.roleId,
    jobTitle: payload.jobTitle,
    phone: payload.phone ?? null,
    avatarUrl: payload.avatarUrl ?? null,
    authProviderId: payload.authProviderId ?? null,
  };

  try {
    const member = await onboardTeamMember(organizationId, teamId, input);
    return NextResponse.json({ data: member });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to onboard team member" },
      { status: 500 }
    );
  }
}

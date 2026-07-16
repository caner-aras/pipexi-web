import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { updateOrganizationTeam } from "@/lib/server/services/organization.service";

export async function PUT(
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

  const payload = body as {
    name?: string;
    managerMemberId?: string;
    status?: string;
  };

  if (!payload.name?.trim()) {
    return NextResponse.json({ message: "Team name is required." }, { status: 400 });
  }

  if (!payload.managerMemberId?.trim()) {
    return NextResponse.json(
      { message: "Manager member id is required." },
      { status: 400 }
    );
  }

  if (!payload.status?.trim()) {
    return NextResponse.json({ message: "Status is required." }, { status: 400 });
  }

  try {
    const team = await updateOrganizationTeam(organizationId, teamId, {
      name: payload.name.trim(),
      managerMemberId: payload.managerMemberId.trim(),
      status: payload.status.trim(),
    });

    return NextResponse.json({ data: team });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json({ message: "Failed to update team." }, { status: 500 });
  }
}

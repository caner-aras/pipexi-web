import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { getOrganizationFormTemplates } from "@/lib/server/services/form-template.service";
import {
  getOrganizationMembers,
  getOrganizationTeams,
} from "@/lib/server/services/organization.service";

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
    const [teams, members, formTemplates] = await Promise.all([
      getOrganizationTeams(organizationId),
      getOrganizationMembers(organizationId),
      getOrganizationFormTemplates(organizationId),
    ]);

    return NextResponse.json({
      data: {
        teams,
        members,
        formTemplates,
      },
    });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load shift create options." },
      { status: 500 }
    );
  }
}

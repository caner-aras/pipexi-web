import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  getOrganizationMemberProfile,
  upsertOrganizationMemberProfile,
} from "@/lib/server/services/organization-member-profile.service";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ organizationId: string; organizationMemberId: string }>;
  }
) {
  const { organizationId, organizationMemberId } = await params;

  if (!organizationId || !organizationMemberId) {
    return NextResponse.json(
      { message: "Organization id and organization member id are required" },
      { status: 400 }
    );
  }

  try {
    const profile = await getOrganizationMemberProfile(
      organizationId,
      organizationMemberId
    );
    return NextResponse.json({ data: profile });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load member profile" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ organizationId: string; organizationMemberId: string }>;
  }
) {
  const { organizationId, organizationMemberId } = await params;

  if (!organizationId || !organizationMemberId) {
    return NextResponse.json(
      { message: "Organization id and organization member id are required" },
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

  const payload = body as Record<string, unknown>;

  try {
    const profile = await upsertOrganizationMemberProfile(
      organizationId,
      organizationMemberId,
      {
        dateOfBirth:
          typeof payload.dateOfBirth === "string" ? payload.dateOfBirth : null,
        gender: typeof payload.gender === "string" ? payload.gender : null,
        addressLine1:
          typeof payload.addressLine1 === "string" ? payload.addressLine1 : null,
        addressLine2:
          typeof payload.addressLine2 === "string" ? payload.addressLine2 : null,
        city: typeof payload.city === "string" ? payload.city : null,
        state: typeof payload.state === "string" ? payload.state : null,
        postalCode:
          typeof payload.postalCode === "string" ? payload.postalCode : null,
        country: typeof payload.country === "string" ? payload.country : null,
        emergencyContactName:
          typeof payload.emergencyContactName === "string"
            ? payload.emergencyContactName
            : null,
        emergencyContactPhone:
          typeof payload.emergencyContactPhone === "string"
            ? payload.emergencyContactPhone
            : null,
        nationalId:
          typeof payload.nationalId === "string" ? payload.nationalId : null,
      }
    );

    return NextResponse.json({ data: profile });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to save member profile" },
      { status: 500 }
    );
  }
}

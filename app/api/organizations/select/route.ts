import { NextResponse } from "next/server";

import { BackendApiError, backendFetch } from "@/lib/server/api-client";
import { SELECTED_ORGANIZATION_COOKIE } from "@/types/organization";
import type { Organization } from "@/types/auth";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const organizationId =
    typeof body === "object" &&
    body !== null &&
    "organizationId" in body &&
    typeof body.organizationId === "string"
      ? body.organizationId
      : null;

  if (!organizationId) {
    return NextResponse.json(
      { message: "organizationId is required" },
      { status: 400 }
    );
  }

  try {
    const organizations = await backendFetch<Organization[]>("/organizations");
    const organization = organizations.find((org) => org.id === organizationId);

    if (!organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      message: "Organization selected",
      data: { organizationId: organization.id },
    });

    response.cookies.set(SELECTED_ORGANIZATION_COOKIE, organization.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to select organization" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  getOrganization,
  updateOrganization,
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
    const organization = await getOrganization(organizationId);
    return NextResponse.json({ data: organization });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load organization" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
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
    const body = (await request.json()) as {
      name?: string;
      slug?: string;
      timezone?: string;
    };

    if (!body.name?.trim() || !body.slug?.trim() || !body.timezone?.trim()) {
      return NextResponse.json(
        { message: "Name, slug, and timezone are required." },
        { status: 400 }
      );
    }

    const organization = await updateOrganization(organizationId, {
      name: body.name.trim(),
      slug: body.slug.trim(),
      timezone: body.timezone.trim(),
    });

    return NextResponse.json({ data: organization });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update organization" },
      { status: 500 }
    );
  }
}

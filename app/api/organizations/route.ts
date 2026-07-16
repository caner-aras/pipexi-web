import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { createOrganization } from "@/lib/server/services/organization.service";

export async function POST(request: Request) {
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
    slug?: string;
    timezone?: string;
  };

  if (!payload.name?.trim() || !payload.slug?.trim() || !payload.timezone?.trim()) {
    return NextResponse.json(
      { message: "Name, slug, and timezone are required." },
      { status: 400 }
    );
  }

  try {
    const organization = await createOrganization({
      name: payload.name.trim(),
      slug: payload.slug.trim(),
      timezone: payload.timezone.trim(),
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
      { message: "Failed to create organization." },
      { status: 500 }
    );
  }
}

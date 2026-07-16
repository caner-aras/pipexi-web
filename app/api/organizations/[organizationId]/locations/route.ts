import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  createOrganizationLocation,
  getOrganizationLocations,
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
    const locations = await getOrganizationLocations(organizationId);
    return NextResponse.json({ data: locations });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load locations" },
      { status: 500 }
    );
  }
}

export async function POST(
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
    address?: string;
    latitude?: number;
    longitude?: number;
    geofenceRadiusMeters?: number;
    timezone?: string;
  };

  if (!payload.name?.trim()) {
    return NextResponse.json({ message: "Name is required." }, { status: 400 });
  }

  if (!payload.address?.trim()) {
    return NextResponse.json({ message: "Address is required." }, { status: 400 });
  }

  if (!payload.timezone?.trim()) {
    return NextResponse.json({ message: "Timezone is required." }, { status: 400 });
  }

  if (
    typeof payload.latitude !== "number" ||
    typeof payload.longitude !== "number" ||
    typeof payload.geofenceRadiusMeters !== "number"
  ) {
    return NextResponse.json(
      { message: "Latitude, longitude, and geofence radius are required." },
      { status: 400 }
    );
  }

  try {
    const location = await createOrganizationLocation(organizationId, {
      organizationId,
      name: payload.name.trim(),
      address: payload.address.trim(),
      latitude: payload.latitude,
      longitude: payload.longitude,
      geofenceRadiusMeters: payload.geofenceRadiusMeters,
      timezone: payload.timezone.trim(),
    });

    return NextResponse.json({ data: location });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create location." },
      { status: 500 }
    );
  }
}

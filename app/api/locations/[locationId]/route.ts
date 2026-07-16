import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  deleteLocation,
  updateLocation,
} from "@/lib/server/services/location.service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const { locationId } = await params;

  if (!locationId) {
    return NextResponse.json(
      { message: "Location id is required" },
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
    const location = await updateLocation(locationId, {
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
      { message: "Failed to update location." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const { locationId } = await params;

  if (!locationId) {
    return NextResponse.json(
      { message: "Location id is required" },
      { status: 400 }
    );
  }

  try {
    await deleteLocation(locationId);
    return NextResponse.json({ data: true });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete location." },
      { status: 500 }
    );
  }
}

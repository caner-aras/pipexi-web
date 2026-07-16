import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { updateUser } from "@/lib/server/services/user.service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ message: "User id is required" }, { status: 400 });
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
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
  };

  if (!payload.firstName?.trim() || !payload.lastName?.trim()) {
    return NextResponse.json(
      { message: "First name and last name are required." },
      { status: 400 }
    );
  }

  try {
    const user = await updateUser(userId, {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      phone: payload.phone?.trim() ?? "",
      avatarUrl: payload.avatarUrl?.trim() ?? "",
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update profile." },
      { status: 500 }
    );
  }
}

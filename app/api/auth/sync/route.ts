import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { syncProfileWithBackend } from "@/lib/server/services/auth.service";
import type { SyncProfileInput } from "@/types/auth";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const input = (body ?? {}) as SyncProfileInput;

  try {
    const profile = await syncProfileWithBackend({
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      avatarUrl: input.avatarUrl,
    });

    return NextResponse.json({ data: profile });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to sync profile." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { getCurrentUser } from "@/lib/server/services/auth.service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ data: user });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load user profile." },
      { status: 500 }
    );
  }
}

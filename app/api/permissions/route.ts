import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { getPermissions } from "@/lib/server/services/permission.service";

export async function GET() {
  try {
    const permissions = await getPermissions();
    return NextResponse.json({ data: permissions });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load permissions." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";

import { BackendApiError } from "@/lib/server/api-client";
import { requestPasswordReset } from "@/lib/server/services/auth.service";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Please enter a valid email address";
    return NextResponse.json({ message }, { status: 400 });
  }

  try {
    await requestPasswordReset(parsed.data.email);
    return NextResponse.json({ data: null });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to send reset email" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

import { loginSchema } from "@/lib/validations/auth";
import { BackendApiError } from "@/lib/server/api-client";
import { loginWithBackend } from "@/lib/server/services/auth.service";
import { ACCESS_TOKEN_COOKIE } from "@/types/auth";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Invalid credentials";
    return NextResponse.json({ message }, { status: 400 });
  }

  try {
    const tokenData = await loginWithBackend(parsed.data);

    const response = NextResponse.json({ message: "Login successful" });

    response.cookies.set(ACCESS_TOKEN_COOKIE, tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 401 }
      );
    }

    return NextResponse.json(
      { message: "Authentication failed" },
      { status: 500 }
    );
  }
}

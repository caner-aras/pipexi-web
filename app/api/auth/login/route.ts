import { NextResponse } from "next/server";

import { loginSchema } from "@/lib/validations/auth";
import { BackendApiError } from "@/lib/server/api-client";
import { setAuthCookies } from "@/lib/server/auth-cookies";
import { loginWithBackend } from "@/lib/server/services/auth.service";

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

    setAuthCookies(response.cookies, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
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

import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { BackendApiError } from "@/lib/server/api-client";
import { setAuthCookies } from "@/lib/server/auth-cookies";
import { registerWithBackend } from "@/lib/server/services/auth.service";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid registration details";
    return NextResponse.json({ message }, { status: 400 });
  }

  try {
    const registerData = await registerWithBackend(parsed.data);

    const response = NextResponse.json({
      message: "Registration successful",
      userId: registerData.user_id,
      email: registerData.email,
    });

    if (registerData.access_token) {
      setAuthCookies(response.cookies, {
        accessToken: registerData.access_token,
        refreshToken: registerData.refresh_token,
        expiresIn: registerData.expires_in,
      });
    }

    return response;
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 400 }
      );
    }

    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { BackendApiError } from "@/lib/server/api-client";
import { registerWithBackend } from "@/lib/server/services/auth.service";
import { ACCESS_TOKEN_COOKIE } from "@/types/auth";

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
      email: registerData.email
    });

    if (registerData.access_token) {
      response.cookies.set(ACCESS_TOKEN_COOKIE, registerData.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
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

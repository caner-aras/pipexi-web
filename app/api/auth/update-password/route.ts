import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/types/auth";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const password =
    typeof body === "object" &&
    body !== null &&
    "password" in body &&
    typeof (body as { password?: unknown }).password === "string"
      ? (body as { password: string }).password
      : null;

  if (!password || password.length < 6) {
    return NextResponse.json(
      { message: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: "Recovery session expired. Request a new reset link." },
      { status: 401 }
    );
  }

  const supabaseUrl =
    process.env.SUPABASE_URL || "https://niqqiurqcutcanlehsop.supabase.co";
  const anonApiKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (!anonApiKey) {
    return NextResponse.json(
      { message: "Auth configuration is missing." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/user`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: anonApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
      cache: "no-store",
    });

    if (!response.ok) {
      const responseBody = await response.text();
      let message = "Failed to update password.";

      try {
        const parsed = JSON.parse(responseBody) as {
          msg?: string;
          message?: string;
          error_description?: string;
        };
        message =
          parsed.msg ||
          parsed.message ||
          parsed.error_description ||
          message;
      } catch {
        // keep default message
      }

      return NextResponse.json({ message }, { status: response.status });
    }

    return NextResponse.json({ data: null });
  } catch {
    return NextResponse.json(
      { message: "Failed to update password." },
      { status: 500 }
    );
  }
}

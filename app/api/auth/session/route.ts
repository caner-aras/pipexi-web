import { NextResponse } from "next/server";

import { setAuthCookies } from "@/lib/server/auth-cookies";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      accessToken?: string;
      refreshToken?: string | null;
      expiresIn?: number | null;
    };

    if (!body.accessToken) {
      return NextResponse.json({ message: "Access token is required" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });

    setAuthCookies(response.cookies, {
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
      expiresIn: body.expiresIn,
    });

    return response;
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }
}

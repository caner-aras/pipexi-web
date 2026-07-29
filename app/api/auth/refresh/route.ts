import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { clearAuthCookies, setAuthCookies } from "@/lib/server/auth-cookies";
import { refreshWithBackend } from "@/lib/server/services/auth.service";
import { REFRESH_TOKEN_COOKIE } from "@/types/auth";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    const response = NextResponse.json({ message: "No refresh token" }, { status: 401 });
    clearAuthCookies(response.cookies);
    return response;
  }

  try {
    const tokenData = await refreshWithBackend(refreshToken);

    const response = NextResponse.json({ message: "Token refreshed" });
    setAuthCookies(response.cookies, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
    });
    return response;
  } catch (error) {
    const response = NextResponse.json(
      {
        message:
          error instanceof BackendApiError ? error.message : "Failed to refresh session",
      },
      { status: 401 }
    );
    clearAuthCookies(response.cookies);
    return response;
  }
}

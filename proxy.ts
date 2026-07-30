import { NextResponse, type NextRequest } from "next/server";

import { isAccessTokenValid } from "@/lib/auth/jwt";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/types/auth";

const LOGIN_PATH = "/login";
const REGISTER_PATH = "/register";
const FORGOT_PASSWORD_PATH = "/forgot-password";
const RESET_PASSWORD_PATH = "/reset-password";
const ONBOARDING_PATH = "/onboarding";
const DASHBOARD_PATH = "/dashboard";

function hasValidSession(request: NextRequest): boolean {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (accessToken && isAccessTokenValid(accessToken)) {
    return true;
  }

  // Access missing/expired but refresh present → recoverable session.
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  return Boolean(refreshToken);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = hasValidSession(request);

  if (pathname.startsWith("/api") || pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    return NextResponse.next();
  }

  if (pathname.startsWith(ONBOARDING_PATH)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    }

    return NextResponse.next();
  }

  // Recovery session must reach this page while authenticated.
  if (pathname.startsWith(RESET_PASSWORD_PATH)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL(FORGOT_PASSWORD_PATH, request.url));
    }

    return NextResponse.next();
  }

  if (
    pathname.startsWith(LOGIN_PATH) ||
    pathname.startsWith(REGISTER_PATH) ||
    pathname.startsWith(FORGOT_PASSWORD_PATH)
  ) {
    if (isAuthenticated) {
      if (pathname.startsWith(REGISTER_PATH)) {
        return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
      }

      return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
    }

    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};

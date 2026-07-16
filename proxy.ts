import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/types/auth";

const LOGIN_PATH = "/login";
const REGISTER_PATH = "/register";
const FORGOT_PASSWORD_PATH = "/forgot-password";
const CALLBACK_PATH = "/auth/callback";
const DASHBOARD_PATH = "/dashboard";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = !!request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (pathname.startsWith("/api") || pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    return NextResponse.next();
  }

  if (
    pathname.startsWith(LOGIN_PATH) ||
    pathname.startsWith(REGISTER_PATH) ||
    pathname.startsWith(FORGOT_PASSWORD_PATH)
  ) {
    if (isAuthenticated) {
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

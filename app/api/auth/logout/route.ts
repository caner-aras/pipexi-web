import { NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/types/auth";

function clearAccessTokenCookie(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  clearAccessTokenCookie(response);
  return response;
}

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(new URL("/login", origin));
  clearAccessTokenCookie(response);
  return response;
}

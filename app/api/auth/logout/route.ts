import { NextResponse } from "next/server";

import { clearAuthCookies } from "@/lib/server/auth-cookies";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  clearAuthCookies(response.cookies);
  return response;
}

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(new URL("/login", origin));
  clearAuthCookies(response.cookies);
  return response;
}

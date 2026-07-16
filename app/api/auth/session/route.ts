import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/types/auth";

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ message: "Access token is required" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });

    // Set the httpOnly secure cookie containing the accessToken
    response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }
}

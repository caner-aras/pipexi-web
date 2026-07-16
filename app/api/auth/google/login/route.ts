import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  const supabaseUrl = process.env.SUPABASE_URL || "https://niqqiurqcutcanlehsop.supabase.co";

  // Construct Supabase Google authorize URL.
  // We let Supabase use Implicit Flow so it returns access_token in URL hash fragment for client parsing.
  const redirectUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
    `${origin}/auth/callback`
  )}`;

  return NextResponse.redirect(redirectUrl);
}

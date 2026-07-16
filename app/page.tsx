import type { Metadata } from "next";
import { cookies } from "next/headers";

import { LandingPage } from "@/components/landing/landing-page";
import { getCurrentUser } from "@/lib/server/services/auth.service";
import { ACCESS_TOKEN_COOKIE, type AuthUser } from "@/types/auth";

export const metadata: Metadata = {
  title: "Pipexi — One place to run every workday",
  description:
    "Schedule shifts, track time, assign tasks, and keep frontline teams in sync with Pipexi.",
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  let user: AuthUser | null = null;
  if (token) {
    try {
      user = await getCurrentUser();
    } catch {
      user = null;
    }
  }

  return <LandingPage user={user} />;
}

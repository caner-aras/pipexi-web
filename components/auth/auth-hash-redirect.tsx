"use client";

import { useEffect } from "react";

/**
 * Supabase recovery/magic links may land on Site URL (/) with tokens in the hash.
 * Forward them to /auth/callback so the app can finish the flow.
 */
export function AuthHashRedirect() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) {
      return;
    }

    const params = new URLSearchParams(hash.slice(1));
    const type = params.get("type");
    const accessToken = params.get("access_token");

    if (!accessToken) {
      return;
    }

    if (type === "recovery" || type === "signup" || type === "invite" || type === "magiclink") {
      window.location.replace(`/auth/callback${hash}`);
    }
  }, []);

  return null;
}

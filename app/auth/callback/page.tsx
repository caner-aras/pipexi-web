"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { decodeJwtPayload } from "@/lib/auth/jwt";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Defer so setState is not synchronous inside the effect body.
      await Promise.resolve();
      if (cancelled) {
        return;
      }

      const hash = window.location.hash;
      if (!hash) {
        router.push("/login");
        return;
      }

      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const expiresInRaw = params.get("expires_in");
      const expiresIn = expiresInRaw ? Number(expiresInRaw) : null;

      if (!accessToken) {
        setError("No access token found in auth response.");
        return;
      }

      try {
        const sessionRes = await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken,
            refreshToken,
            expiresIn: Number.isFinite(expiresIn) ? expiresIn : null,
          }),
        });

        if (!sessionRes.ok) {
          throw new Error("Failed to set session cookie.");
        }

        const payloadJson = decodeJwtPayload(accessToken);
        if (!payloadJson) {
          throw new Error("Invalid JWT token format.");
        }

        const userMetadata =
          (payloadJson.user_metadata as
            | {
                full_name?: string;
                given_name?: string;
                family_name?: string;
                avatar_url?: string | null;
              }
            | undefined) || {};

        const fullName = userMetadata.full_name || "";
        const nameParts = fullName.trim().split(/\s+/);
        const firstName =
          userMetadata.given_name || nameParts[0] || "Google User";
        const lastName =
          userMetadata.family_name || nameParts.slice(1).join(" ") || "";

        const syncRes = await fetch("/api/auth/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: typeof payloadJson.email === "string" ? payloadJson.email : undefined,
            firstName,
            lastName,
            avatarUrl: userMetadata.avatar_url || null,
            phone: typeof payloadJson.phone === "string" ? payloadJson.phone : null,
          }),
        });

        if (!syncRes.ok) {
          throw new Error("Failed to sync profile with backend.");
        }

        if (cancelled) {
          return;
        }

        router.push("/dashboard");
        router.refresh();
      } catch (err: unknown) {
        if (cancelled) {
          return;
        }
        setError(err instanceof Error ? err.message : "Authentication failed.");
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold text-destructive">Authentication Error</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-6 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Return to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <Loader2 className="size-8 animate-spin text-[#e86a3d]" />
      <p className="mt-4 text-sm font-bold text-zinc-600">Completing sign in...</p>
    </div>
  );
}

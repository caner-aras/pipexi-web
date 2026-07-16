"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      router.push("/login");
      return;
    }

    const params = new URLSearchParams(hash.substring(1)); // remove '#'
    const accessToken = params.get("access_token");

    if (!accessToken) {
      setError("No access token found in auth response.");
      return;
    }

    async function handleAuth() {
      if (!accessToken) return;
      try {
        // 1. Set session cookie on Next.js server
        const sessionRes = await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accessToken }),
        });

        if (!sessionRes.ok) {
          throw new Error("Failed to set session cookie.");
        }

        // 2. Extract metadata from JWT payload
        const payloadBase64 = accessToken.split(".")[1];
        if (!payloadBase64) {
          throw new Error("Invalid JWT token format.");
        }
        
        // Decode base64url
        const decodedPayload = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
        const payloadJson = JSON.parse(decodedPayload);
        const userMetadata = payloadJson.user_metadata || {};
        
        const fullName = userMetadata.full_name || "";
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = userMetadata.given_name || nameParts[0] || "Google User";
        const lastName = userMetadata.family_name || nameParts.slice(1).join(" ") || "";

        // 3. Call C# backend profile sync endpoint via Next.js proxy
        const syncRes = await fetch("/api/auth/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: payloadJson.email,
            firstName,
            lastName,
            avatarUrl: userMetadata.avatar_url || null,
            phone: payloadJson.phone || null,
          }),
        });

        if (!syncRes.ok) {
          throw new Error("Failed to sync profile with backend.");
        }

        // 4. Redirect to dashboard
        router.push("/dashboard");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Authentication failed.");
      }
    }

    handleAuth();
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

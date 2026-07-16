"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const LOGOUT_PATH = "/api/auth/logout";
const LOGIN_PATH = "/api/auth/login";
const ME_PATH = "/api/auth/me";

function shouldHandleUnauthorized(input: RequestInfo | URL): boolean {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  if (!url.startsWith("/") && !url.startsWith(window.location.origin)) {
    return false;
  }

  const path = url.startsWith("http") ? new URL(url).pathname : url;

  return (
    path.startsWith("/api/") &&
    !path.startsWith(LOGIN_PATH) &&
    !path.startsWith(LOGOUT_PATH)
  );
}

export function UnauthorizedHandler() {
  const pathname = usePathname();

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    let isRedirecting = false;

    const logout = () => {
      if (isRedirecting) {
        return;
      }

      isRedirecting = true;
      window.location.assign(LOGOUT_PATH);
    };

    window.fetch = async (input, init) => {
      const response = await originalFetch(input, init);

      if (response.status === 401 && shouldHandleUnauthorized(input)) {
        logout();
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      try {
        const response = await fetch(ME_PATH, {
          method: "GET",
          cache: "no-store",
        });

        if (!cancelled && response.status === 401) {
          window.location.assign(LOGOUT_PATH);
        }
      } catch {
        // Network errors should not force logout.
      }
    }

    void verifySession();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}

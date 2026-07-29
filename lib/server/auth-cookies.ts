import "server-only";

import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/types/auth";

export const DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60;
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type CookieStoreLike = {
  set: (name: string, value: string, options?: Partial<ResponseCookie>) => unknown;
};

function baseCookieOptions(maxAge: number): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

export function getAccessTokenMaxAgeSeconds(expiresIn?: number | null): number {
  if (typeof expiresIn === "number" && Number.isFinite(expiresIn) && expiresIn > 0) {
    return Math.floor(expiresIn);
  }

  return DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS;
}

export function getJwtExpiresInSeconds(accessToken: string): number | null {
  try {
    const payloadPart = accessToken.split(".")[1];
    if (!payloadPart) {
      return null;
    }

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded)) as { exp?: number };
    if (typeof payload.exp !== "number") {
      return null;
    }

    const seconds = payload.exp - Math.floor(Date.now() / 1000);
    return seconds > 0 ? seconds : null;
  } catch {
    return null;
  }
}

export function setAuthCookies(
  cookieStore: CookieStoreLike,
  input: {
    accessToken: string;
    refreshToken?: string | null;
    expiresIn?: number | null;
  }
) {
  const accessMaxAge = getAccessTokenMaxAgeSeconds(
    input.expiresIn ?? getJwtExpiresInSeconds(input.accessToken)
  );

  cookieStore.set(ACCESS_TOKEN_COOKIE, input.accessToken, baseCookieOptions(accessMaxAge));

  if (input.refreshToken) {
    cookieStore.set(
      REFRESH_TOKEN_COOKIE,
      input.refreshToken,
      baseCookieOptions(REFRESH_TOKEN_MAX_AGE_SECONDS)
    );
  }
}

export function clearAuthCookies(cookieStore: CookieStoreLike) {
  cookieStore.set(ACCESS_TOKEN_COOKIE, "", baseCookieOptions(0));
  cookieStore.set(REFRESH_TOKEN_COOKIE, "", baseCookieOptions(0));
}

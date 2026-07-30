import "server-only";

import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

import { getJwtExpiresInSeconds } from "@/lib/auth/jwt";
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

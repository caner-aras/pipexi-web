import "server-only";

import { cookies } from "next/headers";

import { setAuthCookies } from "@/lib/server/auth-cookies";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  type LoginTokenData,
} from "@/types/auth";
import { SELECTED_ORGANIZATION_COOKIE } from "@/types/organization";
import type { BackendErrorPayload, BackendResponse } from "@/types/api";

export const ORGANIZATION_ID_HEADER = "X-Organization-Id";

export class BackendApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public error: BackendErrorPayload | string | null = null
  ) {
    super(message);
    this.name = "BackendApiError";
  }
}

function getBackendBaseUrl(): string {
  const baseUrl = process.env.BACKEND_API_URL;

  if (!baseUrl) {
    throw new BackendApiError(
      process.env.NODE_ENV === "development"
        ? "BACKEND_API_URL is not set. Add it to .env.local"
        : "Server configuration error",
      500
    );
  }

  return baseUrl.replace(/\/$/, "");
}

function parseErrorMessage(
  error: BackendErrorPayload | string | null
): string {
  if (!error) {
    return "Request failed";
  }

  const rawMessage =
    typeof error === "string"
      ? error
      : error.message ?? error.title ?? "Request failed";

  if (rawMessage && typeof rawMessage === "string") {
    const trimmed = rawMessage.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object") {
          return (
            parsed.msg ||
            parsed.message ||
            parsed.error_description ||
            parsed.title ||
            rawMessage
          );
        }
      } catch {
        // Fallback to raw message if parsing fails
      }
    }
  }

  return rawMessage;
}

type BackendFetchOptions = RequestInit & {
  skipAuth?: boolean;
  _retried?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

async function exchangeRefreshToken(refreshToken: string): Promise<LoginTokenData> {
  const response = await fetch(`${getBackendBaseUrl()}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });

  let body: BackendResponse<LoginTokenData>;
  try {
    body = (await response.json()) as BackendResponse<LoginTokenData>;
  } catch {
    throw new BackendApiError("Invalid refresh response", response.status);
  }

  const statusCode = body.statusCode ?? response.status;
  if (!response.ok || !body.isSuccess || !body.data) {
    throw new BackendApiError(
      parseErrorMessage(body.error) || "Failed to refresh session",
      statusCode,
      body.error
    );
  }

  return body.data;
}

async function refreshSessionAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    return null;
  }

  try {
    const tokenData = await exchangeRefreshToken(refreshToken);

    try {
      setAuthCookies(cookieStore, {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
      });
    } catch {
      // Cookie mutation may be unavailable outside route handlers/actions.
    }

    return tokenData.access_token;
  } catch {
    return null;
  }
}

function ensureSessionRefreshed(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshSessionAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function backendFetch<T>(
  path: string,
  options: BackendFetchOptions = {}
): Promise<T> {
  const {
    skipAuth = false,
    _retried = false,
    headers: customHeaders,
    ...fetchOptions
  } = options;
  const headers = new Headers(customHeaders);

  if (!headers.has("Content-Type") && fetchOptions.body) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (!headers.has(ORGANIZATION_ID_HEADER)) {
      const selectedOrganizationId = cookieStore.get(
        SELECTED_ORGANIZATION_COOKIE
      )?.value;

      if (selectedOrganizationId) {
        headers.set(ORGANIZATION_ID_HEADER, selectedOrganizationId);
      }
    }
  }

  const response = await fetch(`${getBackendBaseUrl()}${path}`, {
    ...fetchOptions,
    headers,
    cache: "no-store",
  });

  let body: BackendResponse<T>;

  try {
    body = (await response.json()) as BackendResponse<T>;
  } catch {
    if (response.status === 401) {
      throw new BackendApiError("Unauthorized", 401);
    }

    throw new BackendApiError("Invalid response from server", response.status);
  }

  const statusCode = body.statusCode ?? response.status;

  if (statusCode === 401 && !skipAuth && !_retried) {
    const nextAccessToken = await ensureSessionRefreshed();
    if (nextAccessToken) {
      return backendFetch<T>(path, { ...options, _retried: true });
    }

    throw new BackendApiError(
      parseErrorMessage(body.error) || "Unauthorized",
      401,
      body.error
    );
  }

  if (statusCode === 401) {
    throw new BackendApiError(
      parseErrorMessage(body.error) || "Unauthorized",
      401,
      body.error
    );
  }

  if (!response.ok || !body.isSuccess) {
    throw new BackendApiError(
      parseErrorMessage(body.error),
      statusCode,
      body.error
    );
  }

  return body.data;
}

import "server-only";

import { cookies } from "next/headers";

import { ACCESS_TOKEN_COOKIE } from "@/types/auth";
import type { BackendErrorPayload, BackendResponse } from "@/types/api";

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

  if (typeof error === "string") {
    return error;
  }

  return error.message ?? error.title ?? "Request failed";
}

type BackendFetchOptions = RequestInit & {
  skipAuth?: boolean;
};

export async function backendFetch<T>(
  path: string,
  options: BackendFetchOptions = {}
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...fetchOptions } = options;
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

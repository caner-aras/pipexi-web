import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type { AuthUser, LoginCredentials, LoginTokenData, RegisterCredentials, RegisterResponse } from "@/types/auth";

export async function loginWithBackend(
  credentials: LoginCredentials
): Promise<LoginTokenData> {
  return backendFetch<LoginTokenData>("/auth/token", {
    method: "POST",
    body: JSON.stringify(credentials),
    skipAuth: true,
  });
}

export async function registerWithBackend(
  credentials: RegisterCredentials
): Promise<RegisterResponse> {
  return backendFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(credentials),
    skipAuth: true,
  });
}

export async function getCurrentUser(): Promise<AuthUser> {
  return backendFetch<AuthUser>("/auth/me");
}

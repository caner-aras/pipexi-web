import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type {
  AuthUser,
  LoginCredentials,
  LoginTokenData,
  RegisterCredentials,
  RegisterResponse,
  SyncProfileInput,
  SyncProfileResponse,
} from "@/types/auth";

export async function loginWithBackend(
  credentials: LoginCredentials
): Promise<LoginTokenData> {
  return backendFetch<LoginTokenData>("/auth/token", {
    method: "POST",
    body: JSON.stringify(credentials),
    skipAuth: true,
  });
}

export async function refreshWithBackend(
  refreshToken: string
): Promise<LoginTokenData> {
  return backendFetch<LoginTokenData>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
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

export async function requestPasswordReset(email: string): Promise<void> {
  await backendFetch<null>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipAuth: true,
  });
}

export async function getCurrentUser(): Promise<AuthUser> {
  return backendFetch<AuthUser>("/auth/me");
}

export async function syncProfileWithBackend(
  input: SyncProfileInput
): Promise<SyncProfileResponse> {
  return backendFetch<SyncProfileResponse>("/auth/sync", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

import "server-only";

import { redirect } from "next/navigation";

import { BackendApiError } from "@/lib/server/api-client";

export function redirectIfUnauthorized(error: unknown): void {
  if (error instanceof BackendApiError && error.statusCode === 401) {
    redirect("/api/auth/logout");
  }
}

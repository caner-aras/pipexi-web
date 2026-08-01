import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? "";

export function isServerSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Server-only Supabase client authenticated as the current user JWT.
 * Never import this into client components.
 */
export function createUserScopedSupabaseClient(
  accessToken: string
): SupabaseClient {
  if (!isServerSupabaseConfigured()) {
    throw new Error(
      "SUPABASE_URL or SUPABASE_ANON_KEY is not configured on the server."
    );
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  return client;
}

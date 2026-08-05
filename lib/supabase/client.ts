import { createClient } from "@supabase/supabase-js";

// This file is strictly for server-side use. Exposing these variables on the client is unsafe.
const supabaseUrl = process.env.SUPABASE_URL || "https://niqqiurqcutcanlehsop.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

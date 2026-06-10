import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Optional production backend. The prototype runs fully without it (menu is
// seeded locally; orders + 86 toggles sync across tabs via BroadcastChannel).
// Drop NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY into
// .env.local, run supabase-schema.sql, and this client lights up — wire it
// into orders.ts / menuStore.ts to swap BroadcastChannel for Supabase Realtime.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;

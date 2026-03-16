import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Lazy singleton — only created when actually used (client-side)
let _supabase = null;

export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

// Keep named export for backward compat via Proxy
export const supabase = new Proxy(
  {},
  {
    get(_, prop) {
      return getSupabase()[prop];
    },
  }
);

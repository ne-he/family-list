import { createClient } from '@supabase/supabase-js'

// Ambil URL & Key dari file .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Buat client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

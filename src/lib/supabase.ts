import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// For local development without real Supabase, use mock credentials
const isProduction = supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey && supabaseAnonKey !== 'placeholder-anon-key-development';

if (!isProduction) {
    console.warn("⚠️ Using mock Supabase credentials for local development. Set real credentials in .env.local to use actual authentication.");
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key-development',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        }
    }
);

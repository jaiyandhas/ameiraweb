import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Helper to safely access environment variables in Vite / Browser environment
const getEnv = (key: string): string => {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
  if (metaEnv && metaEnv[key]) {
    return metaEnv[key];
  }
  const globalObj = globalThis as unknown as { process?: { env?: Record<string, string> } };
  if (globalObj.process?.env?.[key]) {
    return globalObj.process.env[key];
  }
  return '';
};

export const getSupabaseUrl = (): string => {
  const url = getEnv('VITE_SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL');
  if (!url) {
    throw new Error(
      "Missing Supabase Configuration: VITE_SUPABASE_URL environment variable is required. Please set it in your .env.local file."
    );
  }
  return url;
};

export const getSupabaseKey = (): string => {
  const key = getEnv('VITE_SUPABASE_PUBLISHABLE_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') || getEnv('VITE_SUPABASE_ANON_KEY');
  if (!key) {
    throw new Error(
      "Missing Supabase Configuration: VITE_SUPABASE_PUBLISHABLE_KEY environment variable is required. Please set it in your .env.local file."
    );
  }
  return key;
};

export const createClient = () => {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  return createSupabaseClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

export const supabase = createClient();

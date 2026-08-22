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

export const supabaseUrl = 
  getEnv('VITE_SUPABASE_URL') || 
  getEnv('NEXT_PUBLIC_SUPABASE_URL') || 
  'https://vxxlmonjqqrhmxcsnxhq.supabase.co';

export const supabaseKey = 
  getEnv('VITE_SUPABASE_PUBLISHABLE_KEY') || 
  getEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') || 
  'sb_publishable_y4x9iB4TmtCjQDn2PuT4Ew_wCVrovPE';

export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

export const supabase = createClient();

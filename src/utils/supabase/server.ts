import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseKey } from "./client";

export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseKey);
};

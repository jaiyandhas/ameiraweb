import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl, getSupabaseKey } from "./client";

export const createClient = () => {
  return createSupabaseClient(getSupabaseUrl(), getSupabaseKey());
};

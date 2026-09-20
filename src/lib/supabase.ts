import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env["VITE_SUPABASE_URL"] ??
  "https://clqfylxbmjccwxoxntsb.supabase.co";

const supabasePublishableKey =
  import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
  "sb_publishable_hU9tqYZoml7dUWrn48tJ6w_gQAOmpPV";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
export const SUPABASE_BUCKET = "product-images";

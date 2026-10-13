// Lovable Cloud (Supabase) client — mirrors the path Lovable generates.
// Reads env vars only; never hard-code a URL, key or project id.
// Nothing imports this statically: src/lib/data.ts loads it lazily, and only
// when site.dataSource === "cloud" (build-lessons trap 4). When Taizo's Lovable
// project generates its own client here, the port leaves that file untouched.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

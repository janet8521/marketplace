import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client. Used by client components (catalog realtime,
// cart, login form, dashboard mutations). Reads the public env vars that are
// inlined into the client bundle at build time.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// True only when both public Supabase env vars are present. Used to show a
// friendly setup screen instead of crashing when .env.local is missing.
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

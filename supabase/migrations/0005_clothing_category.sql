-- ============================================================================
-- Add the "Clothing" category.
-- Idempotent: safe to re-run (slug is unique).
-- Run in the Supabase SQL editor (or via the Supabase CLI) on existing projects.
-- ============================================================================

insert into public.categories (name, slug) values
  ('Clothing', 'clothing')
on conflict (slug) do nothing;

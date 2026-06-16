-- ============================================================================
-- Fix products that reference category slugs which were never created.
-- The seed pointed three products at 'home-living' and 'apparel' (neither
-- exists), leaving them with a null category. Repoint them at real categories.
-- Idempotent: re-running is a no-op once the rows are corrected.
-- Run in the Supabase SQL editor (or via the Supabase CLI) on existing projects.
-- ============================================================================

update public.products
   set category_id = (select id from public.categories where slug = 'furniture')
 where slug in ('linen-throw-blanket', 'ceramic-pour-over-set');

update public.products
   set category_id = (select id from public.categories where slug = 'clothing')
 where slug = 'merino-crew-sweater';

-- ============================================================================
-- Virtus — switch the store currency to Kenyan Shillings (KES / KSh)
-- Run in the Supabase SQL editor. Safe to run once.
--
-- Note: this relabels the currency only — it does NOT convert amounts.
-- Set your real shilling prices when adding/editing products.
-- ============================================================================

-- New products default to KES.
alter table public.products alter column currency set default 'KES';

-- Move every existing product onto KES.
update public.products set currency = 'KES';

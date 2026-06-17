-- ============================================================================
-- Virtus — customer-facing order status lookup
-- Run AFTER 0002_roles.sql. Orders are admin-only at the RLS level, so anon
-- customers cannot SELECT them. This security-definer function is the ONE
-- controlled hole: given the short order code (first 8 chars of the id, as
-- shown on the checkout success page) plus the email used at checkout, it
-- returns ONLY that order's status — never the full row, never the table.
-- ============================================================================
create or replace function public.order_status_lookup(p_code text, p_email text)
returns table (status text, created_at timestamptz)
language sql
security definer set search_path = public
stable
as $$
  select o.status, o.created_at
  from public.orders o
  where lower(o.id::text) like lower(trim(p_code)) || '%'
    and lower(o.customer_email) = lower(trim(p_email))
  limit 1;
$$;

-- Callable by anonymous (logged-out) customers and signed-in staff alike.
revoke all on function public.order_status_lookup(text, text) from public;
grant execute on function public.order_status_lookup(text, text) to anon, authenticated;

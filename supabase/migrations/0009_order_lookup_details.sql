-- ============================================================================
-- Thee Brins Safe Market — richer customer-facing order lookup
-- Run AFTER 0008_order_status_lookup.sql.
--
-- 0008 returned only the status + date. Customers coming back to /track also
-- want to see WHAT they ordered and the total, so this widens the controlled
-- hole to include the order total, the customer name (for a friendly greeting),
-- and the line items — still gated by the short order code + the checkout email,
-- and still never exposing the table or other customers' rows.
-- ============================================================================

-- The lookup now returns extra columns, so the old signature is replaced.
drop function if exists public.order_status_lookup(text, text);

create or replace function public.order_lookup(p_code text, p_email text)
returns table (
  status        text,
  created_at    timestamptz,
  total         numeric,
  customer_name text,
  items         jsonb
)
language sql
security definer set search_path = public
stable
as $$
  select
    o.status,
    o.created_at,
    o.total,
    o.customer_name,
    coalesce(
      (
        select jsonb_agg(
                 jsonb_build_object(
                   'product_name', oi.product_name,
                   'unit_price',   oi.unit_price,
                   'quantity',     oi.quantity
                 )
                 order by oi.product_name
               )
        from public.order_items oi
        where oi.order_id = o.id
      ),
      '[]'::jsonb
    ) as items
  from public.orders o
  where lower(o.id::text) like lower(trim(p_code)) || '%'
    and lower(o.customer_email) = lower(trim(p_email))
  limit 1;
$$;

-- Callable by anonymous (logged-out) customers and signed-in staff alike.
revoke all on function public.order_lookup(text, text) from public;
grant execute on function public.order_lookup(text, text) to anon, authenticated;

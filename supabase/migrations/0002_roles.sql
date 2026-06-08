-- ============================================================================
-- Virtus — owner/employee roles
-- Run AFTER 0001_init.sql. Adds a distinction between:
--   • admin  (the owner — you)      → full control incl. delete + orders
--   • employee (limited staff)      → may only add / update products
-- ============================================================================

-- Is the current request the OWNER (admin)? -----------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── Products ────────────────────────────────────────────────────────────────
-- Any staff member may add and edit products; only the owner may delete them.
-- (Replaces the single "employee write" policy from 0001 with finer rules.)
drop policy if exists "products employee write" on public.products;

drop policy if exists "products staff insert" on public.products;
create policy "products staff insert" on public.products
  for insert with check (public.is_employee());

drop policy if exists "products staff update" on public.products;
create policy "products staff update" on public.products
  for update using (public.is_employee()) with check (public.is_employee());

drop policy if exists "products admin delete" on public.products;
create policy "products admin delete" on public.products
  for delete using (public.is_admin());

-- ── Orders ──────────────────────────────────────────────────────────────────
-- Only the owner can read or manage customer orders (employees cannot).
drop policy if exists "orders employee read" on public.orders;
create policy "orders admin read" on public.orders
  for select using (public.is_admin());

drop policy if exists "orders employee update" on public.orders;
create policy "orders admin update" on public.orders
  for update using (public.is_admin());

drop policy if exists "order_items employee read" on public.order_items;
create policy "order_items admin read" on public.order_items
  for select using (public.is_admin());

-- ============================================================================
-- IMPORTANT — make YOURSELF the owner.
-- New accounts are created as 'employee' by default. After you have created
-- your own user (Authentication → Users), run the line below with YOUR email
-- to promote your account to admin. Re-run any time you add a new owner.
-- ============================================================================
update public.profiles
set role = 'admin'
where email = 'kyalojanet671@gmail.com';   -- ← put your login email here

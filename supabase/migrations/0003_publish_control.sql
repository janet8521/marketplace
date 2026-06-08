-- ============================================================================
-- Virtus — publishing is owner-only
-- Run AFTER 0002_roles.sql.
--
-- Employees may add and edit product details (their stock), but they CANNOT
-- decide what appears on the public store:
--   • A product an employee creates is forced to start HIDDEN.
--   • An employee editing a product cannot change its visibility.
-- Only the owner (admin) can publish (make a product live) or hide it.
--
-- This is enforced by a trigger so it holds even if the UI is bypassed.
-- ============================================================================

create or replace function public.enforce_publish_control()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- The owner has full control over visibility.
  if public.is_admin() then
    return new;
  end if;

  -- Non-admins (employees) cannot publish.
  if tg_op = 'INSERT' then
    new.is_active := false;          -- new stock starts hidden, awaiting review
  elsif tg_op = 'UPDATE' then
    new.is_active := old.is_active;  -- visibility is left untouched
  end if;

  return new;
end;
$$;

drop trigger if exists products_publish_control on public.products;
create trigger products_publish_control
  before insert or update on public.products
  for each row execute function public.enforce_publish_control();

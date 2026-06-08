-- ============================================================================
-- Virtus Marketplace — initial schema
-- Run this in the Supabase SQL editor (or via the Supabase CLI) on a fresh
-- project. It creates the tables, row-level-security policies, storage bucket,
-- triggers and realtime publication the app depends on.
-- ============================================================================

-- Extensions -----------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles: one row per authenticated employee (created automatically on signup)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  role        text not null default 'employee' check (role in ('employee', 'admin')),
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- categories
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  description  text,
  price        numeric(12, 2) not null default 0 check (price >= 0),
  currency     text not null default 'USD',
  category_id  uuid references public.categories (id) on delete set null,
  image_url    text,
  stock        integer not null default 0 check (stock >= 0),
  sku          text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_active_idx on public.products (is_active);

-- ----------------------------------------------------------------------------
-- orders + order_items (guest checkout — no customer auth required)
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  customer_name     text not null,
  customer_email    text not null,
  customer_phone    text,
  shipping_address  text not null,
  status            text not null default 'pending'
                       check (status in ('pending', 'paid', 'shipped', 'cancelled')),
  total             numeric(12, 2) not null default 0,
  created_at        timestamptz not null default now()
);

create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_id    uuid references public.products (id) on delete set null,
  product_name  text not null,
  unit_price    numeric(12, 2) not null,
  quantity      integer not null check (quantity > 0)
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ----------------------------------------------------------------------------
-- updated_at trigger for products
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Auto-create a profile row when a new auth user is created
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Helper: is the current request an authenticated employee?
-- (Anyone with a profile row is treated as staff — public signup is disabled.)
-- ----------------------------------------------------------------------------
create or replace function public.is_employee()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles    enable row level security;
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- profiles: an employee can read/update their own profile -------------------
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id);

-- categories: world-readable, employees manage ------------------------------
drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories
  for select using (true);

drop policy if exists "categories employee write" on public.categories;
create policy "categories employee write" on public.categories
  for all using (public.is_employee()) with check (public.is_employee());

-- products: the public sees ACTIVE products; employees see/manage everything -
drop policy if exists "products public read active" on public.products;
create policy "products public read active" on public.products
  for select using (is_active = true or public.is_employee());

drop policy if exists "products employee write" on public.products;
create policy "products employee write" on public.products
  for all using (public.is_employee()) with check (public.is_employee());

-- orders: anyone can place an order (guest checkout); employees read/manage --
drop policy if exists "orders public insert" on public.orders;
create policy "orders public insert" on public.orders
  for insert with check (true);

drop policy if exists "orders employee read" on public.orders;
create policy "orders employee read" on public.orders
  for select using (public.is_employee());

drop policy if exists "orders employee update" on public.orders;
create policy "orders employee update" on public.orders
  for update using (public.is_employee());

-- order_items: inserted alongside the order; employees read -----------------
drop policy if exists "order_items public insert" on public.order_items;
create policy "order_items public insert" on public.order_items
  for insert with check (true);

drop policy if exists "order_items employee read" on public.order_items;
create policy "order_items employee read" on public.order_items
  for select using (public.is_employee());

-- ============================================================================
-- Storage bucket for product images
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product images public read" on storage.objects;
create policy "product images public read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product images employee write" on storage.objects;
create policy "product images employee write" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_employee());

drop policy if exists "product images employee update" on storage.objects;
create policy "product images employee update" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_employee());

drop policy if exists "product images employee delete" on storage.objects;
create policy "product images employee delete" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_employee());

-- ============================================================================
-- Realtime — broadcast product changes to the public catalog
-- ============================================================================
alter publication supabase_realtime add table public.products;

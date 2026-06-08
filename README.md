# Virtus — Modern Marketplace

A modern, professional marketplace where staff manage the catalog from an
authenticated dashboard and **product changes appear on the public storefront
instantly** via Supabase Realtime.

- **Frontend & server:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase — Postgres, Auth, Storage, and Realtime
- **Live updates:** the public catalog subscribes to `products` changes over a
  websocket, so employee edits show up without a refresh.

## Features

| Area | What's included |
| --- | --- |
| **Public storefront** | Hero, product grid, search, category filter, price sort, product detail pages |
| **Realtime** | Catalog reflects create/edit/hide/delete the moment staff save |
| **Cart & checkout** | Client-side cart (persisted to `localStorage`), guest checkout that records an order — no payment processing |
| **Employee dashboard** | Email/password login, product table with live status, create/edit/delete, stock & visibility controls, image upload to Supabase Storage |
| **Security** | Postgres Row Level Security: public reads active products and can place orders; only authenticated staff can manage products and read orders |

## 1. Prerequisites

- Node.js 20+ and npm
- A free [Supabase](https://supabase.com) project

## 2. Configure the database

In your Supabase project, open **SQL Editor** and run, in order:

1. [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — tables, RLS policies, triggers, the `product-images` storage bucket, and the realtime publication.
2. [`supabase/seed.sql`](supabase/seed.sql) — optional sample categories and products.

> Realtime is enabled by the migration (`alter publication supabase_realtime add table public.products`). No extra dashboard toggling required.

## 3. Create an employee account

Public sign-up is intentionally **not** exposed in the app. Create staff users in
the Supabase dashboard:

**Authentication → Users → Add user** → enter an email + password and tick
*Auto Confirm User*. A matching `profiles` row is created automatically, which is
what grants product-management access.

## 4. Set environment variables

Copy [`.env.example`](.env.example) to `.env.local` and fill in values from
**Supabase → Project Settings → API**:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

## 5. Run it

```bash
npm install
npm run dev
```

- Storefront: <http://localhost:3000>
- Staff sign in: <http://localhost:3000/login> → dashboard at `/dashboard`

**See realtime in action:** open the storefront in one window and the dashboard
in another. Edit a price, change stock, or hide a product in the dashboard — the
storefront updates on its own.

## Project structure

```
src/
  app/
    page.tsx                     Storefront (hero + realtime catalog)
    products/[slug]/page.tsx     Product detail
    cart/page.tsx                Cart
    checkout/                    Checkout + success
    login/page.tsx               Staff sign in
    dashboard/                   Protected admin (list, new, [id]/edit)
  components/
    cart/                        Cart context (localStorage)
    catalog/                     Product card, realtime catalog, add-to-cart
    dashboard/                   Product table + form (image upload)
    layout/                      Header / footer
    ui/                          Button primitives
  lib/
    supabase/                    Browser + server clients
    types.ts                     DB types
    format.ts                    Currency / slug helpers
  proxy.ts                       Session refresh + /dashboard guard
supabase/
  migrations/0001_init.sql       Schema, RLS, storage, realtime
  seed.sql                       Sample data
```

## How the live update works

1. An employee saves a change in the dashboard → the browser Supabase client
   writes to the `products` table (allowed by the `is_employee()` RLS policy).
2. Postgres emits the change on the `supabase_realtime` publication.
3. Every visitor's open catalog (`CatalogClient`) has a `postgres_changes`
   subscription and patches its local state — inserting, updating, or removing
   the product live. Hidden/inactive products drop off the public grid.

## Notes & next steps

- Checkout records orders but does **not** charge cards. Stripe can be added at
  the checkout step plus a webhook to mark orders `paid`.
- To support customer accounts later, add a `customers` role and RLS policies;
  the schema already separates `orders` from staff-only reads.

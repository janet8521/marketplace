---
name: publish-control-hides-seeded-products
description: Why seeded/bulk-inserted products stay invisible in the catalog and how to publish them
metadata:
  type: project
---

The `products_publish_control` trigger (migration `0003_publish_control.sql`) forces `is_active = false` on every product INSERT unless `public.is_admin()` is true, and reverts `is_active` to its old value on UPDATE for non-admins. The Supabase SQL Editor (and any service-role/bulk script) has no logged-in admin auth context, so `is_admin()` is false there.

**Effect:** products inserted via the SQL editor (e.g. `seed.sql`) land HIDDEN even when their row says `is_active = true`. The public catalog query filters `is_active = true`, so they never appear — symptom is "0 products" while categories show fine.

**Why:** publishing is owner-only by design; the trigger enforces it even if the UI is bypassed.

**How to apply:** to publish seeded products, disable the trigger for the statement, then re-enable:
`alter table public.products disable trigger products_publish_control;` → `update ... set is_active = true` → `alter table public.products enable trigger products_publish_control;`. `seed.sql` now does this at the end.

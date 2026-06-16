-- ============================================================================
-- Sample catalog data for Virtus Marketplace.
-- Run AFTER 0001_init.sql. Safe to re-run (uses slug conflicts to upsert).
-- ============================================================================

insert into public.categories (name, slug) values
  ('Electronics', 'electronics'),
  ('Accessories', 'accessories'),
  ('Furniture', 'furniture'),
  ('Clothing', 'clothing')
on conflict (slug) do nothing;

insert into public.products (name, slug, description, price, currency, category_id, image_url, stock, sku, is_active)
values
  ('Aurora Wireless Headphones', 'aurora-wireless-headphones',
   'Over-ear headphones with active noise cancellation and 40-hour battery life.',
   199.00, 'KES', (select id from public.categories where slug = 'electronics'),
   'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
   42, 'AUR-HP-01', true),

  ('Nimbus Smart Speaker', 'nimbus-smart-speaker',
   'Room-filling 360° sound with built-in voice assistant and multi-room sync.',
   129.00, 'KES', (select id from public.categories where slug = 'electronics'),
   'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=800&q=80',
   30, 'NIM-SP-02', true),

  ('Linen Throw Blanket', 'linen-throw-blanket',
   'Soft pre-washed European linen throw, perfect for the sofa or bed.',
   79.00, 'KES', (select id from public.categories where slug = 'furniture'),
   'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
   60, 'LIN-TB-03', true),

  ('Ceramic Pour-Over Set', 'ceramic-pour-over-set',
   'Hand-glazed ceramic dripper and carafe for the perfect morning brew.',
   54.00, 'KES', (select id from public.categories where slug = 'furniture'),
   'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
   25, 'CER-PO-04', true),

  ('Merino Crew Sweater', 'merino-crew-sweater',
   'Lightweight 100% merino wool crew-neck that breathes in every season.',
   119.00, 'KES', (select id from public.categories where slug = 'clothing'),
   'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
   80, 'MER-CS-05', true),

  ('Heritage Leather Tote', 'heritage-leather-tote',
   'Full-grain vegetable-tanned leather tote that ages beautifully with use.',
   245.00, 'KES', (select id from public.categories where slug = 'accessories'),
   'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80',
   18, 'HER-LT-06', true),

  ('Minimalist Steel Watch', 'minimalist-steel-watch',
   'Sapphire-glass automatic watch with a brushed stainless-steel case.',
   320.00, 'KES', (select id from public.categories where slug = 'accessories'),
   'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80',
   12, 'MIN-SW-07', true),

  ('Trailhead Daypack 22L', 'trailhead-daypack-22l',
   'Water-resistant 22-litre daypack with a padded laptop sleeve.',
   89.00, 'KES', (select id from public.categories where slug = 'accessories'),
   'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
   45, 'TRL-DP-08', true),

  -- Clothing mock data (for testing the Clothing category) -------------------
  ('Classic Denim Jacket', 'classic-denim-jacket',
   'Stonewashed cotton denim jacket with a relaxed fit and brass buttons.',
   140.00, 'KES', (select id from public.categories where slug = 'clothing'),
   'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&w=800&q=80',
   55, 'CLO-DJ-09', true),

  ('Everyday Cotton Tee', 'everyday-cotton-tee',
   'Soft midweight organic-cotton crew tee that holds its shape wash after wash.',
   29.00, 'KES', (select id from public.categories where slug = 'clothing'),
   'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
   120, 'CLO-CT-10', true),

  ('Tailored Chino Trousers', 'tailored-chino-trousers',
   'Stretch-cotton chinos with a clean tapered leg for work or weekend.',
   85.00, 'KES', (select id from public.categories where slug = 'clothing'),
   'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80',
   70, 'CLO-CH-11', true),

  ('Linen Summer Dress', 'linen-summer-dress',
   'Breezy midi dress in pre-washed linen with a flattering tie waist.',
   110.00, 'KES', (select id from public.categories where slug = 'clothing'),
   'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
   40, 'CLO-LD-12', true),

  ('Hooded Pullover Sweatshirt', 'hooded-pullover-sweatshirt',
   'Heavyweight brushed-fleece hoodie with a kangaroo pocket and ribbed cuffs.',
   72.00, 'KES', (select id from public.categories where slug = 'clothing'),
   'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
   90, 'CLO-HS-13', true)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Publish the seed catalog.
--
-- The publish-control trigger from 0003 forces is_active=false on insert for
-- anyone who isn't a logged-in admin. The SQL editor has no admin auth context,
-- so every row above lands HIDDEN regardless of the `true` in its values — and
-- the public catalog only shows active products. The same trigger also reverts
-- visibility on UPDATE for non-admins, so we disable it for this one statement.
-- ----------------------------------------------------------------------------
alter table public.products disable trigger products_publish_control;

update public.products set is_active = true
 where slug in (
   'aurora-wireless-headphones', 'nimbus-smart-speaker', 'linen-throw-blanket',
   'ceramic-pour-over-set', 'merino-crew-sweater', 'heritage-leather-tote',
   'minimalist-steel-watch', 'trailhead-daypack-22l', 'classic-denim-jacket',
   'everyday-cotton-tee', 'tailored-chino-trousers', 'linen-summer-dress',
   'hooded-pullover-sweatshirt'
 );

alter table public.products enable trigger products_publish_control;

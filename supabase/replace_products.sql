-- ============================================================================
-- ONE-TIME: replace the mock catalog with the real Thee Brins products.
-- Paste this whole block into the Supabase SQL Editor and click "Run".
-- (Dashboard -> SQL Editor -> New query.)
--
-- It deletes every existing product, then inserts the 9 real items.
-- Any past orders are preserved (order_items.product_id is set to NULL on
-- delete, and the item keeps its stored product_name / unit_price).
-- ============================================================================

-- Make sure the categories exist (no-op if they already do).
insert into public.categories (name, slug) values
  ('Electronics', 'electronics'),
  ('Accessories', 'accessories'),
  ('Furniture', 'furniture'),
  ('Clothing', 'clothing')
on conflict (slug) do nothing;

-- Wipe the old mock catalog.
delete from public.products;

-- The publish-control trigger hides rows inserted/updated outside an admin
-- session, so disable it for this maintenance block.
alter table public.products disable trigger products_publish_control;

insert into public.products (name, slug, description, price, currency, category_id, image_url, stock, sku, is_active)
values
  ('Mens Watch Set', 'mens-watch-set',
   'Classic Geneva analog watch with a genuine-leather strap, paired with a matching steel bracelet — a complete two-piece gift set.',
   2000.00, 'KES', (select id from public.categories where slug = 'accessories'),
   '/products/mens-watch-set.jpg', 25, 'WTCH-MEN-01', true),

  ('Ladies Gift Set', 'ladies-gift-set',
   'Rose-gold quartz watch with a matching crystal bracelet, necklace, earrings and ring — a five-piece gift set in a presentation box.',
   2000.00, 'KES', (select id from public.categories where slug = 'accessories'),
   '/products/ladies-gift-set.jpg', 25, 'WTCH-LDS-02', true),

  ('Smart LED TV', 'smart-led-tv',
   'Full-HD smart LED TV running VIDAA, with built-in Netflix, YouTube, Prime Video and more streaming apps.',
   20000.00, 'KES', (select id from public.categories where slug = 'electronics'),
   '/products/smart-led-tv.jpg', 10, 'ELEC-TV-03', true),

  ('JBL Speaker', 'jbl-speaker',
   'Powerful JBL party speaker with deep bass and a dynamic light show — wireless Bluetooth and a rechargeable battery.',
   15000.00, 'KES', (select id from public.categories where slug = 'electronics'),
   '/products/jbl-speaker.jpg', 15, 'ELEC-SPK-04', true),

  ('Cardigan', 'cardigan',
   'Soft fine-knit V-neck cardigan — a versatile layering piece for any season.',
   600.00, 'KES', (select id from public.categories where slug = 'clothing'),
   '/products/cardigan.jpg', 40, 'CLO-CAR-05', true),

  ('Polo Shirt', 'polo-shirt',
   'Relaxed short-sleeve button-up shirt in soft, breathable cotton, available in classic neutral tones.',
   1000.00, 'KES', (select id from public.categories where slug = 'clothing'),
   '/products/polo-shirt.jpg', 40, 'CLO-POL-06', true),

  ('Nexus Sofa Bed', 'nexus-sofa-bed',
   'Modern L-shaped corner sofa bed in warm rust chenille, with a roomy chaise and a pull-out bed function.',
   30000.00, 'KES', (select id from public.categories where slug = 'furniture'),
   '/products/nexus-sofa-bed.jpg', 5, 'FUR-SOF-07', true),

  ('Montana Recliner Sofa', 'montana-recliner-sofa',
   'Plush three-piece reclining sofa set in soft brown upholstery — generous seating for the whole living room.',
   40000.00, 'KES', (select id from public.categories where slug = 'furniture'),
   '/products/montana-recliner-sofa.jpg', 5, 'FUR-SOF-08', true),

  ('Verdeluxe Sofa', 'verdeluxe-sofa',
   'Contemporary two-seater sofa in light-grey fabric on a matte-black metal frame.',
   20000.00, 'KES', (select id from public.categories where slug = 'furniture'),
   '/products/verdeluxe-sofa.jpg', 5, 'FUR-SOF-09', true)
on conflict (slug) do nothing;

-- Force all nine live/visible (the insert's is_active gets overridden by the trigger otherwise).
update public.products set is_active = true
 where slug in (
   'mens-watch-set', 'ladies-gift-set', 'smart-led-tv', 'jbl-speaker',
   'cardigan', 'polo-shirt', 'nexus-sofa-bed', 'montana-recliner-sofa',
   'verdeluxe-sofa'
 );

alter table public.products enable trigger products_publish_control;

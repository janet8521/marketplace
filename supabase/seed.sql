-- ============================================================================
-- Sample catalog data for Virtus Marketplace.
-- Run AFTER 0001_init.sql. Safe to re-run (uses slug conflicts to upsert).
-- ============================================================================

insert into public.categories (name, slug) values
  ('Electronics', 'electronics'),
  ('Home & Living', 'home-living'),
  ('Apparel', 'apparel'),
  ('Accessories', 'accessories')
on conflict (slug) do nothing;

insert into public.products (name, slug, description, price, currency, category_id, image_url, stock, sku, is_active)
values
  ('Aurora Wireless Headphones', 'aurora-wireless-headphones',
   'Over-ear headphones with active noise cancellation and 40-hour battery life.',
   199.00, 'USD', (select id from public.categories where slug = 'electronics'),
   'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
   42, 'AUR-HP-01', true),

  ('Nimbus Smart Speaker', 'nimbus-smart-speaker',
   'Room-filling 360° sound with built-in voice assistant and multi-room sync.',
   129.00, 'USD', (select id from public.categories where slug = 'electronics'),
   'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=800&q=80',
   30, 'NIM-SP-02', true),

  ('Linen Throw Blanket', 'linen-throw-blanket',
   'Soft pre-washed European linen throw, perfect for the sofa or bed.',
   79.00, 'USD', (select id from public.categories where slug = 'home-living'),
   'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
   60, 'LIN-TB-03', true),

  ('Ceramic Pour-Over Set', 'ceramic-pour-over-set',
   'Hand-glazed ceramic dripper and carafe for the perfect morning brew.',
   54.00, 'USD', (select id from public.categories where slug = 'home-living'),
   'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
   25, 'CER-PO-04', true),

  ('Merino Crew Sweater', 'merino-crew-sweater',
   'Lightweight 100% merino wool crew-neck that breathes in every season.',
   119.00, 'USD', (select id from public.categories where slug = 'apparel'),
   'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
   80, 'MER-CS-05', true),

  ('Heritage Leather Tote', 'heritage-leather-tote',
   'Full-grain vegetable-tanned leather tote that ages beautifully with use.',
   245.00, 'USD', (select id from public.categories where slug = 'accessories'),
   'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80',
   18, 'HER-LT-06', true),

  ('Minimalist Steel Watch', 'minimalist-steel-watch',
   'Sapphire-glass automatic watch with a brushed stainless-steel case.',
   320.00, 'USD', (select id from public.categories where slug = 'accessories'),
   'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80',
   12, 'MIN-SW-07', true),

  ('Trailhead Daypack 22L', 'trailhead-daypack-22l',
   'Water-resistant 22-litre daypack with a padded laptop sleeve.',
   89.00, 'USD', (select id from public.categories where slug = 'accessories'),
   'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
   45, 'TRL-DP-08', true)
on conflict (slug) do nothing;

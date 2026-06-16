import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SetupNotice } from "@/components/SetupNotice";
import { ProductDetailActions } from "@/components/catalog/ProductDetailActions";
import { formatPrice } from "@/lib/format";
import type { Product, ProductWithCategory } from "@/lib/types";

// Always render fresh so the page reflects the latest catalog/stock.
export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!product) notFound();

  const item = product as ProductWithCategory;
  const lowStock = item.stock > 0 && item.stock <= 5;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/" className="text-sm text-ink-soft hover:text-ink">
        ← Back to shop
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-card bg-canvas">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-ink-soft">
              No image
            </div>
          )}
          {item.stock <= 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-xs font-medium text-white">
              Sold out
            </span>
          )}
          {lowStock && (
            <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white">
              Only {item.stock} left
            </span>
          )}
        </div>

        <div className="flex flex-col">
          {item.category && (
            <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">
              {item.category.name}
            </span>
          )}
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {item.name}
          </h1>
          <p className="mt-4 text-2xl font-semibold">
            {formatPrice(item.price, item.currency)}
          </p>

          {item.description && (
            <p className="mt-6 whitespace-pre-line text-ink-soft">
              {item.description}
            </p>
          )}

          <div className="mt-8">
            <ProductDetailActions product={item as Product} />
          </div>

          {item.sku && (
            <p className="mt-6 text-xs text-ink-soft">SKU: {item.sku}</p>
          )}
        </div>
      </div>
    </div>
  );
}

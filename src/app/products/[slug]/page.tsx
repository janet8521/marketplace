import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { ProductDetailActions } from "@/components/catalog/ProductDetailActions";
import type { Product, Category } from "@/lib/types";

export const dynamic = "force-dynamic";

type ProductDetail = Product & {
  category: Pick<Category, "id" | "name" | "slug"> | null;
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) notFound();
  const product = data as ProductDetail;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav className="mb-8 flex items-center gap-2 text-sm text-ink-soft">
        <Link href="/" className="hover:text-ink">
          Shop
        </Link>
        <span>/</span>
        {product.category && (
          <>
            <span>{product.category.name}</span>
            <span>/</span>
          </>
        )}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-card border border-line bg-surface">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="grid h-full place-items-center text-ink-soft">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {product.category && (
            <span className="text-sm font-medium uppercase tracking-wide text-ink-soft">
              {product.category.name}
            </span>
          )}
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-3xl font-semibold">
            {formatPrice(product.price, product.currency)}
          </p>

          <p className="mt-6 leading-relaxed text-ink-soft">
            {product.description}
          </p>

          <div className="mt-6 flex items-center gap-3 text-sm">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                In stock
                {product.stock <= 5 ? ` · only ${product.stock} left` : ""}
              </span>
            ) : (
              <span className="rounded-full bg-ink px-3 py-1 font-medium text-white">
                Sold out
              </span>
            )}
            {product.sku && (
              <span className="text-ink-soft">SKU: {product.sku}</span>
            )}
          </div>

          <div className="mt-8">
            <ProductDetailActions product={product} />
          </div>

          <Link
            href="/cart"
            className="mt-6 text-sm font-medium text-brand hover:text-brand-dark"
          >
            View cart →
          </Link>
        </div>
      </div>
    </div>
  );
}

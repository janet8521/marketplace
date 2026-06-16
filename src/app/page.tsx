import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import { CoverImage } from "@/components/CoverImage";
import { SetupNotice } from "@/components/SetupNotice";
import { formatPrice } from "@/lib/format";
import type { Category, ProductWithCategory } from "@/lib/types";

// Always render fresh on request so the first paint reflects the latest catalog
// (realtime then keeps it live on the client).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(id, name, slug)")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
  ]);

  const list = (products ?? []) as ProductWithCategory[];

  return (
    <>
      <Hero featured={list.slice(0, 3)} allProducts={list} />
      <CatalogClient
        initialProducts={list}
        categories={(categories ?? []) as Category[]}
      />
    </>
  );
}

function Hero({
  featured,
  allProducts,
}: {
  featured: ProductWithCategory[];
  allProducts: ProductWithCategory[];
}) {
  const fromPrice =
    allProducts.length > 0
      ? formatPrice(
          Math.min(...allProducts.map((p) => p.price)),
          allProducts[0].currency,
        )
      : null;

  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <h1 className="text-balance text-center text-2xl font-extrabold tracking-tight text-brand sm:text-4xl lg:text-5xl">
          Shop our latest products
        </h1>
      </div>

      {/* gray band behind the lower part of the hero image */}
      <div className="relative mt-8">
        <div className="absolute inset-x-0 bottom-0 top-24 bg-muted" />

        <div className="relative mx-auto max-w-6xl px-4 pb-14 sm:px-6">
          <div className="relative">
            <CoverImage className="h-[360px] w-full rounded-md object-cover sm:h-[460px] lg:h-[520px]" />

            {/* floating product card */}
            <div className="relative z-10 mx-3 -mt-8 rounded-card bg-surface p-6 shadow-xl sm:mx-6 sm:p-8 lg:mx-0 lg:mt-0 lg:max-w-xs lg:absolute lg:left-8 lg:top-8">
              <h2 className="text-xl font-extrabold leading-tight text-brand sm:text-2xl">
                Discover our{" "}
                <br className="hidden lg:inline" />
                new Collection
              </h2>
              {fromPrice && (
                <p className="mt-2 text-sm italic text-ink-soft">
                  Shop from {fromPrice}
                </p>
              )}
              <Link
                href="#catalog"
                className="mt-5 inline-flex h-11 items-center rounded-full bg-brand px-7 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
              >
                Learn more
              </Link>

              {featured.length > 0 && (
                <>
                  <p className="mt-7 text-xs font-bold uppercase tracking-widest text-ink-soft">
                    Products
                  </p>
                  <ul className="mt-3 divide-y divide-line border-b border-line">
                    {featured.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/products/${p.slug}`}
                          className="flex items-center gap-3 py-3"
                        >
                          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                            {p.image_url && (
                              <Image
                                src={p.image_url}
                                alt={p.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-brand">
                              {p.name}
                            </span>
                            <span className="text-sm font-semibold text-ink">
                              {formatPrice(p.price, p.currency)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

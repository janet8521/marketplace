import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import { SetupNotice } from "@/components/SetupNotice";
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

  return (
    <>
      <Hero />
      <CatalogClient
        initialProducts={(products ?? []) as ProductWithCategory[]}
        categories={(categories ?? []) as Category[]}
      />
    </>
  );
}

function Hero() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-brand-soft px-3 py-1 text-sm font-medium text-brand">
            <span className="h-2 w-2 rounded-full bg-brand" />
            Updated live by our team
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            Thoughtfully chosen goods, always in stock.
          </h1>
          <p className="mt-4 text-lg text-ink-soft">
            Browse a curated marketplace of electronics, home goods, apparel and
            accessories. Prices and availability update the moment our team
            makes a change.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#catalog"
              className="inline-flex h-12 items-center rounded-full bg-brand px-8 text-base font-medium text-white transition-colors hover:bg-brand-dark"
            >
              Shop the catalog
            </Link>
            <Link
              href="#categories"
              className="inline-flex h-12 items-center rounded-full border border-line bg-surface px-8 text-base font-medium transition-colors hover:border-ink/30"
            >
              Browse categories
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

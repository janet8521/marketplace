"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Category, Product, ProductWithCategory } from "@/lib/types";
import { ProductCard } from "./ProductCard";

type SortKey = "newest" | "price-asc" | "price-desc";

export function CatalogClient({
  initialProducts,
  categories,
}: {
  initialProducts: ProductWithCategory[];
  categories: Category[];
}) {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [products, setProducts] = useState<ProductWithCategory[]>(initialProducts);
  const [query, setQuery] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Re-seed the search box when the header's ?q= param changes (adjusting
  // state during render — the documented pattern, no effect needed).
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setQuery(urlQuery);
  }
  const [sort, setSort] = useState<SortKey>("newest");
  const [live, setLive] = useState(false);

  // Map category_id -> category so realtime rows (which arrive without the
  // join) can be enriched for display.
  const categoryById = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // ── Realtime: keep the catalog in sync as employees edit products ──────────
  useEffect(() => {
    const supabase = createClient();

    const withCategory = (row: Product): ProductWithCategory => ({
      ...row,
      category: row.category_id
        ? categoryById.get(row.category_id) ?? null
        : null,
    });

    const channel = supabase
      .channel("public:products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          setProducts((prev) => {
            if (payload.eventType === "DELETE") {
              return prev.filter((p) => p.id !== (payload.old as Product).id);
            }

            const row = payload.new as Product;
            // Inactive products should disappear from the public catalog.
            if (!row.is_active) {
              return prev.filter((p) => p.id !== row.id);
            }

            const next = withCategory(row);
            const exists = prev.some((p) => p.id === row.id);
            return exists
              ? prev.map((p) => (p.id === row.id ? next : p))
              : [next, ...prev];
          });
        },
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
    };
  }, [categoryById]);

  // ── Derived view: filter + search + sort ───────────────────────────────────
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => p.is_active);

    if (activeCategory) {
      list = list.filter((p) => p.category_id === activeCategory);
    }
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q),
      );
    }

    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else
      sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

    return sorted;
  }, [products, query, activeCategory, sort]);

  return (
    <section id="catalog" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">All products</h2>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs text-ink-soft"
              title={live ? "Live updates connected" : "Connecting…"}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  live ? "bg-emerald-500" : "bg-amber-400"
                }`}
              />
              {live ? "Live" : "Connecting"}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            {visible.length} item{visible.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="h-11 w-full rounded-full border border-line bg-surface px-4 text-sm outline-none focus:border-brand sm:w-64"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-11 rounded-full border border-line bg-surface px-4 text-sm outline-none focus:border-brand"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category chips */}
      <div id="categories" className="mb-8 flex flex-wrap gap-2">
        <Chip active={!activeCategory} onClick={() => setActiveCategory(null)}>
          All
        </Chip>
        {categories.map((c) => (
          <Chip
            key={c.id}
            active={activeCategory === c.id}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.name}
          </Chip>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface py-20 text-center text-ink-soft">
          No products match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-brand bg-brand text-white"
          : "border-line bg-surface text-ink-soft hover:border-ink/30 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

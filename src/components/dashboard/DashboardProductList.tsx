"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function DashboardProductList({
  initialProducts,
  isAdmin,
}: {
  initialProducts: Product[];
  isAdmin: boolean;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Stay in sync with edits made elsewhere (other staff, other tabs).
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("dashboard:products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          setProducts((prev) => {
            if (payload.eventType === "DELETE") {
              return prev.filter((p) => p.id !== (payload.old as Product).id);
            }
            const row = payload.new as Product;
            const exists = prev.some((p) => p.id === row.id);
            return exists
              ? prev.map((p) => (p.id === row.id ? row : p))
              : [row, ...prev];
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q),
    );
  }, [products, query]);

  async function toggleActive(product: Product) {
    setBusyId(product.id);
    const supabase = createClient();
    await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", product.id);
    setBusyId(null);
    // Realtime will reconcile state, but update optimistically too.
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, is_active: !p.is_active } : p,
      ),
    );
  }

  async function remove(product: Product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setBusyId(product.id);
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", product.id);
    setBusyId(null);
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
  }

  // Shared bits so the phone (card) and desktop (table) views stay in sync.
  function StatusBadge({ p }: { p: Product }) {
    if (isAdmin) {
      return (
        <button
          onClick={() => toggleActive(p)}
          disabled={busyId === p.id}
          title={
            p.is_active
              ? "Live on store — tap to hide"
              : "Hidden — tap to publish"
          }
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
            p.is_active
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "bg-white/10 text-ink-soft hover:bg-white/20"
          }`}
        >
          {p.is_active ? "Live" : "Hidden"}
        </button>
      );
    }
    return (
      <span
        title="Only the owner can publish products"
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          p.is_active ? "bg-emerald-50 text-emerald-700" : "bg-white/10 text-ink-soft"
        }`}
      >
        {p.is_active ? "Live" : "Pending"}
      </span>
    );
  }

  function Actions({ p }: { p: Product }) {
    return (
      <>
        <Link
          href={`/dashboard/${p.id}/edit`}
          className="font-medium text-brand hover:text-brand-dark"
        >
          Edit
        </Link>
        {isAdmin && (
          <button
            onClick={() => remove(p)}
            disabled={busyId === p.id}
            className="font-medium text-ink-soft hover:text-red-600 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </>
    );
  }

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or SKU…"
        className="mb-4 h-11 w-full max-w-sm rounded-full border border-line bg-surface px-4 text-sm outline-none focus:border-brand"
      />

      {/* Phone / tablet: stacked cards (easy to tap) */}
      <div className="space-y-3 md:hidden">
        {visible.length === 0 ? (
          <div className="rounded-card border border-line bg-surface py-12 text-center text-ink-soft">
            No products yet.
          </div>
        ) : (
          visible.map((p) => (
            <div
              key={p.id}
              className="rounded-card border border-line bg-surface p-4"
            >
              <div className="flex gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-canvas">
                  {p.image_url && (
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{p.name}</div>
                      {p.sku && (
                        <div className="text-xs text-ink-soft">{p.sku}</div>
                      )}
                    </div>
                    <StatusBadge p={p} />
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm">
                    <span className="font-semibold">
                      {formatPrice(p.price, p.currency)}
                    </span>
                    <span
                      className={
                        p.stock <= 5 ? "font-medium text-amber-500" : "text-ink-soft"
                      }
                    >
                      Stock: {p.stock}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-4 border-t border-line pt-3 text-sm">
                <Actions p={p} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-card border border-line bg-surface md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-ink-soft">
                  No products yet.
                </td>
              </tr>
            ) : (
              visible.map((p) => (
                <tr key={p.id} className="hover:bg-canvas/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-canvas">
                        {p.image_url && (
                          <Image
                            src={p.image_url}
                            alt={p.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        {p.sku && (
                          <div className="text-xs text-ink-soft">{p.sku}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {formatPrice(p.price, p.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={p.stock <= 5 ? "font-medium text-amber-600" : ""}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge p={p} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Actions p={p} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaff } from "@/lib/auth";
import { DashboardProductList } from "@/components/dashboard/DashboardProductList";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const staff = await getCurrentStaff();
  const isAdmin = staff?.role === "admin";

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (products ?? []) as Product[];
  const liveCount = list.filter((p) => p.is_active).length;
  const lowStock = list.filter((p) => p.stock > 0 && p.stock <= 5).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {list.length} total · {liveCount} live · {lowStock} low stock.{" "}
            {isAdmin
              ? "Publishing a product shows it on the storefront instantly."
              : "New stock you add stays hidden until the owner publishes it."}
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          + New product
        </Link>
      </div>

      <DashboardProductList initialProducts={list} isAdmin={isAdmin} />
    </div>
  );
}

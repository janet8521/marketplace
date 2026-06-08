import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaff } from "@/lib/auth";
import { ProductForm } from "@/components/dashboard/ProductForm";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = await createClient();
  const staff = await getCurrentStaff();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/dashboard"
        className="text-sm text-ink-soft hover:text-ink"
      >
        ← Back to products
      </Link>
      <h1 className="mb-8 mt-2 text-2xl font-semibold tracking-tight">
        New product
      </h1>
      <ProductForm
        categories={(categories ?? []) as Category[]}
        isAdmin={staff?.role === "admin"}
      />
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaff } from "@/lib/auth";
import { ProductForm } from "@/components/dashboard/ProductForm";
import type { Category, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }, staff] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("name"),
    getCurrentStaff(),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/dashboard" className="text-sm text-ink-soft hover:text-ink">
        ← Back to products
      </Link>
      <h1 className="mb-8 mt-2 text-2xl font-semibold tracking-tight">
        Edit product
      </h1>
      <ProductForm
        categories={(categories ?? []) as Category[]}
        product={product as Product}
        isAdmin={staff?.role === "admin"}
      />
    </div>
  );
}

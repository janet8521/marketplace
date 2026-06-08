"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { slugify } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

const STORAGE_BUCKET = "product-images";

export function ProductForm({
  categories,
  product,
  isAdmin,
}: {
  categories: Category[];
  product?: Product;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    // 1) Upload a new image if one was chosen.
    let finalImageUrl = imageUrl;
    if (file) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${slug || crypto.randomUUID()}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { upsert: true });

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        setSubmitting(false);
        return;
      }
      finalImageUrl = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
        .data.publicUrl;
    }

    const payload: Record<string, unknown> = {
      name: String(form.get("name")).trim(),
      slug: slugify(String(form.get("slug")) || String(form.get("name"))),
      description: String(form.get("description")).trim() || null,
      price: Number(form.get("price")),
      currency: String(form.get("currency")) || "USD",
      category_id: String(form.get("category_id")) || null,
      stock: Number(form.get("stock")),
      sku: String(form.get("sku")).trim() || null,
      image_url: finalImageUrl || null,
    };

    // Only the owner controls visibility. For employees we omit it entirely —
    // the database trigger keeps new stock hidden and preserves existing
    // visibility on edits.
    if (isAdmin) {
      payload.is_active = form.get("is_active") === "on";
    }

    // 2) Insert or update the product row.
    const { error: dbError } = isEdit
      ? await supabase.from("products").update(payload).eq("id", product!.id)
      : await supabase.from("products").insert(payload);

    if (dbError) {
      setError(
        dbError.code === "23505"
          ? "That slug is already in use — choose another."
          : dbError.message,
      );
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const preview = file ? URL.createObjectURL(file) : imageUrl;

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_18rem]">
      <div className="space-y-5">
        <Field label="Name" required>
          <input
            name="name"
            required
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Slug" hint="Used in the product URL">
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            className={inputClass}
            placeholder="auto-generated from name"
          />
        </Field>

        <Field label="Description">
          <textarea
            name="description"
            rows={4}
            defaultValue={product?.description ?? ""}
            className={`${inputClass} h-auto py-3`}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Price" required>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={product?.price ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Currency">
            <input
              name="currency"
              defaultValue={product?.currency ?? "USD"}
              className={inputClass}
            />
          </Field>
          <Field label="Stock" required>
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              required
              defaultValue={product?.stock ?? 0}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category">
            <select
              name="category_id"
              defaultValue={product?.category_id ?? ""}
              className={inputClass}
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="SKU">
            <input
              name="sku"
              defaultValue={product?.sku ?? ""}
              className={inputClass}
            />
          </Field>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting
              ? "Saving…"
              : isEdit
                ? "Save changes"
                : "Create product"}
          </Button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="text-sm text-ink-soft hover:text-ink"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Sidebar: image + visibility */}
      <aside className="order-first space-y-5 lg:order-none">
        <div className="rounded-card border border-line bg-surface p-5">
          <p className="mb-3 text-sm font-medium">Image</p>
          <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-canvas">
            {preview ? (
              <Image
                src={preview}
                alt="Preview"
                fill
                sizes="288px"
                className="object-cover"
                unoptimized={Boolean(file)}
              />
            ) : (
              <div className="grid h-full place-items-center text-sm text-ink-soft">
                No image
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-brand-soft file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand hover:file:bg-brand-soft/70"
          />
          <p className="mt-2 text-xs text-ink-soft">
            On a phone you can take a photo with the camera or pick one from your
            gallery.
          </p>
          <input
            type="url"
            value={file ? "" : imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={Boolean(file)}
            placeholder="…or paste an image URL"
            className={`${inputClass} mt-3 disabled:opacity-50`}
          />
        </div>

        {isAdmin ? (
          <div className="rounded-card border border-line bg-surface p-5">
            <label className="flex items-center justify-between gap-3 text-sm font-medium">
              <span>
                Visible on store
                <span className="mt-0.5 block text-xs font-normal text-ink-soft">
                  Hidden products are removed from the catalog.
                </span>
              </span>
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={product?.is_active ?? true}
                className="h-5 w-5 accent-[var(--color-brand)]"
              />
            </label>
          </div>
        ) : (
          <div className="rounded-card border border-line bg-brand-soft/60 p-5 text-sm text-ink-soft">
            <p className="font-medium text-ink">Publishing is owner-only</p>
            <p className="mt-1">
              {isEdit
                ? "Your changes are saved, but only the owner can make this product live or hide it."
                : "This product is saved as stock and stays hidden until the owner publishes it to the store."}
            </p>
          </div>
        )}
      </aside>
    </form>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none focus:border-brand";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
        {label}
        {required && <span className="text-brand">*</span>}
        {hint && <span className="font-normal text-ink-soft">· {hint}</span>}
      </label>
      {children}
    </div>
  );
}

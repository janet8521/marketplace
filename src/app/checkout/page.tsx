"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { createClient } from "@/lib/supabase/client";
import { Button, LinkButton } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import { addRecentOrder } from "@/lib/recentOrders";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) return;

    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    // Generate the id client-side: anon users cannot SELECT orders (RLS), so we
    // can't read it back after insert — we mint it here instead.
    const orderId = crypto.randomUUID();

    const { error: orderError } = await supabase.from("orders").insert({
      id: orderId,
      customer_name: String(form.get("name")),
      customer_email: String(form.get("email")),
      customer_phone: String(form.get("phone") || "") || null,
      shipping_address: String(form.get("address")),
      total: subtotal,
      status: "pending",
    });

    if (orderError) {
      setError("We couldn't place your order. Please try again.");
      setSubmitting(false);
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: orderId,
        product_id: i.productId,
        product_name: i.name,
        unit_price: i.price,
        quantity: i.quantity,
      })),
    );

    if (itemsError) {
      setError("Your order was started but items failed to save. Contact us.");
      setSubmitting(false);
      return;
    }

    // Remember this order on this device so the customer can re-open it from
    // /track later without having to keep the order number themselves.
    addRecentOrder({
      code: orderId.slice(0, 8),
      email: String(form.get("email")),
      placedAt: new Date().toISOString(),
    });

    clear();
    router.push(`/checkout/success?order=${orderId}`);
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Nothing to check out
        </h1>
        <p className="mt-2 text-ink-soft">Your cart is empty.</p>
        <LinkButton href="/" className="mt-6">
          Browse products
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Checkout</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Full name" name="name" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="Phone (optional)" name="phone" type="tel" />
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Shipping address
            </label>
            <textarea
              name="address"
              required
              rows={3}
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-brand"
              placeholder="Street, city, postal code, country"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Placing order…" : "Place order"}
          </Button>
          <p className="text-xs text-ink-soft">
            This demo does not process payments. Your order is recorded for our
            team to fulfil.
          </p>
        </form>

        <aside className="h-fit rounded-card border border-line bg-surface p-6">
          <h2 className="text-lg font-semibold">Your order</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3">
                <span className="text-ink-soft">
                  {i.name} × {i.quantity}
                </span>
                <span className="font-medium">
                  {formatPrice(i.price * i.quantity, i.currency)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-line pt-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="h-11 w-full rounded-xl border border-line bg-surface px-4 text-sm outline-none focus:border-brand"
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { formatDate, formatPrice } from "@/lib/format";
import {
  addRecentOrder,
  getRecentOrders,
  type RecentOrder,
} from "@/lib/recentOrders";

// Customer-friendly wording for each internal status value.
const statusLabels: Record<string, string> = {
  pending: "Order received",
  paid: "Payment confirmed",
  shipped: "Shipped",
  cancelled: "Cancelled",
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  paid: "bg-emerald-50 text-emerald-700",
  shipped: "bg-blue-50 text-blue-700",
  cancelled: "bg-white/10 text-ink-soft",
};

type TrackItem = {
  product_name: string;
  unit_price: number;
  quantity: number;
};

type Result = {
  status: string;
  created_at: string;
  total: number;
  customer_name: string;
  items: TrackItem[];
};

export default function TrackOrderPage() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [recent, setRecent] = useState<RecentOrder[]>([]);

  useEffect(() => {
    setRecent(getRecentOrders());
  }, []);

  async function lookup(rawCode: string, rawEmail: string) {
    const c = rawCode.trim().replace(/^#/, "");
    const e = rawEmail.trim();
    if (!c || !e) return;

    setSubmitting(true);
    setError(null);
    setResult(null);

    const supabase = createClient();
    const { data, error: err } = await supabase.rpc("order_lookup", {
      p_code: c,
      p_email: e,
    });
    setSubmitting(false);

    if (err) {
      setError("Something went wrong looking up your order. Please try again.");
      return;
    }
    const row = (data as Result[] | null)?.[0];
    if (!row) {
      setError(
        "We couldn't find an order matching that number and email. Double-check both and try again.",
      );
      return;
    }
    setResult(row);
    // Remember successful manual lookups too, so they show up next time.
    addRecentOrder({
      code: c.slice(0, 8),
      email: e,
      placedAt: new Date().toISOString(),
    });
    setRecent(getRecentOrders());
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    lookup(code, email);
  }

  function pick(o: RecentOrder) {
    setCode(o.code);
    setEmail(o.email);
    lookup(o.code, o.email);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Track your order</h1>
      <p className="mt-2 text-ink-soft">
        Enter your order number and the email you used at checkout to see its
        current status and what you ordered.
      </p>

      {recent.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Orders from this device
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {recent.map((o) => (
              <li key={o.code}>
                <button
                  type="button"
                  onClick={() => pick(o)}
                  disabled={submitting}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-sm uppercase transition-colors hover:border-brand disabled:opacity-60"
                >
                  #{o.code.toUpperCase()}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Order number
          </label>
          <input
            name="code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. A1B2C3D4"
            className="h-11 w-full rounded-xl border border-line bg-surface px-4 font-mono text-sm uppercase outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-xl border border-line bg-surface px-4 text-sm outline-none focus:border-brand"
          />
        </div>

        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Looking up…" : "Check status"}
        </Button>
      </form>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-8 rounded-card border border-line bg-surface p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Status
            </h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                statusStyles[result.status] ?? "bg-white/10"
              }`}
            >
              {statusLabels[result.status] ?? result.status}
            </span>
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            Placed {formatDate(result.created_at)}
          </p>

          {result.items.length > 0 && (
            <ul className="mt-5 divide-y divide-line border-t border-line text-sm">
              {result.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <span>
                    {item.product_name}
                    <span className="text-ink-soft"> × {item.quantity}</span>
                  </span>
                  <span className="font-medium">
                    {formatPrice(item.unit_price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex justify-between border-t border-line pt-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(result.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

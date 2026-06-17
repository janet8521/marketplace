"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";

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

type Result = { status: string; created_at: string };

export default function TrackOrderPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);

    const form = new FormData(e.currentTarget);
    const code = String(form.get("code") || "").replace(/^#/, "");
    const email = String(form.get("email") || "");

    const supabase = createClient();
    const { data, error: err } = await supabase.rpc("order_status_lookup", {
      p_code: code,
      p_email: email,
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
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Track your order</h1>
      <p className="mt-2 text-ink-soft">
        Enter your order number and the email you used at checkout to see its
        current status.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Order number
          </label>
          <input
            name="code"
            required
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
        </div>
      )}
    </div>
  );
}

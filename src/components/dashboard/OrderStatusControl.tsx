"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { OrderStatus } from "@/lib/types";

// The statuses an order can move through, in order. Owners flip orders
// here as they progress (e.g. pending → shipped once it's dispatched).
const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "shipped", label: "Shipped" },
  { value: "cancelled", label: "Cancelled" },
];

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  paid: "bg-emerald-50 text-emerald-700",
  shipped: "bg-blue-50 text-blue-700",
  cancelled: "bg-white/10 text-ink-soft",
};

export function OrderStatusControl({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: OrderStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setTo(next: OrderStatus) {
    if (next === status || busy) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    // `.select()` returns the rows actually changed — if it's empty, the
    // database blocked the write (permissions) even though no error was thrown.
    const { data, error: err } = await supabase
      .from("orders")
      .update({ status: next })
      .eq("id", orderId)
      .select();
    setBusy(false);

    if (err) return setError(err.message);
    if (!data || data.length === 0) {
      return setError(
        "That change was blocked — only the owner can update orders.",
      );
    }
    setStatus(next);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const active = s.value === status;
          return (
            <button
              key={s.value}
              onClick={() => setTo(s.value)}
              disabled={busy || active}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
                active
                  ? statusStyles[s.value]
                  : "bg-white/5 text-ink-soft hover:bg-white/10"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}

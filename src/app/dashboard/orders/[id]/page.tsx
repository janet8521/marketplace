import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaff } from "@/lib/auth";
import { formatPrice, formatDate } from "@/lib/format";
import { OrderStatusControl } from "@/components/dashboard/OrderStatusControl";
import type { Order, OrderItem } from "@/lib/types";

export const dynamic = "force-dynamic";

type OrderWithItems = Order & { items: OrderItem[] };

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  paid: "bg-emerald-50 text-emerald-700",
  shipped: "bg-blue-50 text-blue-700",
  cancelled: "bg-white/10 text-ink-soft",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Orders are owner-only. Employees are bounced back to products.
  const staff = await getCurrentStaff();
  if (staff?.role !== "admin") redirect("/dashboard");

  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  const order = data as OrderWithItems;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/dashboard/orders"
        className="text-sm text-ink-soft hover:text-ink"
      >
        ← Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-2xl font-semibold tracking-tight">
            #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              statusStyles[order.status] ?? "bg-white/10"
            }`}
          >
            {order.status}
          </span>
        </div>
        <p className="text-2xl font-semibold">{formatPrice(order.total)}</p>
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        Placed {formatDate(order.created_at)}
      </p>

      <div className="mt-6 rounded-card border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Status
        </h2>
        <p className="mb-3 mt-1 text-xs text-ink-soft">
          Mark this order as shipped once it&apos;s dispatched.
        </p>
        <OrderStatusControl orderId={order.id} initialStatus={order.status} />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <section className="rounded-card border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Customer
          </h2>
          <p className="mt-3 font-medium">{order.customer_name}</p>
          <p className="text-sm text-ink-soft">{order.customer_email}</p>
          {order.customer_phone && (
            <p className="text-sm text-ink-soft">{order.customer_phone}</p>
          )}
        </section>

        <section className="rounded-card border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Shipping address
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm text-ink-soft">
            {order.shipping_address}
          </p>
        </section>
      </div>

      <section className="mt-6 rounded-card border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Items
        </h2>
        <ul className="mt-4 divide-y divide-line text-sm">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <span>
                {item.product_name}
                <span className="text-ink-soft"> × {item.quantity}</span>
              </span>
              <span className="text-right">
                <span className="font-medium">
                  {formatPrice(item.unit_price * item.quantity)}
                </span>
                <span className="block text-xs text-ink-soft">
                  {formatPrice(item.unit_price)} each
                </span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-line pt-4 text-base font-semibold">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </section>
    </div>
  );
}

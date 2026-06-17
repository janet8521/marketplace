import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaff } from "@/lib/auth";
import { formatPrice, formatDate } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";

export const dynamic = "force-dynamic";

type OrderWithItems = Order & { items: OrderItem[] };

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  paid: "bg-emerald-50 text-emerald-700",
  shipped: "bg-blue-50 text-blue-700",
  cancelled: "bg-white/10 text-ink-soft",
};

export default async function OrdersPage() {
  // Orders are owner-only. Employees are bounced back to products.
  const staff = await getCurrentStaff();
  if (staff?.role !== "admin") redirect("/dashboard");

  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false });

  const orders = (data ?? []) as OrderWithItems[];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {orders.length} order{orders.length === 1 ? "" : "s"} placed by customers.
      </p>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-line bg-surface py-20 text-center text-ink-soft">
          No orders yet.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="block rounded-card border border-line bg-surface p-5 transition-shadow hover:shadow-lg hover:shadow-black/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusStyles[order.status] ?? "bg-white/10"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
                <div className="text-sm">
                  <p className="font-medium">{order.customer_name}</p>
                  <p className="text-ink-soft">{order.customer_email}</p>
                  {order.customer_phone && (
                    <p className="text-ink-soft">{order.customer_phone}</p>
                  )}
                  <p className="mt-2 whitespace-pre-line text-ink-soft">
                    {order.shipping_address}
                  </p>
                </div>
                <ul className="space-y-1 text-sm">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-3">
                      <span className="text-ink-soft">
                        {item.product_name} × {item.quantity}
                      </span>
                      <span>
                        {formatPrice(item.unit_price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

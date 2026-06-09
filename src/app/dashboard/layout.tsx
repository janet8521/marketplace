import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/lib/auth";
import { SignOutButton } from "@/components/dashboard/SignOutButton";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await getCurrentStaff();

  // Middleware already guards this, but double-check on the server.
  if (!staff) redirect("/login?redirect=/dashboard");

  const isAdmin = staff.role === "admin";

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white">
                V
              </span>
              <span className="font-semibold tracking-tight">
                Thee Brins <span className="text-ink-soft">Admin</span>
              </span>
            </Link>
            <nav className="hidden gap-5 text-sm text-ink-soft sm:flex">
              <Link href="/dashboard" className="hover:text-ink">
                Products
              </Link>
              {isAdmin && (
                <Link href="/dashboard/orders" className="hover:text-ink">
                  Orders
                </Link>
              )}
              <Link href="/" className="hover:text-ink" target="_blank">
                View store ↗
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                isAdmin
                  ? "bg-brand-soft text-brand"
                  : "bg-white/10 text-ink-soft"
              }`}
            >
              {isAdmin ? "Owner" : "Employee"}
            </span>
            <span className="hidden text-sm text-ink-soft sm:block">
              {staff.email}
            </span>
            <SignOutButton />
          </div>
        </div>

        {/* Mobile nav strip — the inline nav is hidden on small screens */}
        <nav className="flex gap-5 overflow-x-auto border-t border-line px-4 py-3 text-sm text-ink-soft sm:hidden">
          <Link href="/dashboard" className="whitespace-nowrap hover:text-ink">
            Products
          </Link>
          {isAdmin && (
            <Link
              href="/dashboard/orders"
              className="whitespace-nowrap hover:text-ink"
            >
              Orders
            </Link>
          )}
          <Link href="/" className="whitespace-nowrap hover:text-ink" target="_blank">
            View store ↗
          </Link>
        </nav>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
    </div>
  );
}

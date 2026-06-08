"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard") || pathname === "/login") return null;

  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-semibold">Virtus Marketplace</p>
          <p className="mt-1 text-sm text-ink-soft">
            A modern storefront, updated live by our team.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-ink-soft">
          <Link href="/" className="hover:text-ink">
            Shop
          </Link>
          <Link href="/cart" className="hover:text-ink">
            Cart
          </Link>
        </div>
      </div>
      <div className="border-t border-line px-4 py-4 text-center text-xs text-ink-soft sm:px-6">
        © {new Date().getFullYear()} Virtus. All rights reserved.
      </div>
    </footer>
  );
}

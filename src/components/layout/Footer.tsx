"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard") || pathname === "/login") return null;

  return (
    <footer className="mt-auto bg-brand text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-lg font-extrabold uppercase tracking-tight">
            Thee Brins Safe Market
          </p>
          <p className="mt-1 text-sm text-white/70">
            A modern storefront for thoughtfully chosen goods.
          </p>
        </div>
        <div className="flex gap-6 text-sm font-semibold uppercase tracking-wide text-white/80">
          <Link href="/" className="hover:text-white">
            Shop
          </Link>
          <Link href="/cart" className="hover:text-white">
            Cart
          </Link>
        </div>
      </div>
      <div className="border-t border-white/15 px-4 py-4 text-center text-xs text-white/60 sm:px-6">
        © {new Date().getFullYear()} Thee Brins Safe Market. All rights
        reserved.
      </div>
    </footer>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Category } from "@/lib/types";

export function Header() {
  const { itemCount } = useCart();
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCategories((data as Category[]) ?? []));
  }, []);

  // Keep the storefront chrome out of the employee dashboard.
  if (pathname.startsWith("/dashboard") || pathname === "/login") return null;

  const navLinks = [
    { href: "/", label: "All" },
    ...categories.map((c) => ({ href: `/#catalog`, label: c.name })),
  ];

  return (
    <header className="bg-surface">
      {/* top accent bar */}
      <div className="h-1.5 w-full bg-brand" />

      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-5 sm:px-6">
        {/* left: socials */}
        <div className="hidden items-center gap-2 sm:flex">
          <Social label="Facebook" href="#">
            <path d="M14 9h2V6h-2c-1.7 0-3 1.3-3 3v1.5H9V13h2v6h2.5v-6H15l.5-2.5h-2V9.5c0-.3.2-.5.5-.5Z" />
          </Social>
          <Social label="Instagram" href="#">
            <rect x="6" y="6" width="12" height="12" rx="3.5" />
            <circle cx="12" cy="12" r="3" />
            <circle cx="15.5" cy="8.5" r="0.6" />
          </Social>
          <Social label="Twitter" href="#">
            <path d="M19 8.3c-.5.2-1 .4-1.6.5.6-.3 1-.9 1.2-1.6-.5.3-1.1.6-1.8.7a2.8 2.8 0 0 0-4.8 2.6 8 8 0 0 1-5.8-3 2.8 2.8 0 0 0 .9 3.8c-.5 0-.9-.1-1.3-.3a2.8 2.8 0 0 0 2.3 2.8c-.4.1-.9.2-1.3.1a2.8 2.8 0 0 0 2.6 2 5.7 5.7 0 0 1-4.2 1.1 8 8 0 0 0 12.4-7.2c.6-.4 1-.9 1.5-1.6Z" />
          </Social>
        </div>

        {/* center: logo */}
        <Link
          href="/"
          className="max-w-[16rem] justify-self-center text-center text-lg font-extrabold uppercase leading-tight tracking-tight text-brand sm:max-w-none sm:text-2xl"
        >
          Thee Brins Safe Market
        </Link>

        {/* right: actions */}
        <div className="flex items-center justify-end gap-3 text-brand">
          <Link
            href="/cart"
            className="relative"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
          >
            <CartIcon />
            <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
              {itemCount}
            </span>
          </Link>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="sm:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* nav */}
      <nav className="border-y border-line">
        <ul
          className={`mx-auto max-w-6xl text-sm font-bold uppercase tracking-wide text-brand sm:flex sm:justify-center sm:gap-8 sm:px-6 sm:py-3 ${
            menuOpen ? "flex flex-col" : "hidden sm:flex"
          }`}
        >
          {navLinks.map((link, i) => (
            <li
              key={`${link.label}-${i}`}
              className="border-b border-line last:border-b-0 sm:border-b-0"
            >
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-4 transition-colors hover:bg-canvas hover:text-brand-dark sm:px-0 sm:py-0 sm:hover:bg-transparent"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function Social({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-full border border-line text-brand transition-colors hover:bg-brand hover:text-white"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        {children}
      </svg>
    </a>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="4" y1="8" x2="20" y2="8" />
      <line x1="4" y1="16" x2="20" y2="16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

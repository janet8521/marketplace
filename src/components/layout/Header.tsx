"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Category } from "@/lib/types";

// Live social profiles for Thee Brins Safe Market.
const SOCIALS = {
  facebook: "https://www.facebook.com/TheeBrinsSafeMarket",
  instagram: "https://www.instagram.com/theebrinssafemarket",
  twitter: "https://x.com/TheeBrinsMarket",
  whatsapp: "https://wa.me/254700000000",
};

export function Header() {
  const { itemCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCategories((data as Category[]) ?? []));
  }, []);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/?q=${encodeURIComponent(q)}#catalog` : "/#catalog");
    setMenuOpen(false);
  }

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
        <div className="hidden items-center gap-2.5 sm:flex">
          <Social label="Follow us on Facebook" href={SOCIALS.facebook} color="#1877F2">
            <path d="M14 9h2V6h-2c-1.7 0-3 1.3-3 3v1.5H9V13h2v6h2.5v-6H15l.5-2.5h-2V9.5c0-.3.2-.5.5-.5Z" />
          </Social>
          <Social label="Follow us on Instagram" href={SOCIALS.instagram} color="#E4405F">
            <rect x="6" y="6" width="12" height="12" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="15.6" cy="8.4" r="0.9" />
          </Social>
          <Social label="Follow us on X (Twitter)" href={SOCIALS.twitter} color="#000000">
            <path d="M17.5 5h2.2l-4.8 5.5L20.5 19h-4.4l-3.5-4.6L8.6 19H6.3l5.1-5.9L5.8 5h4.5l3.1 4.1L17.5 5Zm-.8 12.6h1.2L9.4 6.3H8.1l8.6 11.3Z" />
          </Social>
          <Social label="Message us on WhatsApp" href={SOCIALS.whatsapp} color="#25D366">
            <path d="M12 4a8 8 0 0 0-6.9 12l-1 3.7 3.8-1A8 8 0 1 0 12 4Zm4.4 11.2c-.2.5-1 .9-1.4 1-.4 0-.8.2-2.6-.5-2.2-.9-3.6-3.1-3.7-3.3-.1-.2-.9-1.2-.9-2.3 0-1.1.6-1.6.8-1.8.2-.2.4-.3.6-.3h.4c.1 0 .3 0 .5.4l.6 1.5c.1.1.1.3 0 .4l-.3.4-.3.3c-.1.1-.2.2-.1.4.1.2.6 1 1.3 1.6.9.8 1.6 1 1.8 1.1.2.1.3.1.4-.1l.6-.7c.1-.2.3-.1.4-.1l1.5.7c.2.1.3.2.4.3 0 .1 0 .6-.3 1.1Z" />
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
          <a
            href={SOCIALS.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-brand-dark"
            aria-label="Message us"
            title="Message us"
          >
            <MessageIcon />
          </a>
          <Link
            href="/cart"
            className="relative transition-colors hover:text-brand-dark"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
          >
            <CartIcon />
            <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
              {itemCount}
            </span>
          </Link>

          {/* search bar — sits after the cart */}
          <form onSubmit={onSearch} role="search" className="hidden items-center md:flex">
            <div className="flex h-9 items-center rounded-full border border-line bg-canvas pl-3 pr-1 focus-within:border-brand">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                aria-label="Search products"
                className="w-28 bg-transparent text-sm text-ink outline-none lg:w-40"
              />
              <button
                type="submit"
                aria-label="Search"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-white transition-colors hover:bg-brand-dark"
              >
                <SearchIcon />
              </button>
            </div>
          </form>

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

      {/* mobile search — full width under the logo */}
      <form onSubmit={onSearch} role="search" className="px-4 pb-4 md:hidden">
        <div className="flex h-11 items-center rounded-full border border-line bg-canvas pl-4 pr-1.5 focus-within:border-brand">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            className="w-full bg-transparent text-sm text-ink outline-none"
          />
          <button
            type="submit"
            aria-label="Search"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-white transition-colors hover:bg-brand-dark"
          >
            <SearchIcon />
          </button>
        </div>
      </form>

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
  color,
  children,
}: {
  label: string;
  href: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      style={{ ["--social" as string]: color }}
      className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-brand shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--social)] hover:bg-[var(--social)] hover:text-white hover:shadow-md"
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        {children}
      </svg>
    </a>
  );
}

function MessageIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
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

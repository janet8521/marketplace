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
    { href: "/#catalog", label: "All" },
    ...categories.map((c) => ({
      href: `/?category=${c.slug}#catalog`,
      label: c.name,
    })),
  ];

  return (
    <header className="relative isolate overflow-hidden bg-[#070713] text-white">
      {/* cosmic backdrop — deep space gradient + a scatter of stars so the
          frosted-glass panels above have something to blur. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(125% 125% at 50% -20%, #2a2a6e 0%, #13132e 45%, #070713 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, #fff, transparent), radial-gradient(1px 1px at 70% 60%, #fff, transparent), radial-gradient(1.5px 1.5px at 85% 25%, #fff, transparent), radial-gradient(1px 1px at 40% 80%, #c7d2fe, transparent), radial-gradient(1px 1px at 55% 12%, #a5b4fc, transparent), radial-gradient(1.5px 1.5px at 12% 70%, #fff, transparent)",
        }}
      />
      {/* top accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-fuchsia-500 to-blue-500" />

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
          className="max-w-[16rem] justify-self-center text-center text-lg font-extrabold uppercase leading-tight tracking-tight text-white [text-shadow:0_0_18px_rgba(129,140,248,0.55)] sm:max-w-none sm:text-2xl"
        >
          Thee Brins Safe Market
        </Link>

        {/* right: actions */}
        <div className="flex items-center justify-end gap-3 text-white">
          <a
            href={SOCIALS.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-blue-300"
            aria-label="Message us"
            title="Message us"
          >
            <MessageIcon />
          </a>
          <Link
            href="/cart"
            className="relative transition-colors hover:text-blue-300"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
          >
            <CartIcon />
            <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
              {itemCount}
            </span>
          </Link>

          {/* search bar — sits after the cart */}
          <form onSubmit={onSearch} role="search" className="hidden items-center md:flex">
            <div className="flex h-9 items-center rounded-full border border-white/20 bg-white/10 pl-3 pr-1 backdrop-blur-md focus-within:border-white/50">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                aria-label="Search products"
                className="w-28 bg-transparent text-sm text-white outline-none placeholder:text-white/60 lg:w-40"
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
        <div className="flex h-11 items-center rounded-full border border-white/20 bg-white/10 pl-4 pr-1.5 backdrop-blur-md focus-within:border-white/50">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/60"
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

      {/* nav — frosted glass panel */}
      <nav className="border-y border-white/10 bg-white/5 backdrop-blur-md">
        <ul
          className={`mx-auto max-w-6xl text-sm font-bold uppercase tracking-wide text-white sm:flex sm:flex-wrap sm:justify-center sm:gap-3 sm:px-6 sm:py-3 ${
            menuOpen ? "flex flex-col gap-2 p-4" : "hidden sm:flex"
          }`}
        >
          {navLinks.map((link, i) => (
            <li key={`${link.label}-${i}`}>
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-full border border-blue-400/40 bg-blue-500/10 px-4 py-2 text-center text-blue-50 backdrop-blur-sm transition-colors hover:border-blue-300 hover:bg-blue-500/30 hover:text-white"
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
      className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-[var(--social)] hover:bg-[var(--social)] hover:text-white hover:shadow-md"
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

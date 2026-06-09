"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-sm font-bold text-white">
            V
          </span>
          <span className="text-xl font-semibold uppercase tracking-tight">
            Thee Brins Safe Market
          </span>
        </Link>

        <div className="rounded-card border border-line bg-surface p-8 shadow-sm">
          <h1 className="text-xl font-semibold">Staff sign in</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Manage the marketplace catalog.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none focus:border-brand"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-ink-soft hover:text-ink"
        >
          ← Back to store
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

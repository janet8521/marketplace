// Shown when the app has no Supabase credentials yet. Renders the exact steps
// from the README so a fresh `npm run dev` is self-explanatory.
export function SetupNotice() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <span className="inline-flex items-center gap-2 rounded-full border border-line bg-brand-soft px-3 py-1 text-sm font-medium text-brand">
        Setup needed
      </span>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight">
        Connect Thee Brins Safe Market to Supabase
      </h1>
      <p className="mt-3 text-ink-soft">
        The marketplace needs a Supabase project for its database, auth, storage
        and realtime. Three quick steps:
      </p>

      <ol className="mt-8 space-y-5">
        <Step n={1} title="Create a project">
          Sign up at{" "}
          <a
            className="font-medium text-brand hover:text-brand-dark"
            href="https://supabase.com"
            target="_blank"
            rel="noreferrer"
          >
            supabase.com
          </a>{" "}
          and create a new project.
        </Step>
        <Step n={2} title="Run the SQL">
          In the project&apos;s SQL editor, run{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm">
            supabase/migrations/0001_init.sql
          </code>{" "}
          then{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm">
            supabase/seed.sql
          </code>
          .
        </Step>
        <Step n={3} title="Add credentials">
          Copy <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm">.env.example</code>{" "}
          to <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm">.env.local</code>,
          paste your project URL and anon key (Settings → API), then restart{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm">npm run dev</code>.
        </Step>
      </ol>

      <p className="mt-8 text-sm text-ink-soft">
        Full instructions are in <code className="rounded bg-white/10 px-1.5 py-0.5">README.md</code>.
      </p>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-white">
        {n}
      </span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-ink-soft">{children}</p>
      </div>
    </li>
  );
}

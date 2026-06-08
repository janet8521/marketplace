import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        Order placed!
      </h1>
      <p className="mt-3 text-ink-soft">
        Thank you for your order. Our team has received it and will be in touch
        by email to arrange fulfilment.
      </p>
      {order && (
        <p className="mt-4 inline-block rounded-full border border-line bg-surface px-4 py-2 font-mono text-sm">
          Order #{order.slice(0, 8).toUpperCase()}
        </p>
      )}
      <div className="mt-8">
        <LinkButton href="/">Continue shopping</LinkButton>
      </div>
      <Link
        href="/"
        className="mt-4 block text-sm text-ink-soft hover:text-ink"
      >
        Back to home
      </Link>
    </div>
  );
}

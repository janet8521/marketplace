import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ProductWithCategory } from "@/lib/types";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({ product }: { product: ProductWithCategory }) {
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-shadow hover:shadow-lg hover:shadow-black/5">
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-canvas"
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-ink-soft">
            No image
          </div>
        )}
        {product.stock <= 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-xs font-medium text-white">
            Sold out
          </span>
        )}
        {lowStock && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white">
            Only {product.stock} left
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {product.category && (
          <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">
            {product.category.name}
          </span>
        )}
        <Link href={`/products/${product.slug}`} className="mt-1">
          <h3 className="line-clamp-1 font-medium hover:text-brand">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-lg font-semibold">
            {formatPrice(product.price, product.currency)}
          </span>
          <AddToCartButton product={product} size="sm" className="shrink-0" />
        </div>
      </div>
    </div>
  );
}

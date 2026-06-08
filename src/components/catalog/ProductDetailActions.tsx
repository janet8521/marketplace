"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/lib/types";

export function ProductDetailActions({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        imageUrl: product.image_url,
        maxStock: product.stock,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (soldOut) {
    return (
      <Button disabled size="lg" className="w-full sm:w-auto">
        Sold out
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center rounded-full border border-line bg-surface">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="grid h-11 w-11 place-items-center text-lg text-ink-soft hover:text-ink"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-medium">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
          className="grid h-11 w-11 place-items-center text-lg text-ink-soft hover:text-ink"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <Button onClick={handleAdd} size="lg">
        {added ? "Added to cart ✓" : "Add to cart"}
      </Button>
    </div>
  );
}

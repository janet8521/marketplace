"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/lib/types";

export function AddToCartButton({
  product,
  size = "md",
  className,
}: {
  product: Pick<
    Product,
    "id" | "name" | "price" | "currency" | "image_url" | "stock"
  >;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      imageUrl: product.image_url,
      maxStock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Button
      onClick={handleAdd}
      disabled={soldOut}
      size={size}
      className={className}
    >
      {soldOut ? "Sold out" : added ? "Added ✓" : "Add to cart"}
    </Button>
  );
}

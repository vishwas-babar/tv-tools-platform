"use client";

import { useCart } from "@/contexts/cart-context";
import { formatDuration } from "@/lib/format";

interface PlanCardProps {
  planId: string;
  name: string;
  durationDays: number;
  price: number;
  toolId: string;
  toolName: string;
}

export function PlanCard({
  planId,
  name,
  durationDays,
  price,
  toolId,
  toolName,
}: PlanCardProps) {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(toolId, planId);

  function handleAddToCart() {
    addItem({
      toolId,
      toolName,
      planId,
      planName: name,
      price,
      durationDays,
    });
  }

  return (
    <div className="flex flex-col justify-between rounded-lg border border-border bg-surface p-4 text-center">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        <p className="mt-1 text-xs font-medium text-foreground-muted">
          {formatDuration(durationDays)}
        </p>
        <p className="mt-2 text-2xl font-bold text-foreground">
          ₹{price.toFixed(2)}
        </p>
      </div>
      <button
        onClick={handleAddToCart}
        disabled={inCart}
        className={`mt-4 w-full rounded px-3 py-2 text-sm font-medium transition-colors ${
          inCart
            ? "cursor-default border border-success/30 bg-success/10 text-success"
            : "bg-primary text-foreground hover:bg-primary-hover"
        }`}
      >
        {inCart ? "Added ✓" : "Add to Cart"}
      </button>
    </div>
  );
}

"use client";

import { useCart } from "@/contexts/cart-context";

interface PlanCardProps {
  planId: string;
  name: string;
  durationDays: number;
  price: number;
  toolId: string;
  toolName: string;
}

function formatDuration(days: number): string {
  if (days === 365) return "1 Year";
  if (days === 90) return "3 Months";
  if (days === 30) return "1 Month";
  if (days === 7) return "1 Week";
  return `${days} Days`;
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
    <div className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 text-center">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
        <p className="mt-1 text-xs font-medium text-gray-500">
          {formatDuration(durationDays)}
        </p>
        <p className="mt-2 text-2xl font-bold text-gray-900">
          ₹{price.toFixed(2)}
        </p>
      </div>
      <button
        onClick={handleAddToCart}
        disabled={inCart}
        className={`mt-4 w-full rounded px-3 py-2 text-sm font-medium transition-colors ${
          inCart
            ? "cursor-default border border-green-200 bg-green-50 text-green-700"
            : "bg-gray-900 text-white hover:bg-gray-700"
        }`}
      >
        {inCart ? "Added ✓" : "Add to Cart"}
      </button>
    </div>
  );
}

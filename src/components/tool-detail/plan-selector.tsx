"use client";

import { useCart } from "@/contexts/cart-context";
import { formatDuration, formatPrice } from "@/lib/format";

interface Plan {
  id: string;
  name: string;
  durationDays: number;
  price: number;
}

interface PlanSelectorProps {
  toolId: string;
  toolName: string;
  plans: Plan[];
}

export function PlanSelector({ toolId, toolName, plans }: PlanSelectorProps) {
  const { addItem, isInCart } = useCart();

  if (plans.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 text-center">
        <p className="text-sm text-foreground-muted">
          Plans for this tool are coming soon.
        </p>
      </div>
    );
  }

  const sortedPlans = [...plans].sort((a, b) => a.price - b.price);
  const startingPrice = sortedPlans[0].price;
  const bestValueId = sortedPlans.reduce((best, plan) => {
    const bestPerDay = best.price / best.durationDays;
    const planPerDay = plan.price / plan.durationDays;
    return planPerDay < bestPerDay ? plan : best;
  }).id;

  return (
    <div className="rounded-2xl border border-white/10 bg-surface/80 p-6 shadow-xl shadow-primary/5 backdrop-blur-sm">
      <p className="text-sm text-foreground-muted">Starting from</p>
      <p className="mt-1 text-3xl font-bold text-foreground">
        {formatPrice(startingPrice)}
      </p>
      <p className="mt-1 text-xs text-foreground-muted">
        {sortedPlans.length} plan{sortedPlans.length !== 1 ? "s" : ""} available
      </p>

      <div className="mt-6 space-y-3">
        {sortedPlans.map((plan) => {
          const inCart = isInCart(toolId, plan.id);
          const isBestValue = plan.id === bestValueId && sortedPlans.length > 1;

          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-4 transition-colors ${
                isBestValue
                  ? "border-primary/40 bg-primary/10"
                  : "border-border bg-surface-elevated/50"
              }`}
            >
              {isBestValue && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
                  Best Value
                </span>
              )}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{plan.name}</p>
                  <p className="text-xs text-foreground-muted">
                    {formatDuration(plan.durationDays)}
                  </p>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {formatPrice(plan.price)}
                </p>
              </div>

              <button
                onClick={() =>
                  addItem({
                    toolId,
                    toolName,
                    planId: plan.id,
                    planName: plan.name,
                    price: plan.price,
                    durationDays: plan.durationDays,
                  })
                }
                disabled={inCart}
                className={`mt-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  inCart
                    ? "cursor-default border border-success/30 bg-success/10 text-success"
                    : "bg-primary text-foreground hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20"
                }`}
              >
                {inCart ? "Added to Cart ✓" : "Add to Cart"}
              </button>
            </div>
          );
        })}
      </div>

      <ul className="mt-6 space-y-2.5 border-t border-border pt-5">
        {TRUST_POINTS.map((point) => (
          <li
            key={point}
            className="flex items-center gap-2 text-xs text-foreground-secondary"
          >
            <CheckIcon />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

const TRUST_POINTS = [
  "Instant TradingView access",
  "Secure payment via Cashfree",
  "Works on all timeframes",
  "Priority support included",
];

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-success"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

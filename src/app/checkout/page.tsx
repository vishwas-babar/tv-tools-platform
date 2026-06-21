"use client";

import { useCart } from "@/contexts/cart-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/axios";
import { formatDuration, formatPrice } from "@/lib/format";
import { load } from "@cashfreepayments/cashfree-js";

type AppliedCoupon = {
  couponCode: string;
  discountLabel: string;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
};

export default function CheckoutPage() {
  const { items, totalAmount, itemCount } = useCart();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null,
  );

  const payableTotal = appliedCoupon?.totalAmount ?? totalAmount;
  const isFreeCheckout = payableTotal === 0;

  async function handleApplyCoupon() {
    const code = couponInput.trim();
    if (!code) return;

    setCouponError(null);
    setCouponLoading(true);

    try {
      const { data: res } = await api.post<{
        success: boolean;
        data: AppliedCoupon & { discountType: string };
        error?: string;
      }>("/checkout/validate-coupon", {
        couponCode: code,
        items: items.map((item) => ({
          toolId: item.toolId,
          planId: item.planId,
        })),
      });

      if (!res.success || !res.data) {
        throw new Error(res.error || "Failed to apply coupon");
      }

      setAppliedCoupon(res.data);
      setCouponInput(res.data.couponCode);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(
        err instanceof Error ? err.message : "Failed to apply coupon",
      );
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  }

  async function handlePayment() {
    if (items.length === 0) return;
    setError(null);
    setProcessing(true);

    try {
      const { data: res } = await api.post<{
        success: boolean;
        data: {
          payment_session_id?: string;
          cashfree_order_id: string;
          is_free?: boolean;
        };
        error?: string;
      }>("/checkout/create-order", {
        items: items.map((item) => ({
          toolId: item.toolId,
          planId: item.planId,
        })),
        ...(appliedCoupon ? { couponCode: appliedCoupon.couponCode } : {}),
      });

      if (!res.success || !res.data?.cashfree_order_id) {
        throw new Error(res.error || "Failed to create order");
      }

      if (res.data.is_free) {
        router.push(`/checkout/status?order_id=${res.data.cashfree_order_id}`);
        return;
      }

      if (!res.data.payment_session_id) {
        throw new Error("Failed to create payment session");
      }

      const cashfreeEnv = process.env.NEXT_PUBLIC_CASHFREE_ENV || "sandbox";
      const cashfree = await load({
        mode: cashfreeEnv as "sandbox" | "production",
      });

      if (!cashfree) {
        throw new Error("Failed to load payment gateway");
      }

      const result = await cashfree.checkout({
        paymentSessionId: res.data.payment_session_id,
        redirectTarget: "_self",
      });

      if (result.error) {
        setError(result.error.message || "Payment failed");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setProcessing(false);
    }
  }

  if (itemCount === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
          className="mx-auto mb-4 h-16 w-16 text-foreground-muted"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
          />
        </svg>
        <h1 className="text-2xl font-bold text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-foreground-secondary">
          Add some tools to your cart before checking out.
        </p>
        <button
          onClick={() => router.push("/tools")}
          className="mt-6 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-foreground hover:bg-primary-hover transition-colors"
        >
          Browse Tools
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
      <p className="mt-1 text-foreground-secondary">
        Review your cart and complete your purchase.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="mt-8 rounded-lg border border-border bg-surface">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Order Summary ({itemCount} {itemCount === 1 ? "item" : "items"})
          </h2>
        </div>

        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li
              key={`${item.toolId}-${item.planId}`}
              className="flex items-center justify-between px-6 py-4"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {item.toolName}
                </p>
                <p className="text-xs text-foreground-muted">
                  {item.planName} · {formatDuration(item.durationDays)}
                </p>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {formatPrice(item.price)}
              </p>
            </li>
          ))}
        </ul>

        <div className="border-t border-border px-6 py-4">
          <label
            htmlFor="coupon-code"
            className="block text-sm font-medium text-foreground-secondary"
          >
            Coupon code
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="coupon-code"
              type="text"
              value={couponInput}
              onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
              disabled={Boolean(appliedCoupon) || couponLoading}
              placeholder="Enter code"
              className="flex-1 rounded border border-border-subtle px-3 py-2 text-sm uppercase focus:border-primary focus:outline-none disabled:bg-surface-elevated"
            />
            {appliedCoupon ? (
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="rounded border border-border-subtle px-4 py-2 text-sm font-medium text-foreground-secondary hover:bg-surface-elevated"
              >
                Remove
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponInput.trim()}
                className="rounded bg-surface-elevated px-4 py-2 text-sm font-medium text-foreground hover:bg-border disabled:opacity-50"
              >
                {couponLoading ? "Applying..." : "Apply"}
              </button>
            )}
          </div>
          {couponError && (
            <p className="mt-2 text-sm text-danger">{couponError}</p>
          )}
          {appliedCoupon && (
            <p className="mt-2 text-sm text-success">
              {appliedCoupon.couponCode} applied ({appliedCoupon.discountLabel})
            </p>
          )}
        </div>

        <div className="space-y-2 border-t border-border px-6 py-4">
          <div className="flex items-center justify-between text-sm text-foreground-secondary">
            <span>Subtotal</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
          {appliedCoupon && (
            <div className="flex items-center justify-between text-sm text-success">
              <span>Discount ({appliedCoupon.couponCode})</span>
              <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-base font-semibold text-foreground">Total</span>
            <span className="text-xl font-bold text-foreground">
              {formatPrice(payableTotal)}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={processing}
        className="mt-6 w-full rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Processing...
          </span>
        ) : isFreeCheckout ? (
          "Complete order (Free)"
        ) : (
          `Pay ${formatPrice(payableTotal)}`
        )}
      </button>

      <p className="mt-4 text-center text-xs text-foreground-muted">
        {isFreeCheckout
          ? "No payment required — your coupon covers the full order amount."
          : "Payments are securely processed by Cashfree. Your card details are never stored on our servers."}
      </p>
    </div>
  );
}

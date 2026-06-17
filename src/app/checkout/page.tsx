"use client";

import { useCart } from "@/contexts/cart-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/axios";
import { load } from "@cashfreepayments/cashfree-js";

function formatDuration(days: number): string {
  if (days === 365) return "1 Year";
  if (days === 90) return "3 Months";
  if (days === 30) return "1 Month";
  if (days === 7) return "1 Week";
  return `${days} Days`;
}

export default function CheckoutPage() {
  const { items, totalAmount, itemCount } = useCart();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePayment() {
    if (items.length === 0) return;
    setError(null);
    setProcessing(true);

    try {
      // 1. Create order on the server
      const { data: res } = await api.post<{
        success: boolean;
        data: { payment_session_id: string; cashfree_order_id: string };
        error?: string;
      }>("/checkout/create-order", {
        items: items.map((item) => ({
          toolId: item.toolId,
          planId: item.planId,
        })),
      });

      if (!res.success || !res.data?.payment_session_id) {
        throw new Error(res.error || "Failed to create order");
      }

      // 2. Initialize Cashfree JS SDK
      const cashfreeEnv = process.env.NEXT_PUBLIC_CASHFREE_ENV || "sandbox";
      const cashfree = await load({
        mode: cashfreeEnv as "sandbox" | "production",
      });

      if (!cashfree) {
        throw new Error("Failed to load payment gateway");
      }

      // 3. Open Cashfree checkout
      const result = await cashfree.checkout({
        paymentSessionId: res.data.payment_session_id,
        redirectTarget: "_self",
      });

      // If we reach here (shouldn't with _self redirect), handle it
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
          className="mx-auto mb-4 h-16 w-16 text-gray-300"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
          />
        </svg>
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-gray-600">
          Add some tools to your cart before checking out.
        </p>
        <button
          onClick={() => router.push("/tools")}
          className="mt-6 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          Browse Tools
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      <p className="mt-1 text-gray-600">
        Review your cart and complete your purchase.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Order Summary */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Order Summary ({itemCount} {itemCount === 1 ? "item" : "items"})
          </h2>
        </div>

        <ul className="divide-y divide-gray-100">
          {items.map((item) => (
            <li
              key={`${item.toolId}-${item.planId}`}
              className="flex items-center justify-between px-6 py-4"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {item.toolName}
                </p>
                <p className="text-xs text-gray-500">
                  {item.planName} · {formatDuration(item.durationDays)}
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                ₹{item.price.toFixed(2)}
              </p>
            </li>
          ))}
        </ul>

        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold text-gray-900">
              ₹{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={processing}
        className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        ) : (
          `Pay ₹${totalAmount.toFixed(2)}`
        )}
      </button>

      <p className="mt-4 text-center text-xs text-gray-500">
        Payments are securely processed by Cashfree. Your card details are never
        stored on our servers.
      </p>
    </div>
  );
}

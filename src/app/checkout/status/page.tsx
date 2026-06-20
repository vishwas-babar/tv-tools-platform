"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { useCart } from "@/contexts/cart-context";
import Link from "next/link";

interface OrderItem {
  tool: string;
  plan: string;
  durationDays: number;
}

interface VerifyResult {
  status: "PAID" | "FAILED" | "EXPIRED" | "PENDING";
  order_id: string;
  amount?: number;
  items?: OrderItem[];
}

function CheckoutStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const orderId = searchParams.get("order_id");

  const verifyPayment = useCallback(async () => {
    if (!orderId) {
      setError("Missing order ID");
      setLoading(false);
      return;
    }

    try {
      const { data: res } = await api.get<{
        success: boolean;
        data: VerifyResult;
        error?: string;
      }>(`/checkout/verify?order_id=${orderId}`);

      if (!res.success) {
        throw new Error(res.error || "Verification failed");
      }

      setResult(res.data);

      // If payment is successful, clear the cart
      if (res.data.status === "PAID") {
        clearCart();
      }

      // If still pending, retry after a delay (max 5 retries)
      if (res.data.status === "PENDING" && retryCount < 5) {
        setTimeout(() => {
          setRetryCount((c) => c + 1);
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }, [orderId, clearCart, retryCount]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  if (!orderId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Invalid Request</h1>
        <p className="mt-2 text-foreground-secondary">No order ID provided.</p>
        <button
          onClick={() => router.push("/tools")}
          className="mt-6 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-foreground hover:bg-primary-hover"
        >
          Browse Tools
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-border border-t-primary" />
        <h1 className="text-2xl font-bold text-foreground">
          Verifying Payment...
        </h1>
        <p className="mt-2 text-foreground-secondary">
          Please wait while we confirm your payment.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-8 w-8 text-danger"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Verification Error
        </h1>
        <p className="mt-2 text-foreground-secondary">{error}</p>
        <button
          onClick={() => router.push("/tools")}
          className="mt-6 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-foreground hover:bg-primary-hover"
        >
          Browse Tools
        </button>
      </div>
    );
  }

  if (!result) return null;

  // ── PAID ──
  if (result.status === "PAID") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-8 w-8 text-success"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
        <p className="mt-2 text-foreground-secondary">
          Thank you for your purchase. Your payment has been confirmed.
        </p>
        <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-left">
          <p className="text-sm text-warning">
            TradingView tool access is granted manually. Your subscription will
            be activated within 24 hours on your TradingView account.
          </p>
        </div>

        {result.amount && (
          <p className="mt-4 text-lg font-semibold text-foreground">
            Amount Paid: ₹{result.amount.toFixed(2)}
          </p>
        )}

        {result.items && result.items.length > 0 && (
          <div className="mt-6 rounded-lg border border-border bg-surface text-left">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">
                Purchased Subscriptions
              </h3>
            </div>
            <ul className="divide-y divide-border">
              {result.items.map((item, index) => (
                <li key={index} className="px-4 py-3">
                  <p className="text-sm font-medium text-foreground">
                    {item.tool}
                  </p>
                  <p className="text-xs text-foreground-muted">
                    {item.plan} · {item.durationDays} days
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/purchases"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-foreground hover:bg-primary-hover"
          >
            View Purchases
          </Link>
          <Link
            href="/tools"
            className="rounded-lg border border-border-subtle px-6 py-3 text-sm font-medium text-foreground-secondary hover:bg-surface-elevated"
          >
            Browse More Tools
          </Link>
        </div>
      </div>
    );
  }

  // ── PENDING ──
  if (result.status === "PENDING") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-border border-t-warning" />
        <h1 className="text-2xl font-bold text-foreground">Payment Pending</h1>
        <p className="mt-2 text-foreground-secondary">
          Your payment is still being processed. This page will update
          automatically.
        </p>
        {retryCount >= 5 && (
          <p className="mt-4 text-sm text-foreground-muted">
            Taking longer than expected. Your subscription will be activated
            once payment is confirmed. Check back on your{" "}
            <Link
              href="/purchases"
              className="text-primary-light hover:text-primary"
            >
              Purchases
            </Link>{" "}
            page.
          </p>
        )}
      </div>
    );
  }

  // ── FAILED / EXPIRED ──
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-8 w-8 text-danger"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-foreground">Payment Failed</h1>
      <p className="mt-2 text-foreground-secondary">
        Your payment could not be processed. No charges were made.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={() => router.push("/checkout")}
          className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-foreground hover:bg-primary-hover"
        >
          Try Again
        </button>
        <Link
          href="/tools"
          className="rounded-lg border border-border-subtle px-6 py-3 text-sm font-medium text-foreground-secondary hover:bg-surface-elevated"
        >
          Browse Tools
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-border border-t-primary" />
          <h1 className="text-2xl font-bold text-foreground">Loading...</h1>
        </div>
      }
    >
      <CheckoutStatusContent />
    </Suspense>
  );
}

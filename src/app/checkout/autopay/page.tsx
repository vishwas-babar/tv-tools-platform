"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/axios";
import { load } from "@cashfreepayments/cashfree-js";
import { useRestoreCheckoutSession } from "@/hooks/use-restore-checkout-session";

type AutopaySession = {
  subscriptionId: string;
  subscriptionSessionId: string;
  toolName: string;
  authorized: boolean;
};

function AutopayCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const returnToken = searchParams.get("token");
  const sessionReady = useRestoreCheckoutSession(orderId, returnToken);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Preparing autopay setup...");

  useEffect(() => {
    if (!orderId || !sessionReady) {
      if (!orderId) setError("Missing order reference.");
      return;
    }

    let cancelled = false;

    async function startAutopayCheckout() {
      try {
        const { data: res } = await api.get<{
          success: boolean;
          data: {
            order_status: string;
            next_session: AutopaySession | null;
            all_authorized: boolean;
            pending_count: number;
          };
          error?: string;
        }>("/checkout/autopay-sessions", {
          params: {
            order_id: orderId,
            ...(returnToken ? { token: returnToken } : {}),
          },
        });

        if (cancelled) return;

        if (!res.success || !res.data) {
          throw new Error(res.error || "Failed to load autopay session");
        }

        if (res.data.all_authorized || !res.data.next_session) {
          router.replace(
            returnToken
              ? `/checkout/status?order_id=${orderId}&token=${encodeURIComponent(returnToken)}`
              : `/checkout/status?order_id=${orderId}`,
          );
          return;
        }

        const nextSession = res.data.next_session;

        setStatusMessage(
          res.data.pending_count > 1
            ? `Setting up autopay for ${nextSession.toolName}. ${res.data.pending_count} tools remaining.`
            : `Setting up autopay for ${nextSession.toolName}...`,
        );

        const cashfreeEnv = process.env.NEXT_PUBLIC_CASHFREE_ENV || "sandbox";
        const cashfree = await load({
          mode: cashfreeEnv as "sandbox" | "production",
        });

        if (!cashfree) {
          throw new Error("Failed to load payment gateway");
        }

        const result = await cashfree.subscriptionsCheckout({
          subsSessionId: nextSession.subscriptionSessionId,
          redirectTarget: "_self",
        });

        if (result.error) {
          throw new Error(result.error.message || "Autopay setup failed");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Autopay setup failed");
        }
      }
    }

    startAutopayCheckout();

    return () => {
      cancelled = true;
    };
  }, [orderId, returnToken, sessionReady, router]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Autopay setup failed</h1>
        <p className="mt-3 text-sm text-danger">{error}</p>
        <button
          type="button"
          onClick={() => router.push("/checkout")}
          className="mt-6 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-foreground hover:bg-primary-hover"
        >
          Back to checkout
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <svg
        className="mx-auto h-10 w-10 animate-spin text-primary"
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
      <h1 className="mt-6 text-2xl font-bold text-foreground">Setting up autopay</h1>
      <p className="mt-2 text-sm text-foreground-secondary">{statusMessage}</p>
      <p className="mt-4 text-xs text-foreground-muted">
        You&apos;ll be redirected to authorize recurring payments securely via Cashfree.
      </p>
    </div>
  );
}

export default function AutopayCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-16 text-center text-foreground-secondary">
          Loading autopay checkout...
        </div>
      }
    >
      <AutopayCheckoutContent />
    </Suspense>
  );
}

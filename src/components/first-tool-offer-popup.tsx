"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { formatPrice } from "@/lib/format";

const DISMISS_KEY = "first-tool-offer-dismissed";

export function FirstToolOfferPopup() {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(DISMISS_KEY)) {
      return;
    }

    let cancelled = false;
    api
      .get<{ success: boolean; data: { eligible: boolean; price: number } }>(
        "/offers/first-tool",
      )
      .then(({ data }) => {
        if (cancelled || !data.success || !data.data.eligible) return;
        setPrice(data.data.price);
        setOpen(true);
      })
      .catch(() => {
        /* offer is optional — ignore failures */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function dismiss() {
    setOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DISMISS_KEY, "1");
    }
  }

  if (!open || price === null) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-tool-offer-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-primary/30 bg-surface shadow-2xl shadow-primary/10">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1.5 text-foreground-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="bg-linear-to-br from-primary/20 to-transparent px-6 pt-8 text-center">
          <span className="text-4xl">🎉</span>
          <h2
            id="first-tool-offer-title"
            className="mt-3 text-2xl font-bold text-foreground"
          >
            Get your first tool at just {formatPrice(price)}
          </h2>
          <p className="mt-2 text-sm text-foreground-secondary">
            Welcome offer for new users! Pick any single tool and pay just{" "}
            {formatPrice(price)} for the first month. After that, autopay will
            charge the regular plan price automatically, no coupon needed.
          </p>
        </div>

        <div className="px-6 py-6">
          <button
            type="button"
            onClick={dismiss}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-primary-hover"
          >
            Browse tools & claim offer
          </button>
          <p className="mt-3 text-center text-xs text-foreground-muted">
            Offer valid on your first purchase only. Autopay starts from the
            next billing cycle at the regular plan price.
          </p>
        </div>
      </div>
    </div>
  );
}
